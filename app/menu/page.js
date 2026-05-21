'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartContext';

const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Drinks', 'Desserts'];

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(false);
  const { addToCart, totalItems, totalPrice } = useCart();

  useEffect(() => {
    fetchItems();
  }, [category]);

  async function fetchItems() {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    const res = await fetch(`/api/menu?${params.toString()}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchItems();
  }

  function handleAddToCart(item) {
    addToCart(item);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* HEADER */}
      <div style={{
        background: 'var(--bg)',
        padding: '16px 24px 0',
        position: 'sticky',
        top: 'var(--navbar-height)',
        zIndex: 50,
        borderBottom: '1px solid var(--border)',
      }}>
        {/* SEARCH */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
            Search
          </button>
        </form>

        {/* CATEGORY TABS */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid',
                borderColor: category === cat ? 'var(--primary)' : 'var(--border)',
                background: category === cat ? 'var(--primary)' : 'transparent',
                color: category === cat ? 'var(--primary-text)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: category === cat ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS */}
      <div style={{ padding: '16px 24px' }}>

        {/* RESULTS COUNT */}
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}>
          {loading ? 'Loading...' : `${items.length} items found`}
        </div>

        {/* LOADING SKELETONS */}
        {loading && (
          <div style={{ display: 'grid', gap: '12px' }} className="food-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '1/1', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', marginBottom: '6px', width: '80%' }} />
                <div className="skeleton" style={{ height: '12px', width: '60%' }} />
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>No items found</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Try a different category or search term</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn-outline" style={{ padding: '10px 24px', fontSize: '14px' }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* ITEMS GRID */}
        {!loading && items.length > 0 && (
          <div style={{ display: 'grid', gap: '12px' }} className="food-grid">
            {items.map(item => (
              <div key={item._id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}>
                {/* IMAGE */}
                <Link href={`/menu/${item._id}`} style={{ display: 'block', position: 'relative' }}>
                  <div style={{ aspectRatio: '1/1', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🍽️</div>
                    )}
                  </div>
                  {item.originalPrice && (
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      background: 'var(--primary)', color: 'var(--primary-text)',
                      fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700,
                      padding: '3px 8px', borderRadius: 'var(--radius-full)',
                    }}>
                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                    </div>
                  )}
                  {!item.isAvailable && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: '#fff' }}>Unavailable</span>
                    </div>
                  )}
                </Link>

                {/* INFO */}
                <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div className={item.isVeg ? 'badge-veg' : 'badge-nonveg'} />
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600,
                        color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)',
                      marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                        ₹{item.price}
                      </span>
                      {item.originalPrice && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', textDecoration: 'line-through', marginLeft: '4px' }}>
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                      className="btn-primary"
                      style={{ padding: '5px 12px', fontSize: '12px', borderRadius: 'var(--radius-full)', opacity: item.isAvailable ? 1 : 0.5 }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CART FLOATING BUTTON */}
      {totalItems > 0 && (
        <div style={{ position: 'fixed', bottom: '70px', left: '16px', right: '16px', zIndex: 99 }}>
          <Link href="/cart" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--primary)', borderRadius: 'var(--radius-md)',
            padding: '14px 20px', boxShadow: 'var(--shadow-lg)',
          }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--primary-text)' }}>
              🛒 {totalItems} item{totalItems > 1 ? 's' : ''} in cart
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--primary-text)' }}>
              ₹{totalPrice} →
            </span>
          </Link>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toast ? 'show' : ''}`}>Added to cart ✓</div>

    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', color: 'var(--text-muted)' }}>Loading menu...</div>
      </main>
    }>
      <MenuContent />
    </Suspense>
  );
}