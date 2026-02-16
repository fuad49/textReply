'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    getToken,
    removeToken,
    getMe,
    getConnectedPages,
    getAvailablePages,
    connectPage,
    updatePageContext,
    togglePage,
    disconnectPage,
} from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [connectedPages, setConnectedPages] = useState([]);
    const [availablePages, setAvailablePages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(null);
    const [contextEdits, setContextEdits] = useState({}); // { [pageId]: { systemPrompt, context } }

    useEffect(() => {
        // Check for token in URL (from OAuth callback)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
            localStorage.setItem('textreply_token', urlToken);
            // Clean URL
            window.history.replaceState({}, '', '/dashboard');
        }

        const token = getToken();
        if (!token) {
            router.push('/');
            return;
        }

        loadData();
    }, [router]);

    async function loadData() {
        try {
            const [meData, pagesData] = await Promise.all([
                getMe(),
                getConnectedPages(),
            ]);
            setUser(meData.user);
            setConnectedPages(pagesData.pages);
        } catch (err) {
            console.error('Failed to load data:', err);
            if (err.message === 'Unauthorized') {
                router.push('/');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleShowConnect() {
        try {
            const data = await getAvailablePages();
            setAvailablePages(data.pages);
            setShowModal(true);
        } catch (err) {
            console.error('Failed to fetch pages:', err);
            alert('Failed to fetch your Facebook Pages. Make sure you have granted page permissions.');
        }
    }

    async function handleConnect(pageId) {
        try {
            setConnecting(pageId);
            await connectPage(pageId);
            setShowModal(false);
            await loadData();
        } catch (err) {
            console.error('Connect error:', err);
            alert(err.message || 'Failed to connect page');
        } finally {
            setConnecting(null);
        }
    }

    async function handleSaveContext(pageDbId) {
        try {
            const edits = contextEdits[pageDbId];
            if (!edits) return;
            await updatePageContext(pageDbId, edits.systemPrompt, edits.context);
            await loadData();
            setContextEdits((prev) => {
                const copy = { ...prev };
                delete copy[pageDbId];
                return copy;
            });
        } catch (err) {
            console.error('Save context error:', err);
            alert('Failed to save settings');
        }
    }

    async function handleToggle(pageDbId) {
        try {
            await togglePage(pageDbId);
            await loadData();
        } catch (err) {
            console.error('Toggle error:', err);
        }
    }

    async function handleDisconnect(pageDbId) {
        if (!confirm('Are you sure you want to disconnect this page?')) return;
        try {
            await disconnectPage(pageDbId);
            await loadData();
        } catch (err) {
            console.error('Disconnect error:', err);
            alert('Failed to disconnect page');
        }
    }

    function handleLogout() {
        removeToken();
        router.push('/');
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" />
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    const totalConversations = connectedPages.reduce(
        (sum, p) => sum + (p.conversationCount || 0),
        0
    );
    const activePages = connectedPages.filter((p) => p.isActive).length;

    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <Link href="/dashboard" className="navbar-brand">
                    <div className="navbar-logo">💬</div>
                    <span className="navbar-title">TextReply</span>
                </Link>
                <div className="navbar-user">
                    {user?.profilePicture && (
                        <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="navbar-avatar"
                        />
                    )}
                    <span className="navbar-name">{user?.name}</span>
                    <button className="btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Dashboard */}
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Manage your connected Facebook Pages and AI settings</p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <div className="stat-value">{connectedPages.length}</div>
                        <div className="stat-label">Connected Pages</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{activePages}</div>
                        <div className="stat-label">Active Auto-Reply</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💬</div>
                        <div className="stat-value">{totalConversations}</div>
                        <div className="stat-label">Total Conversations</div>
                    </div>
                </div>

                {/* Connected Pages */}
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Connected Pages</h2>
                        <button className="btn-primary" onClick={handleShowConnect}>
                            + Connect Page
                        </button>
                    </div>

                    {connectedPages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📄</div>
                            <h3>No pages connected yet</h3>
                            <p>
                                Connect a Facebook Page to start auto-replying with AI
                            </p>
                            <button className="btn-primary" onClick={handleShowConnect}>
                                + Connect Your First Page
                            </button>
                        </div>
                    ) : (
                        <div className="pages-grid">
                            {connectedPages.map((page) => (
                                <div key={page.id} className="page-card">
                                    <div className="page-card-header">
                                        <div className="page-card-avatar">📄</div>
                                        <div className="page-card-info">
                                            <h3>{page.name}</h3>
                                            <span>
                                                {page.conversationCount} conversations
                                            </span>
                                        </div>
                                    </div>

                                    <div className="page-card-status">
                                        <div
                                            className={`status-dot ${!page.isActive ? 'inactive' : ''}`}
                                        />
                                        <span className="status-text">
                                            {page.isActive ? 'Auto-reply active' : 'Auto-reply paused'}
                                        </span>
                                    </div>

                                    <div className="page-card-context">
                                        <label>🤖 System Prompt <small style={{ opacity: 0.6, fontWeight: 'normal' }}>(How the AI should behave and reply)</small></label>
                                        <textarea
                                            value={
                                                contextEdits[page.id]?.systemPrompt !== undefined
                                                    ? contextEdits[page.id].systemPrompt
                                                    : page.systemPrompt
                                            }
                                            onChange={(e) =>
                                                setContextEdits((prev) => ({
                                                    ...prev,
                                                    [page.id]: {
                                                        ...prev[page.id],
                                                        systemPrompt: e.target.value,
                                                    },
                                                }))
                                            }
                                            placeholder="Example: You are a friendly customer support agent. Reply in short sentences. Be polite and professional."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="page-card-context">
                                        <label>📚 Knowledge Base <small style={{ opacity: 0.6, fontWeight: 'normal' }}>(Facts and info the AI uses to answer)</small></label>
                                        <textarea
                                            value={
                                                contextEdits[page.id]?.context !== undefined
                                                    ? contextEdits[page.id].context
                                                    : (page.context || '')
                                            }
                                            onChange={(e) =>
                                                setContextEdits((prev) => ({
                                                    ...prev,
                                                    [page.id]: {
                                                        ...prev[page.id],
                                                        context: e.target.value,
                                                    },
                                                }))
                                            }
                                            placeholder="Example: Our store hours are 9am-5pm. We sell pizza, pasta, and salads. Delivery is free over $20. Our phone number is 555-1234."
                                            rows={5}
                                        />
                                    </div>

                                    <div className="page-card-actions">
                                        {contextEdits[page.id] && (
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={() => handleSaveContext(page.id)}
                                            >
                                                💾 Save Settings
                                            </button>
                                        )}
                                        <button
                                            className="btn-secondary btn-sm"
                                            onClick={() => handleToggle(page.id)}
                                        >
                                            {page.isActive ? '⏸️ Pause' : '▶️ Resume'}
                                        </button>
                                        <Link
                                            href={`/dashboard/conversations?pageId=${page.id}&pageName=${encodeURIComponent(page.name)}`}
                                            className="btn-secondary btn-sm"
                                        >
                                            💬 View Chats
                                        </Link>
                                        <button
                                            className="btn-danger btn-sm"
                                            onClick={() => handleDisconnect(page.id)}
                                        >
                                            ✕ Disconnect
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Connect Page Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Connect a Facebook Page</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {availablePages.length === 0 ? (
                                <div className="empty-state">
                                    <p>
                                        No Facebook Pages found. Make sure you are an admin of at
                                        least one Facebook Page.
                                    </p>
                                </div>
                            ) : (
                                availablePages.map((page) => (
                                    <div key={page.pageId} className="available-page">
                                        <div className="available-page-info">
                                            {page.picture ? (
                                                <img
                                                    src={page.picture}
                                                    alt={page.name}
                                                    className="available-page-avatar"
                                                />
                                            ) : (
                                                <div className="available-page-avatar-placeholder">
                                                    📄
                                                </div>
                                            )}
                                            <div>
                                                <div className="available-page-name">{page.name}</div>
                                                <div className="available-page-category">
                                                    {page.category} • {page.fanCount} followers
                                                </div>
                                            </div>
                                        </div>
                                        {page.isConnected ? (
                                            <span className="connected-badge">✓ Connected</span>
                                        ) : (
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={() => handleConnect(page.pageId)}
                                                disabled={connecting === page.pageId}
                                            >
                                                {connecting === page.pageId
                                                    ? 'Connecting...'
                                                    : 'Connect'}
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
