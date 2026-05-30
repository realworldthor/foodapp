'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push('/');
    }
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ padding: '24px 24px 0' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)',
          textDecoration: 'none',
        }}>
          <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
          Back
        </Link>
      </div>

      <div style={{ padding: '32px 24px', maxWidth: '480px', margin: '0 auto' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span className="material-icons" style={{ fontSize: '36px', color: 'var(--primary)' }}>restaurant</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            Welcome back!
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
            Sign in to your account to continue
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

          {/* EMAIL */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-dim)' }}>
                mail_outline
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-dim)' }}>
                lock_outline
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input"
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'transparent',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-md)', marginTop: '8px', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <span className="material-icons" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>sync</span>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* SIGNUP LINK */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Create one →
          </Link>
        </p>

      </div>
    </main>
  );
}