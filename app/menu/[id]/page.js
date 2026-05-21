'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function ItemDetailPage({ params }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState(false);
  const { addToCart, totalItems, totalPrice } = useCart();

  useEffect(() => {
    async function fetchItem() {
      const { id } = await params;
      const res = await fetch(`/api/menu/${id}`);
      const data = await res.json();
      setItem(data);
      setLoading(false);
    }
    fetchItem();
  }, [params]);

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) addToCart(item);
    setAdded(true);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    </main>
  );

  if (!item || item.error) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text)', marginBottom: '16px' }}>Item not found</p>
        <Link href="/menu" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}>
          Back to Menu
        </Link>
      </div>
    </main>
  );

  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null;

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '120px' }}>

      {/* BACK BUTTON */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/menu" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)',
        }}>
          ← Back to Menu
        </Link>
      </div>

      {/* IMAGE */}
      <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--bg-secondary)', overflow: 'hidden', position: 'relative' }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>🍽️</div>
        )}
        {discount && (
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: 'var(--primary)', color: 'var(--primary-text)',
            fontFamily: 'var(--font-heading)', fontSize: '12px', fontWeight: 700,
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
          }}>
            {discount}% off
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div style={{ padding: '20px 24px' }}>

        {/* CATEGORY + VEG BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className={item.isVeg ? 'badge-veg' : 'badge-nonveg'} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '12px',
            color: 'var(--primary)', fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {item.category}
          </span>
        </div>

        {/* NAME */}
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '24px',
          fontWeight: 700, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.2,
        }}>
          {item.name}
        </h1>

        {/* DESCRIPTION */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '14px',
          color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px',
        }}>
          {item.description}
        </p>

        {/* INFO PILLS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { icon: '⏱️', label: item.preparationTime },
            { icon: item.isVeg ? '🥗' : '🍖', label: item.isVeg ? 'Vegetarian' : 'Non-Veg' },
            { icon: '✅', label: item.isAvailable ? 'Available' : 'Unavailable' },
          ].map(pill => (
            <div key={pill.label} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', padding: '6px 12px',
            }}>
              <span style={{ fontSize: '13px' }}>{pill.icon}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{pill.label}</span>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

        {/* PRICE */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
            ₹{item.price}
          </span>
          {item.originalPrice && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
              ₹{item.originalPrice}
            </span>
          )}
          {discount && (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              color: 'var(--success)',
            }}>
              Save {discount}%
            </span>
          )}
        </div>

        {/* QUANTITY + ADD TO CART */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

          {/* QUANTITY */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{
                width: '40px', height: '44px', background: 'var(--bg-secondary)',
                border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text)',
              }}
            >
              −
            </button>
            <span style={{
              width: '40px', textAlign: 'center',
              fontFamily: 'var(--font-heading)', fontSize: '16px',
              fontWeight: 600, color: 'var(--text)',
            }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              style={{
                width: '40px', height: '44px', background: 'var(--bg-secondary)',
                border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text)',
              }}
            >
              +
            </button>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className="btn-primary"
            style={{
              flex: 1, padding: '14px', fontSize: '15px',
              borderRadius: 'var(--radius-md)',
              opacity: item.isAvailable ? 1 : 0.5,
              background: added ? 'var(--success)' : 'var(--primary)',
            }}
          >
            {added ? '✓ Added to Cart' : `Add to Cart — ₹${item.price * quantity}`}
          </button>
        </div>

        {/* GO TO CART */}
        {added && (
          <Link href="/cart" style={{
            display: 'block', textAlign: 'center', marginTop: '12px',
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'var(--primary)', fontWeight: '600',
          }}>
            View Cart ({totalItems} items · ₹{totalPrice}) →
          </Link>
        )}

      </div>

      {/* TOAST */}
      <div className={`toast ${toast ? 'show' : ''}`}>Added to cart ✓</div>

    </main>
  );
}