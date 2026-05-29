'use client';

import { useState, useEffect, useRef } from 'react';
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
  const prevOrderCount = useRef(0);

function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.4);
}

function showBrowserNotification(orderCount) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🍽️ New Order!', {
      body: `You have a new order. Total orders: ${orderCount}`,
      icon: '/favicon.ico',
    });
  }
}

useEffect(() => {
  if (status === 'unauthenticated') { router.push('/login'); return; }
  if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/'); return; }
  if (status === 'authenticated') {
    // Connect to SSE stream
    const eventSource = new EventSource('/api/orders/stream');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newPendingCount = data.filter(o => o.status === 'pending').length;

      // Play sound only when new pending orders arrive
      if (prevOrderCount.current > 0 && newPendingCount > prevOrderCount.current) {
        playNotificationSound();
        showBrowserNotification(newPendingCount);
      }

      prevOrderCount.current = newPendingCount;
      setOrders(data);
      setLoading(false);
    };

    eventSource.onerror = () => {
      // Fallback to regular fetch if SSE fails
      fetchOrders();
      eventSource.close();
    };

    // Cleanup on unmount
    return () => eventSource.close();
  }
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
{/* PAGE HEADER */}
<div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
  <div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Manage</div>
    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>All Orders</h1>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>Live — instant updates</span>
    </div>
    <button
      onClick={() => {
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              playNotificationSound();
            }
          });
        }
      }}
      style={{
        fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '8px 16px', cursor: 'pointer',
      }}
    >
      🔔 Enable Alerts
    </button>
    <button onClick={fetchOrders} style={{
      fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--primary)',
      background: 'var(--primary-light)', border: '1px solid var(--primary)',
      borderRadius: 'var(--radius-md)', padding: '8px 16px', cursor: 'pointer',
    }}>
      🔄 Refresh
    </button>
  </div>
</div>

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
              <div key={order._id} onClick={() => router.push(`/dashboard/orders/${order._id}`)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
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
                        onClick={(e) => { e.stopPropagation(); updateStatus(order._id, nextStatus[order.status]); }}
                        disabled={updating === order._id}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: 'var(--radius-md)', opacity: updating === order._id ? 0.7 : 1 }}
                      >
                        {updating === order._id ? 'Updating...' : `Mark as ${nextStatus[order.status]} →`}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(order._id, 'cancelled'); }}
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