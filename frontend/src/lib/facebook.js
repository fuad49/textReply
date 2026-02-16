import axios from 'axios';

const FB_GRAPH_URL = 'https://graph.facebook.com/v21.0';

export async function exchangeCodeForToken(code, redirectUri) {
    const { data } = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
        params: {
            client_id: process.env.FB_APP_ID,
            client_secret: process.env.FB_APP_SECRET,
            redirect_uri: redirectUri,
            code,
        },
    });
    return data.access_token;
}

export async function getUserProfile(accessToken) {
    const { data } = await axios.get(`${FB_GRAPH_URL}/me`, {
        params: {
            fields: 'id,name,email,picture.type(large)',
            access_token: accessToken,
        },
    });
    return data;
}

export async function getUserPages(accessToken) {
    const { data } = await axios.get(`${FB_GRAPH_URL}/me/accounts`, {
        params: {
            fields: 'id,name,access_token,picture,fan_count,category',
            access_token: accessToken,
        },
    });
    return data.data || [];
}

export async function subscribePageWebhook(pageId, pageAccessToken) {
    await axios.post(
        `${FB_GRAPH_URL}/${pageId}/subscribed_apps`,
        {
            subscribed_fields: 'messages,messaging_postbacks',
        },
        {
            params: { access_token: pageAccessToken },
        }
    );
}

export async function sendMessage(pageAccessToken, recipientId, messageText) {
    await axios.post(
        `${FB_GRAPH_URL}/me/messages`,
        {
            recipient: { id: recipientId },
            message: { text: messageText },
            messaging_type: 'RESPONSE',
        },
        {
            params: { access_token: pageAccessToken },
        }
    );
}

export async function getSenderProfile(senderId, pageAccessToken) {
    try {
        const { data } = await axios.get(`${FB_GRAPH_URL}/${senderId}`, {
            params: {
                fields: 'first_name,last_name,profile_pic',
                access_token: pageAccessToken,
            },
        });
        return {
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown User',
            profilePic: data.profile_pic || null,
        };
    } catch {
        return { name: 'Unknown User', profilePic: null };
    }
}
