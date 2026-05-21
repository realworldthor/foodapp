'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, totalItems, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    phone: session?.user?.phone || '',
    street: '',
    city: 'Lucknow',
    pincode: '',
  });

  const delivery = 0;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + delivery + taxes;

  async function handlePlaceOrder() {
    if (!session) { router.push('/login'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            menuItem: item._id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
          total: grandTotal,
          address: form,
          paymentMethod,
        }),
      });
      if (res.ok) {
        clearCart();
        setStep(3);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  // EMPTY CART
  if (cart.length === 0 && step !== 3) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Your cart is empty</h2>
        <Link href="/menu" className="btn-primary" style={{ padding: '12px 32px', fontSize: '15px', borderRadius: 'var(--radius-md)' }}>Browse Menu</Link>
      </div>
    </main>
  );

  // SUCCESS
  if (step === 3) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', padding: '24px', maxWidth: '400px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--success-bg)', border: '3px solid var(--success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', margin: '0 auto 24px',
        }}>✓</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>Order Confirmed!</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.2 }}>
          Your food is being prepared 🍽️
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
          Thank you <strong>{form.name}</strong>! Your order will be delivered to <strong>{form.street}, {form.city}</strong> in approximately 30 minutes.
        </p>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>Estimated Time</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>⏱️ ~30 Minutes</span>
          </div>
        </div>
        <Link href="/" className="btn-primary" style={{ padding: '14px 40px', fontSize: '15px', borderRadius: 'var(--radius-md)' }}>
          Back to Home
        </Link>
      </div>
    </main>
  );

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--bg)', padding: '16px 24px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
          Checkout
        </h1>
        {/* STEP INDICATOR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[['1', 'Address'], ['2', 'Payment']].map(([num, label], idx) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: step > idx + 1 ? 'var(--success)' : step === idx + 1 ? 'var(--primary)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700,
                  color: step >= idx + 1 ? 'white' : 'var(--text-muted)',
                }}>
                  {step > idx + 1 ? '✓' : num}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: step === idx + 1 ? 'var(--text)' : 'var(--text-muted)', fontWeight: step === idx + 1 ? '600' : '400' }}>
                  {label}
                </span>
              </div>
              {idx < 1 && <div style={{ width: '24px', height: '1px', background: 'var(--border)' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* STEP 1 — ADDRESS */}
        {step === 1 && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
              📍 Delivery Address
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
                { label: 'Street Address', key: 'street', type: 'text', placeholder: '123, MG Road' },
                { label: 'City', key: 'city', type: 'text', placeholder: 'Lucknow' },
                { label: 'Pincode', key: 'pincode', type: 'text', placeholder: '226001' },
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
            </div>

            {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--error)', marginTop: '12px' }}>{error}</p>}

            <button
              onClick={() => {
                if (!form.name || !form.phone || !form.street || !form.city || !form.pincode) {
                  setError('Please fill all fields.'); return;
                }
                setError('');
                setStep(2);
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-md)', marginTop: '20px' }}
            >
              Continue to Payment →
            </button>
          </div>
        )}

        {/* STEP 2 — PAYMENT */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* ADDRESS SUMMARY */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivering to</span>
                <button onClick={() => setStep(1)} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Change</button>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{form.name} · {form.phone}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>{form.street}, {form.city} — {form.pincode}</div>
            </div>

            {/* PAYMENT OPTIONS */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
                💳 Payment Method
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'cod', icon: '💵', label: 'Cash on Delivery', sub: 'Pay when your food arrives' },
                  { id: 'upi', icon: '📱', label: 'UPI Payment', sub: 'GPay, PhonePe, Paytm' },
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    style={{
                      padding: '14px 16px', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${paymentMethod === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: paymentMethod === opt.id ? 'var(--primary-light)' : 'var(--bg)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{opt.label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{opt.sub}</div>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: `2px solid ${paymentMethod === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: paymentMethod === opt.id ? 'var(--primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {paymentMethod === opt.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
                🧾 Order Summary
              </h2>
              {cart.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>{item.name} x{item.quantity}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />
              {[
                ['Item Total', `₹${totalPrice}`],
                ['Delivery', 'FREE'],
                ['Taxes (5%)', `₹${taxes}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: value === 'FREE' ? 'var(--success)' : 'var(--text)' }}>{value}</span>
                </div>
              ))}
              <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Grand Total</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>₹{grandTotal}</span>
              </div>
            </div>

            {error && <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--error)' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} className="btn-outline" style={{ padding: '14px 20px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}>
                ← Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-md)', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Placing Order...' : `Place Order · ₹${grandTotal}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}