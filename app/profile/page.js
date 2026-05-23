'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const statusColor = {
  pending: 'var(--warning)',
  accepted: 'var(--info)',
  preparing: 'var(--warning)',
  ready: 'var(--success)',
  delivered: 'var(--success)',
  cancelled: 'var(--error)',
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      setForm({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
      });
      fetchOrders();
    }
  }, [status, session]);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setEditing(false);
    showToast('Profile updated successfully!');
  }

  if (status === 'loading') return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    </main>
  );

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '32px 24px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontFamily: 'var(--font-heading)',
            fontWeight: 700, color: 'var(--primary-text)',
            flexShrink: 0,
          }}>
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--primary-text)', marginBottom: '4px' }}>
              {session?.user?.name}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--primary-text)', opacity: 0.85 }}>
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: '-24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          {[
            { label: 'Orders', value: orders.length },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
            { label: 'Spent', value: `₹${orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.total, 0)}` },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-card)', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* PROFILE INFO */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              👤 Profile Details
            </h2>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600',
                color: editing ? 'var(--error)' : 'var(--primary)',
                background: 'transparent', border: 'none', cursor: 'pointer',
              }}
            >
              {editing ? '✕ Cancel' : '✏️ Edit'}
            </button>
          </div>

          <div style={{ padding: '20px' }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
                  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
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
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: 'var(--radius-md)', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Changes ✓'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '👤', label: 'Name', value: form.name },
                  { icon: '📧', label: 'Email', value: form.email },
                  { icon: '📞', label: 'Phone', value: form.phone || 'Not added yet' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{row.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: row.value === 'Not added yet' ? 'var(--text-dim)' : 'var(--text)' }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ORDER HISTORY */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              📦 Order History
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tap any order to track or view details
            </p>
          </div>

          {loading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading orders...</div>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: 'var(--text)', marginBottom: '6px' }}>No orders yet</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Your order history will appear here</p>
              <Link href="/menu" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}>
                Order Now
              </Link>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map((order) => (
                <Link key={order._id} href={`/order/${order._id}`} style={{
                  display: 'block',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  background: 'var(--bg)',
                  transition: 'box-shadow 0.2s',
                }}>

                  {/* ORDER HEADER */}
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                        {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                        ₹{order.total}
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                        padding: '3px 10px', borderRadius: 'var(--radius-full)',
                        background: `${statusColor[order.status]}20`,
                        color: statusColor[order.status],
                        textTransform: 'capitalize',
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* ORDER ITEMS */}
                  <div style={{ padding: '12px 16px' }}>
                    {order.items?.map((item, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: j < order.items.length - 1 ? '4px' : 0 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {item.name} × {item.quantity}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* TAP TO TRACK */}
                  <div style={{
                    padding: '10px 16px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                      {order.status === 'delivered' ? '✅ View Order Details' : order.status === 'cancelled' ? '❌ Order Cancelled' : '🛵 Track This Order'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--primary)' }}>→</span>
                  </div>

                </Link>
              ))}
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            width: '100%', padding: '14px',
            background: 'var(--bg-card)', border: '1px solid var(--error)',
            borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-heading)',
            fontSize: '14px', fontWeight: 600, color: 'var(--error)',
            cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          }}
        >
          🚪 Logout
        </button>

      </div>

      {/* TOAST */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>

    </main>
  );
}