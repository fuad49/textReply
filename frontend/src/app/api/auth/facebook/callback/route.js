import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        if (!code) {
            const frontendUrl = process.env.FRONTEND_URL || `https://${request.headers.get('host')}`;
            return NextResponse.redirect(`${frontendUrl}/?error=no_code`);
        }

        const protocol = 'https';
        const host = request.headers.get('host');
        const redirectUri = `${protocol}://${host}/api/auth/facebook/callback`;

        // Dynamic imports - only load at runtime
        const facebookService = await import('@/lib/facebook');
        const { ensureDbSync } = await import('@/lib/models');

        // Exchange code for access token
        const accessToken = await facebookService.exchangeCodeForToken(code, redirectUri);

        // Get user profile
        const profile = await facebookService.getUserProfile(accessToken);

        // Lazy load models
        const { User } = await ensureDbSync();

        // Create or update user in DB
        const [user] = await User.findOrCreate({
            where: { facebookId: profile.id },
            defaults: {
                name: profile.name,
                email: profile.email || null,
                accessToken,
                profilePicture: profile.picture?.data?.url || null,
            },
        });

        // Update token and profile on each login
        user.accessToken = accessToken;
        user.name = profile.name;
        user.profilePicture = profile.picture?.data?.url || user.profilePicture;
        await user.save();

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // Redirect to frontend with token - use Vercel URL
        const frontendUrl = process.env.FRONTEND_URL || `https://${host}`;
        return NextResponse.redirect(`${frontendUrl}/dashboard?token=${token}`);
    } catch (error) {
        console.error('OAuth callback error:', error.message);
        const host = request.headers.get('host');
        const frontendUrl = process.env.FRONTEND_URL || `https://${host}`;
        return NextResponse.redirect(`${frontendUrl}/?error=auth_failed`);
    }
}
