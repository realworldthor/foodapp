// app/dashboard/order/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const id = await params.id;
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    const id = await params.id;
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setOrder((prev) => ({ ...prev, status: newStatus }));
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Loading order...</p>
    </div>
  );

  if (!order) return (
    <div style={{ padding: 24 }}>
      <p style={{ color: 'var(--error)' }}>Order not found.</p>
    </div>
  );

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = +(subtotal * 0.05).toFixed(2);

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const statusFlow = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.status);

  const statusColors = {
    pending: 'var(--warning)',
    accepted: 'var(--info)',
    preparing: 'var(--info)',
    ready: 'var(--success)',
    delivered: 'var(--success)',
    cancelled: 'var(--error)',
  };

  const nextStatus = statusFlow[currentIndex + 1];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 14 }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>arrow_back</span>
            Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            Order #{order._id.toString().slice(-6).toUpperCase()}
          </h1>
        </div>
        <button
          onClick={() => window.open(`/dashboard/orders/${order._id}/print`, '_blank')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--primary)', color: 'var(--primary-text)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>print</span>
          Print Receipt
        </button>
      </div>

      {/* Status Badge + Update */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Status</p>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 'var(--radius-full)',
              background: statusColors[order.status] + '22', color: statusColors[order.status],
              fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {order.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {nextStatus && (
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                style={{ padding: '8px 16px', background: 'var(--primary)', color: 'var(--primary-text)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                style={{ padding: '8px 16px', background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Status Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, gap: 0 }}>
          {statusFlow.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i <= currentIndex ? 'var(--primary)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i <= currentIndex
                    ? <span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>check</span>
                    : <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border-dark)', display: 'block' }} />
                  }
                </div>
                <p style={{ fontSize: 10, marginTop: 4, color: i <= currentIndex ? 'var(--primary)' : 'var(--text-dim)', textTransform: 'capitalize', textAlign: 'center' }}>{s}</p>
              </div>
              {i < statusFlow.length - 1 && (
                <div style={{ height: 2, flex: 1, background: i < currentIndex ? 'var(--primary)' : 'var(--border)', marginBottom: 16 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Customer Info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>person</span>
            Customer
          </p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{order.customer?.name}</p>
          {order.customer?.phone && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>📞 {order.customer.phone}</p>}
          {order.customer?.email && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>✉ {order.customer.email}</p>}
        </div>

        {/* Payment Info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>payments</span>
            Payment
          </p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase' }}>{order.paymentMethod}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Amount: <strong style={{ color: 'var(--text)' }}>₹{order.total?.toFixed(2)}</strong></p>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            <span style={{
              padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
              background: order.paymentMethod === 'cod' ? 'var(--warning-bg)' : 'var(--success-bg)',
              color: order.paymentMethod === 'cod' ? 'var(--warning)' : 'var(--success)',
            }}>
              {order.paymentMethod === 'cod' ? 'Collect at Delivery' : 'Paid Online'}
            </span>
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>location_on</span>
          Delivery Address
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {order.address
                ? typeof order.address === 'object'
                ? `${order.address.street}, ${order.address.city} - ${order.address.pincode}`
                : order.address
                : 'No address provided'}
            </p>      
            </div>

      {/* Order Items */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>receipt_long</span>
          Order Items
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.isVeg ? 'var(--success)' : 'var(--error)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>₹{item.price} × {item.quantity}</p>
                </div>
              </div>
              <p style={{ fontWeight: 700, color: 'var(--text)' }}>₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Subtotal</p>
            <p style={{ fontSize: 14 }}>₹{subtotal.toFixed(2)}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tax (5%)</p>
            <p style={{ fontSize: 14 }}>₹{tax.toFixed(2)}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>Total</p>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>₹{order.total?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Order Meta */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
        <p style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>info</span>
          Order Info
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Order ID</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>#{order._id.toString().slice(-6).toUpperCase()}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Placed At</p>
            <p style={{ fontSize: 13, color: 'var(--text)' }}>{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

    </div>
  );
}