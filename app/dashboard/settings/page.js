'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    openingTime: '09:00',
    closingTime: '23:00',
    deliveryTime: '30 mins',
    minimumOrder: 0,
    isOpen: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/'); return; }
    if (status === 'authenticated') fetchRestaurant();
  }, [status, session]);

  async function fetchRestaurant() {
    setLoading(true);
    const res = await fetch('/api/restaurant');
    const data = await res.json();
    if (data && !data.error) {
      setForm({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        openingTime: data.openingTime || '09:00',
        closingTime: data.closingTime || '23:00',
        deliveryTime: data.deliveryTime || '30 mins',
        minimumOrder: data.minimumOrder || 0,
        isOpen: data.isOpen ?? true,
      });
    }
    setLoading(false);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/restaurant', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      showToast('Settings saved successfully!');
    } else {
      showToast('Something went wrong. Try again.');
    }
    setSaving(false);
  }

  if (loading) return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading settings...</div>
      </div>
    </main>
  );

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '60px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>← Dashboard</Link>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>⚙️ Settings</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ padding: '8px 20px', fontSize: '13px', borderRadius: 'var(--radius-md)', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </nav>

      <div style={{ padding: '24px', maxWidth: '720px' }}>

        {/* RESTAURANT STATUS TOGGLE */}
        <div style={{
          background: form.isOpen ? 'var(--success-bg)' : 'var(--error-bg)',
          border: `1px solid ${form.isOpen ? 'var(--success)' : 'var(--error)'}`,
          borderRadius: 'var(--radius-md)', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: form.isOpen ? 'var(--success)' : 'var(--error)', marginBottom: '2px' }}>
              {form.isOpen ? '🟢 Restaurant is Open' : '🔴 Restaurant is Closed'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
              {form.isOpen ? 'Customers can place orders right now' : 'Customers cannot place orders right now'}
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isOpen}
              onChange={e => setForm({ ...form, isOpen: e.target.checked })}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', inset: 0,
              background: form.isOpen ? 'var(--success)' : 'var(--border-dark)',
              borderRadius: '28px', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute',
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'white', top: '3px',
                left: form.isOpen ? '27px' : '3px',
                transition: 'left 0.2s',
                boxShadow: 'var(--shadow-sm)',
              }} />
            </span>
          </label>
        </div>

        {/* BASIC INFO */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
            🏪 Basic Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Restaurant Name', key: 'name', type: 'text', placeholder: 'Cafe Bella' },
              { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
              { label: 'Address', key: 'address', type: 'text', placeholder: '12, Hazratganj, Lucknow' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="input"
                />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                placeholder="Tell customers about your restaurant..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="input"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* DELIVERY SETTINGS */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
            🛵 Delivery Settings
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Delivery Time
              </label>
              <input
                type="text"
                placeholder="30 mins"
                value={form.deliveryTime}
                onChange={e => setForm({ ...form, deliveryTime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Minimum Order (₹)
              </label>
              <input
                type="number"
                placeholder="149"
                value={form.minimumOrder}
                onChange={e => setForm({ ...form, minimumOrder: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* TIMING */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
            ⏰ Opening Hours
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Opening Time
              </label>
              <input
                type="time"
                value={form.openingTime}
                onChange={e => setForm({ ...form, openingTime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Closing Time
              </label>
              <input
                type="time"
                value={form.closingTime}
                onChange={e => setForm({ ...form, closingTime: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-md)', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save All Changes ✓'}
        </button>

      </div>

      {/* TOAST */}
      <div className={`toast ${toast ? 'show' : ''}`} style={{ background: 'var(--bg-dark)', bottom: '24px' }}>{toast}</div>

    </main>
  );
}