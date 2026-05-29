'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ padding: '24px 24px 0' }}>
        <Link href="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)',
          textDecoration: 'none',
        }}>
          <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Login
        </Link>
      </div>

      <div style={{ padding: '32px 24px', maxWidth: '480px', margin: '0 auto' }}>

        {sent ? (
          // SUCCESS STATE
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--success-bg)', border: '3px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span className="material-icons" style={{ fontSize: '36px', color: 'var(--success)' }}>mark_email_read</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
              Check Your Email
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
              We sent a password reset link to
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: 'var(--primary)', marginBottom: '24px' }}>
              {email}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
              The link will expire in 1 hour. Check your spam folder if you don't see it in your inbox.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="btn-outline"
              style={{ padding: '12px 28px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}
            >
              Try a different email
            </button>
          </div>
        ) : (
          // FORM STATE
          <>
            {/* ICON */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <span className="material-icons" style={{ fontSize: '36px', color: 'var(--primary)' }}>lock_reset</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                Forgot Password?
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div style={{
                background: 'var(--error-bg)', border: '1px solid var(--error)',
                borderRadius: 'var(--radius-md)', padding: '12px 16px',
                fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--error)',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>error_outline</span>
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-md)', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            {/* BACK TO LOGIN */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                Sign in →
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}