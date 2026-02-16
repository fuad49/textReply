const axios = require('axios');

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

/**
 * Exchange a short-lived user token for a long-lived one
 */
async function getLongLivedToken(shortLivedToken) {
    const { data } = await axios.get(`${GRAPH_API_BASE}/oauth/access_token`, {
        params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FB_APP_ID,
            client_secret: process.env.FB_APP_SECRET,
            fb_exchange_token: shortLivedToken,
        },
    });
    return data.access_token;
}

/**
 * Get user profile from Facebook
 */
async function getUserProfile(accessToken) {
    const { data } = await axios.get(`${GRAPH_API_BASE}/me`, {
        params: {
            fields: 'id,name,email,picture.type(large)',
            access_token: accessToken,
        },
    });
    return data;
}

/**
 * Get Facebook Pages the user administrates
 */
async function getUserPages(accessToken) {
    const { data } = await axios.get(`${GRAPH_API_BASE}/me/accounts`, {
        params: {
            fields: 'id,name,access_token,picture.type(large),fan_count,category',
            access_token: accessToken,
        },
    });
    return data.data || [];
}

/**
 * Subscribe a Facebook Page to the app's webhooks for messaging
 */
async function subscribePageWebhook(pageId, pageAccessToken) {
    const { data } = await axios.post(
        `${GRAPH_API_BASE}/${pageId}/subscribed_apps`,
        null,
        {
            params: {
                subscribed_fields: 'messages,messaging_postbacks,messaging_optins',
                access_token: pageAccessToken,
            },
        }
    );
    return data;
}

/**
 * Send a text message reply via the Facebook Send API
 */
async function sendMessage(pageAccessToken, recipientId, text) {
    const { data } = await axios.post(
        `${GRAPH_API_BASE}/me/messages`,
        {
            recipient: { id: recipientId },
            message: { text },
            messaging_type: 'RESPONSE',
        },
        {
            params: { access_token: pageAccessToken },
        }
    );
    return data;
}

/**
 * Get the sender's profile info
 */
async function getSenderProfile(senderId, pageAccessToken) {
    try {
        const { data } = await axios.get(`${GRAPH_API_BASE}/${senderId}`, {
            params: {
                fields: 'first_name,last_name,profile_pic',
                access_token: pageAccessToken,
            },
        });
        return {
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown User',
            profilePic: data.profile_pic || null,
        };
    } catch (err) {
        console.error('Could not fetch sender profile:', err.message);
        return { name: 'Unknown User', profilePic: null };
    }
}

module.exports = {
    getLongLivedToken,
    getUserProfile,
    getUserPages,
    subscribePageWebhook,
    sendMessage,
    getSenderProfile,
};
