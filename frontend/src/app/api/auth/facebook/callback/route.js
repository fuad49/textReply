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

        // Dynamic imports
        const facebookService = await import('@/lib/facebook');
        const { findOrCreateUser, updateUser } = await import('@/lib/models');

        // Exchange code for access token
        const accessToken = await facebookService.exchangeCodeForToken(code, redirectUri);

        // Get user profile
        const profile = await facebookService.getUserProfile(accessToken);

        // Create or find user
        let user = await findOrCreateUser(profile.id, {
            name: profile.name,
            email: profile.email || null,
            accessToken,
            profilePicture: profile.picture?.data?.url || null,
        });

        // Update token and profile on each login
        user = await updateUser(user.id, {
            accessToken,
            name: profile.name,
            profilePicture: profile.picture?.data?.url,
        });

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || `https://${host}`;
        return NextResponse.redirect(`${frontendUrl}/dashboard?token=${token}`);
    } catch (error) {
        console.error('OAuth callback error:', error.message);
        const host = request.headers.get('host');
        const frontendUrl = process.env.FRONTEND_URL || `https://${host}`;
        return NextResponse.redirect(`${frontendUrl}/?error=auth_failed`);
    }
}
