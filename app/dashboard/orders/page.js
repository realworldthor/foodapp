'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const statusOptions = ['all', 'pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'];

const statusColor = {
  pending: 'var(--warning)',
  accepted: 'var(--info)',
  preparing: 'var(--warning)',
  ready: 'var(--success)',
  delivered: 'var(--success)',
  cancelled: 'var(--error)',
};

const nextStatus = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/'); return; }
    if (status === 'authenticated') fetchOrders();
  }, [status, session]);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function updateStatus(orderId, newStatus) {
    setUpdating(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchOrders();
    setUpdating(null);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* DASHBOARD NAVBAR */}
      <nav style={{
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '60px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>← Dashboard</Link>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>📦 Orders</span>
        </div>
        <button onClick={fetchOrders} style={{
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--primary)',
          background: 'var(--primary-light)', border: '1px solid var(--primary)',
          borderRadius: 'var(--radius-md)', padding: '8px 16px', cursor: 'pointer',
        }}>
          🔄 Refresh
        </button>
      </nav>

      <div style={{ padding: '24px' }}>

        {/* FILTER TABS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {statusOptions.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 16px', borderRadius: 'var(--radius-full)',
              border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s',
              borderColor: filter === s ? 'var(--primary)' : 'var(--border)',
              background: filter === s ? 'var(--primary)' : 'var(--bg)',
              color: filter === s ? 'var(--primary-text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: filter === s ? '600' : '400',
              textTransform: 'capitalize',
            }}>
              {s} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading orders...</div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>No orders found</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
              {filter === 'all' ? 'No orders have been placed yet' : `No ${filter} orders`}
            </p>
          </div>
        )}

        {/* ORDERS LIST */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(order => (
              <div key={order._id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {/* ORDER HEADER */}
                <div style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg-secondary)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                      {order.address?.name || 'Customer'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      📞 {order.address?.phone}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                      padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      background: `${statusColor[order.status]}20`,
                      color: statusColor[order.status],
                      textTransform: 'capitalize',
                    }}>
                      {order.status}
                    </span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                      ₹{order.total}
                    </span>
                  </div>
                </div>

                {/* ORDER BODY */}
                <div style={{ padding: '16px 20px' }}>

                  {/* ITEMS */}
                  <div style={{ marginBottom: '14px' }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>
                          {item.name} × {item.quantity}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ADDRESS */}
                  <div style={{
                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px', marginBottom: '14px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      📍 {order.address?.street}, {order.address?.city} — {order.address?.pincode}
                    </span>
                  </div>

                  {/* PAYMENT + DATE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      💳 {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {nextStatus[order.status] && (
                      <button
                        onClick={() => updateStatus(order._id, nextStatus[order.status])}
                        disabled={updating === order._id}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: 'var(--radius-md)', opacity: updating === order._id ? 0.7 : 1 }}
                      >
                        {updating === order._id ? 'Updating...' : `Mark as ${nextStatus[order.status]} →`}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={() => updateStatus(order._id, 'cancelled')}
                        disabled={updating === order._id}
                        style={{
                          padding: '10px 16px', fontSize: '13px', borderRadius: 'var(--radius-md)',
                          background: 'var(--error-bg)', border: '1px solid var(--error)',
                          color: 'var(--error)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                          fontWeight: '600',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <div style={{ flex: 1, textAlign: 'center', padding: '10px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {order.status === 'delivered' ? '✅ Order completed' : '❌ Order cancelled'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}