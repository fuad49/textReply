import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import * as facebookService from '@/lib/facebook';
import { User, ensureDbSync } from '@/lib/models';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(
                `${process.env.FRONTEND_URL || url.origin}/?error=no_code`
            );
        }

        const protocol = url.protocol;
        const host = request.headers.get('host') || url.host;
        const redirectUri = `${protocol}//${host}/api/auth/facebook/callback`;

        // Exchange code for access token
        const accessToken = await facebookService.exchangeCodeForToken(code, redirectUri);

        // Get user profile
        const profile = await facebookService.getUserProfile(accessToken);

        // Create or update user in DB
        await ensureDbSync();
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

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || url.origin;
        return NextResponse.redirect(`${frontendUrl}/dashboard?token=${token}`);
    } catch (error) {
        console.error('OAuth callback error:', error.message);
        const url = new URL(request.url);
        const frontendUrl = process.env.FRONTEND_URL || url.origin;
        return NextResponse.redirect(`${frontendUrl}/?error=auth_failed`);
    }
}
