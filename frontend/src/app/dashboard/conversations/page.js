'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    getToken,
    removeToken,
    getMe,
    getConversations,
    getMessages,
} from '@/lib/api';

function ConversationsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageId = searchParams.get('pageId');
    const pageName = searchParams.get('pageName') || 'Page';

    const [user, setUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/');
            return;
        }

        if (!pageId) {
            router.push('/dashboard');
            return;
        }

        loadData();
    }, [router, pageId]);

    async function loadData() {
        try {
            const [meData, convData] = await Promise.all([
                getMe(),
                getConversations(pageId),
            ]);
            setUser(meData.user);
            setConversations(convData.conversations);
        } catch (err) {
            console.error('Failed to load:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSelectConversation(conv) {
        setSelectedConversation(conv);
        setLoadingMessages(true);
        try {
            const data = await getMessages(pageId, conv.id);
            setMessages(data.messages);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setLoadingMessages(false);
        }
    }

    function formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    function handleLogout() {
        removeToken();
        router.push('/');
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" />
                <p>Loading conversations...</p>
            </div>
        );
    }

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

            <div className="conversations-page">
                <Link href="/dashboard" className="back-link">
                    ← Back to Dashboard
                </Link>
                <h2 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: 700 }}>
                    {pageName} — Conversations
                </h2>

                {conversations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💬</div>
                        <h3>No conversations yet</h3>
                        <p>
                            When someone messages your connected page, conversations will
                            appear here.
                        </p>
                    </div>
                ) : (
                    <div className="conversations-layout">
                        {/* Conversations List */}
                        <div className="conversations-list">
                            <div className="conversations-list-header">
                                <h3>{conversations.length} Conversations</h3>
                            </div>
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''
                                        }`}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <div className="conversation-avatar">
                                        {(conv.senderName || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-name">
                                            {conv.senderName || 'Unknown User'}
                                        </div>
                                        <div className="conversation-preview">
                                            {conv.lastMessage}
                                        </div>
                                    </div>
                                    <span className="conversation-time">
                                        {formatTime(conv.lastMessageAt)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Chat View */}
                        <div className="chat-view">
                            {selectedConversation ? (
                                <>
                                    <div className="chat-header">
                                        <div className="conversation-avatar">
                                            {(selectedConversation.senderName || 'U')[0].toUpperCase()}
                                        </div>
                                        <span className="chat-header-name">
                                            {selectedConversation.senderName || 'Unknown User'}
                                        </span>
                                    </div>
                                    <div className="chat-messages">
                                        {loadingMessages ? (
                                            <div className="loading" style={{ minHeight: '200px' }}>
                                                <div className="spinner" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="chat-empty">
                                                <div className="chat-empty-icon">💬</div>
                                                <p>No messages in this conversation</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`chat-message ${msg.role}`}
                                                >
                                                    {msg.content}
                                                    <div className="chat-message-time">
                                                        {formatTime(msg.createdAt)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="chat-empty">
                                    <div className="chat-empty-icon">👈</div>
                                    <p>Select a conversation to view messages</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function ConversationsPage() {
    return (
        <Suspense
            fallback={
                <div className="loading">
                    <div className="spinner" />
                    <p>Loading...</p>
                </div>
            }
        >
            <ConversationsContent />
        </Suspense>
    );
}
