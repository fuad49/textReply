const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../models');
const facebookService = require('../services/facebook');

const router = express.Router();

/**
 * GET /api/auth/facebook
 * Redirect user to Facebook OAuth consent screen
 */
router.get('/facebook', (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`;
    const scope = 'email,pages_show_list,pages_messaging,pages_manage_metadata,pages_read_engagement';

    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
        `client_id=${process.env.FB_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${scope}` +
        `&response_type=code`;

    res.redirect(authUrl);
});

/**
 * GET /api/auth/facebook/callback
 * Handle the OAuth callback, exchange code for token, create/update user
 */
router.get('/facebook/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
        }

        const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/facebook/callback`;

        // Exchange code for access token
        const { data: tokenData } = await axios.get(
            'https://graph.facebook.com/v21.0/oauth/access_token',
            {
                params: {
                    client_id: process.env.FB_APP_ID,
                    client_secret: process.env.FB_APP_SECRET,
                    redirect_uri: redirectUri,
                    code,
                },
            }
        );

        const accessToken = tokenData.access_token;

        // Get long-lived token
        let longLivedToken;
        try {
            longLivedToken = await facebookService.getLongLivedToken(accessToken);
        } catch {
            longLivedToken = accessToken; // fallback to short-lived
        }

        // Get user profile
        const profile = await facebookService.getUserProfile(longLivedToken);

        // Create or update user
        const [user] = await User.upsert({
            facebookId: profile.id,
            name: profile.name,
            email: profile.email || null,
            accessToken: longLivedToken,
            profilePicture: profile.picture?.data?.url || null,
        }, {
            returning: true,
        });

        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user.id, facebookId: user.facebookId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${jwtToken}`);
    } catch (error) {
        console.error('Facebook OAuth callback error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }
});

/**
 * GET /api/auth/me
 * Return current authenticated user profile
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'name', 'email', 'profilePicture', 'facebookId'],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Auth /me error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
