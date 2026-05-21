'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  if (cart.length === 0) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
          Your cart is empty
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Add some delicious items from our menu
        </p>
        <Link href="/menu" className="btn-primary" style={{ padding: '12px 32px', fontSize: '15px', borderRadius: 'var(--radius-md)' }}>
          Browse Menu
        </Link>
      </div>
    </main>
  );

  const delivery = 0;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + delivery + taxes;

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--bg)', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>
          Your Cart
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {totalItems} item{totalItems > 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* CART ITEMS */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {cart.map((item, index) => (
            <div key={item._id} style={{
              padding: '16px',
              borderBottom: index < cart.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', gap: '12px', alignItems: 'center',
            }}>

              {/* IMAGE */}
              <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', flexShrink: 0, overflow: 'hidden' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🍽️</div>
                )}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <div className={item.isVeg ? 'badge-veg' : 'badge-nonveg'} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                  ₹{item.price * item.quantity}
                </div>

                {/* QUANTITY CONTROLS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text)' }}
                    >
                      −
                    </button>
                    <span style={{ width: '28px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text)' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DELIVERY INFO */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🛵</span>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Free Delivery</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>Estimated delivery in 30 mins</div>
          </div>
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--success)' }}>FREE</div>
        </div>

        {/* BILL DETAILS */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
            Bill Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Item Total', value: `₹${totalPrice}` },
              { label: 'Delivery Fee', value: 'FREE', color: 'var(--success)' },
              { label: 'Taxes & Charges (5%)', value: `₹${taxes}` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: row.color || 'var(--text)' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Grand Total</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* ADD MORE ITEMS */}
        <Link href="/menu" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '14px', background: 'var(--bg-card)', border: '1.5px dashed var(--primary)',
          borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: '14px',
          color: 'var(--primary)', fontWeight: '600',
        }}>
          + Add more items
        </Link>

      </div>

      {/* CHECKOUT BUTTON */}
      <div style={{ position: 'fixed', bottom: '70px', left: '16px', right: '16px', zIndex: 99 }}>
        <Link href="/checkout" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--primary)', borderRadius: 'var(--radius-md)',
          padding: '16px 20px', boxShadow: 'var(--shadow-lg)',
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--primary-text)' }}>
            {totalItems} item{totalItems > 1 ? 's' : ''}
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--primary-text)' }}>
            Proceed to Checkout →
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--primary-text)' }}>
            ₹{grandTotal}
          </span>
        </Link>
      </div>

    </main>
  );
}