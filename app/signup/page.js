'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function getStrength() {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  const strength = getStrength();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'var(--error)', 'var(--warning)', 'var(--info)', 'var(--success)'];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('Password must contain at least one capital letter.'); return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError('Password must contain at least one number.'); return;
    }

    setLoading(true);

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      setLoading(false);
    } else {
      router.push('/login');
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
            <span className="material-icons" style={{ fontSize: '36px', color: 'var(--primary)' }}>person_add</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            Create account
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
            Join us and order delicious food
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

          {/* NAME */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-dim)' }}>
                person_outline
              </span>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

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

          {/* PHONE */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Phone Number <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-dim)' }}>
                phone_outlined
              </span>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Password
            </label>
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

            {/* STRENGTH METER */}
            {form.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '4px', borderRadius: '2px',
                      background: strength >= i ? strengthColor[strength] : 'var(--border)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: strengthColor[strength] }}>
                  {strengthLabel[strength]} password
                </div>
              </div>
            )}

            {/* REQUIREMENTS */}
            {form.password && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { text: 'At least 8 characters', met: form.password.length >= 8 },
                  { text: 'One capital letter', met: /[A-Z]/.test(form.password) },
                  { text: 'One number', met: /[0-9]/.test(form.password) },
                ].map(req => (
                  <div key={req.text} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-icons" style={{ fontSize: '14px', color: req.met ? 'var(--success)' : 'var(--text-dim)' }}>
                      {req.met ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: req.met ? 'var(--success)' : 'var(--text-dim)' }}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-dim)' }}>
                lock_outline
              </span>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="input"
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'transparent',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {form.confirm && form.password !== form.confirm && (
              <div style={{ marginTop: '6px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-icons" style={{ fontSize: '14px' }}>error_outline</span>
                Passwords do not match
              </div>
            )}
            {form.confirm && form.password === form.confirm && form.confirm.length > 0 && (
              <div style={{ marginTop: '6px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-icons" style={{ fontSize: '14px' }}>check_circle</span>
                Passwords match
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-md)', marginTop: '8px', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <span className="material-icons" style={{ fontSize: '18px' }}>sync</span>
                Creating account...
              </>
            ) : 'Create Account'}
          </button>

        </form>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* LOGIN LINK */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign in →
          </Link>
        </p>

      </div>
    </main>
  );
}