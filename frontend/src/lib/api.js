const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * API client for the TextReply backend
 */

function getToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('textreply_token');
    }
    return null;
}

function setToken(token) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('textreply_token', token);
    }
}

function removeToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('textreply_token');
    }
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        removeToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        throw new Error('Unauthorized');
    }

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Auth
export const getMe = () => apiFetch('/api/auth/me');
export const getLoginUrl = () => `${API_URL}/api/auth/facebook`;

// Pages
export const getAvailablePages = () => apiFetch('/api/pages');
export const getConnectedPages = () => apiFetch('/api/pages/connected');
export const connectPage = (pageId) =>
    apiFetch('/api/pages/connect', {
        method: 'POST',
        body: JSON.stringify({ pageId }),
    });
export const updatePageContext = (id, systemPrompt, context) =>
    apiFetch(`/api/pages/${id}/context`, {
        method: 'PUT',
        body: JSON.stringify({ systemPrompt, context }),
    });
export const togglePage = (id) =>
    apiFetch(`/api/pages/${id}/toggle`, {
        method: 'PUT',
    });
export const disconnectPage = (id) =>
    apiFetch(`/api/pages/${id}`, {
        method: 'DELETE',
    });

// Conversations
export const getConversations = (pageId) =>
    apiFetch(`/api/pages/${pageId}/conversations`);
export const getMessages = (pageId, conversationId) =>
    apiFetch(`/api/pages/${pageId}/conversations/${conversationId}/messages`);

export { getToken, setToken, removeToken };
