'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/'); return; }
    if (status === 'authenticated') fetchPendingCount();
  }, [status, session]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function fetchPendingCount() {
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (Array.isArray(data)) {
      setPendingCount(data.filter(o => o.status === 'pending').length);
    }
  }

  const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Overview' },
    { href: '/dashboard/orders', icon: 'receipt_long', label: 'Orders', badge: pendingCount },
    { href: '/dashboard/menu', icon: 'restaurant_menu', label: 'Menu' },
    { href: '/dashboard/settings', icon: 'settings', label: 'Settings' },
  ];

  if (status === 'loading') return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    </main>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-secondary)' }}>

      {/* TOP NAVBAR */}
      <nav style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* HAMBURGER — mobile only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="dashboard-hamburger"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              width: '36px', height: '36px', display: 'none',
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)', color: 'var(--text)',
            }}
          >
            <span className="material-icons" style={{ fontSize: '22px' }}>
              {sidebarOpen ? 'close' : 'menu'}
            </span>
          </button>

          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
            Admin Panel
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>open_in_new</span>
            <span className="dashboard-hide-mobile">View Site</span>
          </Link>
          <span className="dashboard-hide-mobile" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
            Hi, {session?.user?.name?.split(' ')[0]}
          </span>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--error)',
            background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>logout</span>
            <span className="dashboard-hide-mobile">Logout</span>
          </button>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY — mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 150,
          }}
          className="dashboard-overlay"
        />
      )}

      {/* SIDEBAR + CONTENT */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* SIDEBAR */}
        <aside
          className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar-open' : ''}`}
          style={{
            width: '220px',
            flexShrink: 0,
            background: 'var(--bg)',
            borderRight: '1px solid var(--border)',
            padding: '24px 0 80px',
            position: 'sticky',
            top: '60px',
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
          }}
        >
          {/* NAV ITEMS */}
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 20px',
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '400',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s', textDecoration: 'none',
              }}>
                <span className="material-icons" style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
                {item.badge > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: 'var(--error)',
                    color: 'white', fontSize: '11px', fontWeight: 700,
                    borderRadius: '50%', width: '20px', height: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* DIVIDER */}
          <div style={{ height: '1px', background: 'var(--border)', margin: '16px 20px' }} />

          {/* REPORTS */}
          <div style={{ padding: '0 20px 8px', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Reports
          </div>
          {[
            { href: '/dashboard/reports/revenue', icon: 'bar_chart', label: 'Revenue' },
            { href: '/dashboard/reports/today', icon: 'today', label: 'Today' },
          ].map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 20px',
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '400',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s', textDecoration: 'none',
              }}>
                <span className="material-icons" style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* DIVIDER */}
          <div style={{ height: '1px', background: 'var(--border)', margin: '16px 20px' }} />

          {/* LIVE STATUS */}
          <div style={{ padding: '0 20px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Live Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>System Online</span>
            </div>
            {pendingCount > 0 && (
              <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginTop: '8px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: 'var(--error)' }}>
                  {pendingCount} pending order{pendingCount > 1 ? 's' : ''}
                </div>
                <Link href="/dashboard/orders" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--error)', fontWeight: '600' }}>
                  View now →
                </Link>
              </div>
            )}
          </div>

          {/* ADMIN INFO */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--primary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontFamily: 'var(--font-heading)',
                fontSize: '14px', fontWeight: 700, color: 'var(--primary-text)', flexShrink: 0,
              }}>
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session?.user?.name}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: '70px' }}>
          {children}
        </div>

      </div>

      {/* BOTTOM NAV — mobile only */}
      <div className="dashboard-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg)', borderTop: '1px solid var(--border)',
        display: 'none', alignItems: 'center', justifyContent: 'space-around',
        height: '60px', zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
      }}>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '2px', flex: 1, padding: '6px 0',
              textDecoration: 'none', position: 'relative',
            }}>
              <div style={{ position: 'relative' }}>
                <span className="material-icons" style={{
                  fontSize: '22px',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  {item.icon}
                </span>
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-6px',
                    background: 'var(--error)', color: 'white',
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
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}