'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/components/CartContext';

export default function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const pathname = usePathname();

  // Hide navbar on dashboard pages
  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <>
      {/* TOP NAVBAR — desktop */}
      <nav style={{
        background: 'var(--navbar-bg)',
        borderBottom: '1px solid var(--navbar-border)',
        height: 'var(--navbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}>

        {/* LOGO */}
        <Link href="/" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--primary)',
        }}>
          🍽️ Cafe Bella
        </Link>

        {/* DESKTOP LINKS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/menu" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: pathname === '/menu' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: pathname === '/menu' ? '600' : '400',
          }}>
            Menu
          </Link>

          {session ? (
            <>
              {session.user.role === 'admin' && (
                <Link href="/dashboard" style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--primary)',
                  fontWeight: '600',
                }}>
                  Dashboard
                </Link>
              )}
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                Hi, {session.user.name.split(' ')[0]}
              </span>
              <button onClick={() => signOut()} style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                Login
              </Link>
              <Link href="/signup" style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--primary-text)',
                background: 'var(--primary)',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
              }}>
                Sign Up
              </Link>
            </>
          )}

          {/* CART */}
          <Link href="/cart" style={{ position: 'relative' }}>
            <span style={{ fontSize: '22px' }}>🛒</span>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: 'var(--primary)',
                color: 'var(--primary-text)',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
              }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* BOTTOM NAVBAR — mobile */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
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
          { href: '/', icon: '🏠', label: 'Home' },
          { href: '/menu', icon: '🍽️', label: 'Menu' },
          { href: '/cart', icon: '🛒', label: 'Cart', badge: totalItems },
          { href: session ? '/profile' : '/login', icon: '👤', label: session ? 'Profile' : 'Login' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            position: 'relative',
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: '20px', position: 'relative' }}>
              {item.icon}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: 'var(--primary)',
                  color: 'var(--primary-text)',
                  fontSize: '9px',
                  fontWeight: '700',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.badge}
                </span>
              )}
            </span>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-body)',
              color: pathname === item.href ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: pathname === item.href ? '600' : '400',
            }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}