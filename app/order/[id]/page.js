'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const statusSteps = [
  { key: 'pending', icon: '📋', label: 'Order Placed', desc: 'Your order has been received' },
  { key: 'accepted', icon: '✅', label: 'Order Accepted', desc: 'Restaurant has accepted your order' },
  { key: 'preparing', icon: '👨‍🍳', label: 'Preparing', desc: 'Your food is being prepared' },
  { key: 'ready', icon: '📦', label: 'Ready', desc: 'Your order is ready for delivery' },
  { key: 'delivered', icon: '🛵', label: 'Delivered', desc: 'Your order has been delivered' },
];

const statusColor = {
  pending: 'var(--warning)',
  accepted: 'var(--info)',
  preparing: 'var(--warning)',
  ready: 'var(--success)',
  delivered: 'var(--success)',
  cancelled: 'var(--error)',
};

export default function OrderTrackingPage({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevStatus = useRef(null);

  useEffect(() => {
    async function init() {
      const { id } = await params;

      // Initial fetch
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (!data.error) {
        setOrder(data);
        prevStatus.current = data.status;
      }
      setLoading(false);

      // SSE for live status updates
      const eventSource = new EventSource('/api/orders/stream');
      eventSource.onmessage = (event) => {
        const orders = JSON.parse(event.data);
        const updated = orders.find(o => o._id === id);
        if (updated) {
          setOrder(updated);
          prevStatus.current = updated.status;
        }
      };
      eventSource.onerror = () => eventSource.close();
      return () => eventSource.close();
    }
    init();
  }, [params]);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading your order...</div>
      </div>
    </main>
  );

  if (!order || order.error) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text)', marginBottom: '16px' }}>Order not found</p>
        <Link href="/" className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}>
          Go Home
        </Link>
      </div>
    </main>
  );

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '24px 24px 40px' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--primary-text)', opacity: 0.85, display: 'block', marginBottom: '16px' }}>
          ← Back to Home
        </Link>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--primary-text)', opacity: 0.75, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Order Tracking
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: 'var(--primary-text)', marginBottom: '8px' }}>
          {isCancelled ? '❌ Order Cancelled' : order.status === 'delivered' ? '✅ Order Delivered!' : '🍽️ Your order is on its way!'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', animation: isCancelled || order.status === 'delivered' ? 'none' : 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--primary-text)', opacity: 0.85 }}>
            {isCancelled || order.status === 'delivered' ? 'Final status' : 'Live tracking — updates automatically'}
          </span>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: '-20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* STATUS TRACKER */}
        {!isCancelled && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '24px' }}>
              Order Status
            </h2>
            <div style={{ position: 'relative' }}>
              {/* PROGRESS LINE */}
              <div style={{
                position: 'absolute', left: '19px', top: '24px',
                width: '2px',
                height: `${(statusSteps.length - 1) * 64}px`,
                background: 'var(--border)',
              }} />
              <div style={{
                position: 'absolute', left: '19px', top: '24px',
                width: '2px',
                height: `${Math.min(currentStepIndex, statusSteps.length - 1) * 64}px`,
                background: 'var(--primary)',
                transition: 'height 0.5s ease',
              }} />

              {/* STEPS */}
              {statusSteps.map((step, index) => {
                const isDone = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: index < statusSteps.length - 1 ? '32px' : 0, position: 'relative', zIndex: 1 }}>

                    {/* CIRCLE */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px',
                      background: isDone ? 'var(--primary)' : isCurrent ? 'var(--primary-light)' : 'var(--bg-secondary)',
                      border: `2px solid ${isDone || isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                      transition: 'all 0.3s ease',
                    }}>
                      {isDone ? '✓' : step.icon}
                    </div>

                    {/* TEXT */}
                    <div style={{ paddingTop: '8px' }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: isCurrent ? 700 : 500,
                        color: isPending ? 'var(--text-dim)' : 'var(--text)',
                        marginBottom: '2px',
                      }}>
                        {step.label}
                        {isCurrent && (
                          <span style={{ marginLeft: '8px', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, background: 'var(--primary)', color: 'var(--primary-text)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CANCELLED STATE */}
        {isCancelled && (
          <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--error)', marginBottom: '8px' }}>Order Cancelled</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              This order has been cancelled. If you paid online, refund will be processed within 5-7 days.
            </p>
            <Link href="/menu" className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}>
              Order Again
            </Link>
          </div>
        )}

        {/* DELIVERY INFO */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>
            📍 Delivery Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '👤', label: 'Name', value: order.address?.name },
              { icon: '📞', label: 'Phone', value: order.address?.phone },
              { icon: '📍', label: 'Address', value: `${order.address?.street}, ${order.address?.city} — ${order.address?.pincode}` },
              { icon: '💳', label: 'Payment', value: order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', width: '20px', flexShrink: 0 }}>{row.icon}</span>
                <div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '1px' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORDER ITEMS */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>🧾 Order Summary</h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < order.items.length - 1 ? '10px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🍽️</div>
                    }
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>{item.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>× {item.quantity}</div>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--border)', margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/menu" className="btn-outline" style={{ flex: 1, padding: '14px', fontSize: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            Order More
          </Link>
          <Link href="/profile" className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            View All Orders
          </Link>
        </div>

      </div>
    </main>
  );
}