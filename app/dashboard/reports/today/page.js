'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

export default function TodayOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const today = new Date().toDateString();
    const todayOrders = Array.isArray(data)
      ? data.filter(o => new Date(o.createdAt).toDateString() === today)
      : [];
    setOrders(todayOrders);
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

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.total, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* PAGE HEADER */}
      <div style={{ padding: '24px 24px 0', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Reports</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
            Today's Orders
          </h1>
          <button onClick={fetchOrders} style={{
            fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--primary)',
            background: 'var(--primary-light)', border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-md)', padding: '8px 16px', cursor: 'pointer',
          }}>
            Refresh
          </button>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Total Orders', value: orders.length, color: 'var(--text)' },
            { label: 'Pending', value: pending, color: 'var(--warning)' },
            { label: 'Delivered', value: delivered, color: 'var(--success)' },
            { label: 'Revenue', value: `₹${totalRevenue}`, color: 'var(--primary)' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* ORDERS */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading...</div>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>No orders today yet</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Orders placed today will appear here</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Time', 'Customer', 'Items', 'Amount', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{order.address?.name}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{order.address?.phone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                      ₹{order.total}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                        padding: '4px 10px', borderRadius: 'var(--radius-full)',
                        background: `${statusColor[order.status]}20`,
                        color: statusColor[order.status],
                        textTransform: 'capitalize',
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {nextStatus[order.status] && (
                        <button
                          onClick={() => updateStatus(order._id, nextStatus[order.status])}
                          disabled={updating === order._id}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--primary)', border: 'none',
                            color: 'var(--primary-text)', fontFamily: 'var(--font-body)',
                            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                            opacity: updating === order._id ? 0.7 : 1,
                          }}
                        >
                          {updating === order._id ? '...' : `→ ${nextStatus[order.status]}`}
                        </button>
                      )}
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {order.status === 'delivered' ? '✅ Done' : '❌ Cancelled'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
}