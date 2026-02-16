'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getLoginUrl, getToken } from '@/lib/api';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const token = getToken();
    if (token) {
      router.push('/dashboard');
      return;
    }

    // Check for error in URL
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(
        urlError === 'auth_failed'
          ? 'Facebook authentication failed. Please try again.'
          : 'An error occurred. Please try again.'
      );
    }
  }, [searchParams, router]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">💬</div>
        <h1>TextReply</h1>
        <p>
          Connect your Facebook Page and let AI handle customer messages
          automatically with context-aware replies.
        </p>

        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">🤖</span>
            <span className="login-feature-text">Gemini AI</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">💬</span>
            <span className="login-feature-text">Auto-Reply</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">🧠</span>
            <span className="login-feature-text">Context-Aware</span>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <button className="btn-facebook" onClick={handleLogin}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continue with Facebook
        </button>

        <p className="login-footer">
          Secure login via Facebook OAuth • Your data stays private
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="loading">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
