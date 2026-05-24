'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/CartContext';

export default function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <>
      {/* TOP NAVBAR */}
      <nav style={{
        background: 'var(--navbar-bg)',
        borderBottom: '1px solid var(--navbar-border)',
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}>

        {/* LOGO — LEFT */}
        <Link href="/" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--primary)',
          textDecoration: 'none',
          letterSpacing: '-0.3px',
        }}>
          aryan's
        </Link>

        {/* ICONS — RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* SEARCH */}
          <Link href="/menu" style={{
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ fontSize: '22px' }}>search</span>
          </Link>

          {/* PROFILE */}
          <Link href={session ? '/profile' : '/login'} style={{
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'background 0.2s',
            position: 'relative',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {session ? (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontSize: '13px',
                fontWeight: 700, color: 'var(--primary-text)',
              }}>
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <span className="material-icons" style={{ fontSize: '22px' }}>person_outline</span>
            )}
          </Link>

          {/* CART */}
          <Link href="/cart" style={{
            width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'background 0.2s',
            position: 'relative',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ fontSize: '22px' }}>shopping_bag</span>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px', right: '4px',
                background: 'var(--primary)',
                color: 'var(--primary-text)',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '50%',
                width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
              }}>
                {totalItems}
              </span>
            )}
          </Link>

        </div>
      </nav>

      {/* BOTTOM NAVBAR — mobile only */}
      <div className="bottom-nav" style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'var(--navbar-bg)',
        borderTop: '1px solid var(--navbar-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '60px',
        zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
      }}>
        {[
          { href: '/', icon: 'home', label: 'Home' },
          { href: '/menu', icon: 'search', label: 'Menu' },
          { href: '/cart', icon: 'shopping_bag', label: 'Cart', badge: totalItems },
          { href: session ? '/profile' : '/login', icon: 'person_outline', label: session ? 'Profile' : 'Login' },
        ].map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '2px',
              position: 'relative', textDecoration: 'none',
              flex: 1, padding: '6px 0',
            }}>
              <div style={{ position: 'relative' }}>
                <span className="material-icons" style={{
                  fontSize: '22px',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'color 0.2s',
                }}>
                  {item.icon}
                </span>
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-6px',
                    background: 'var(--primary)', color: 'var(--primary-text)',
                    fontSize: '9px', fontWeight: 700, borderRadius: '50%',
                    width: '15px', height: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '10px', fontFamily: 'var(--font-body)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '400',
                transition: 'color 0.2s',
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}