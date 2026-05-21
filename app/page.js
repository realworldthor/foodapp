'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function HomePage() {
  const [restaurant, setRestaurant] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [toast, setToast] = useState(false);
  const { addToCart, totalItems } = useCart();

  useEffect(() => {
    fetch('/api/restaurant')
      .then(r => r.json())
      .then(data => setRestaurant(data));

    fetch('/api/menu')
      .then(r => r.json())
      .then(data => setFeaturedItems(Array.isArray(data) ? data.slice(0, 6) : []));
  }, []);

  function handleAddToCart(item) {
    addToCart(item);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  const categories = [
    { icon: '🍢', name: 'Starters' },
    { icon: '🍛', name: 'Main Course' },
    { icon: '🫓', name: 'Breads' },
    { icon: '🥤', name: 'Drinks' },
    { icon: '🍮', name: 'Desserts' },
  ];

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HERO */}
      <section style={{
        background: 'var(--primary)',
        padding: '32px 24px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--primary-text)',
            opacity: 0.85,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            📍 Delivering to Lucknow
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--primary-text)',
            marginBottom: '8px',
            lineHeight: 1.2,
          }}>
            {restaurant?.name || 'Welcome!'} 🍽️
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--primary-text)',
            opacity: 0.85,
            marginBottom: '20px',
            lineHeight: 1.5,
          }}>
            {restaurant?.description || 'Fresh food delivered fast.'}
          </p>

          {/* STATS ROW */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { icon: '⏱️', label: restaurant?.deliveryTime || '30 mins' },
              { icon: '⭐', label: '4.8 Rating' },
              { icon: '🛵', label: 'Free Delivery' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ fontSize: '14px' }}>{stat.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--primary-text)',
                  fontWeight: '600',
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DECORATIVE CIRCLE */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
      </section>

      {/* SEARCH BAR */}
      <div style={{ padding: '16px 24px', background: 'var(--bg)' }}>
        <Link href="/menu" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '12px 16px',
        }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--text-dim)',
          }}>
            Search for dishes...
          </span>
        </Link>
      </div>

      {/* CATEGORIES */}
      <section style={{ padding: '8px 24px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '16px',
        }}>
          Categories
        </h2>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {categories.map(cat => (
            <Link key={cat.name} href={`/menu?category=${cat.name}`} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
              textDecoration: 'none',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                border: '2px solid transparent',
                transition: 'border-color 0.2s',
              }}>
                {cat.icon}
              </div>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontWeight: '500',
                whiteSpace: 'nowrap',
              }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ITEMS */}
      <section style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text)',
          }}>
            Popular Items
          </h2>
          <Link href="/menu" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--primary)',
            fontWeight: '600',
          }}>
            View all →
          </Link>
        </div>

        <div style={{ display: 'grid', gap: '12px' }} className="food-grid">
          {featuredItems.map(item => (
            <div key={item._id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-sm)',
            minWidth: 0,
            overflow: 'hidden',
          }}>
              {/* IMAGE */}
              <div style={{
                width: '100%',
                height: '120px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                overflow: 'hidden',
                marginBottom: '8px',
              }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🍽️</div>
                )}
              </div>

              {/* INFO */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div className={item.isVeg ? 'badge-veg' : 'badge-nonveg'} />
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.name}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--text)',
                    }}>
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--text-dim)',
                        textDecoration: 'line-through',
                        marginLeft: '6px',
                      }}>
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn-primary"
                    style={{ padding: '6px 16px', fontSize: '13px', borderRadius: 'var(--radius-full)' }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CART FLOATING BUTTON */}
      {totalItems > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          left: '16px',
          right: '16px',
          zIndex: 99,
        }}>
          <Link href="/cart" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--primary-text)',
            }}>
              🛒 {totalItems} item{totalItems > 1 ? 's' : ''} in cart
            </span>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--primary-text)',
            }}>
              View Cart →
            </span>
          </Link>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toast ? 'show' : ''}`}>Added to cart ✓</div>

    </main>
  );
}