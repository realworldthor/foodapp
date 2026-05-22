'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/'); return; }
    if (status === 'authenticated') {
      fetchOrders();

      // Auto refresh every 15 seconds
      const interval = setInterval(() => {
        fetchOrders();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [status, session]);

  async function fetchData() {
  setLoading(true);

  const [ordersRes, menuRes, restaurantRes] = await Promise.all([
    fetch('/api/orders'),
    fetch('/api/menu'),
    fetch('/api/restaurant'),
  ]);

  const [ordersData, menuData, restaurantData] = await Promise.all([
    ordersRes.json(),
    menuRes.json(),
    restaurantRes.json(),
  ]);

  setOrders(Array.isArray(ordersData) ? ordersData : []);
  setMenuItems(Array.isArray(menuData) ? menuData : []);
  setRestaurant(restaurantData);
  setLoading(false);
}

async function fetchOrders() {
  await fetchData();
}

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const todayOrders = orders.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const statusColor = {
    pending: 'var(--warning)',
    accepted: 'var(--info)',
    preparing: 'var(--warning)',
    ready: 'var(--success)',
    delivered: 'var(--success)',
    cancelled: 'var(--error)',
  };

  if (status === 'loading' || loading) return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading dashboard...</div>
      </div>
    </main>
  );

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* DASHBOARD NAVBAR */}
      <nav style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
            🍽️ Admin
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
            {restaurant?.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
            View Site ↗
          </Link>
          <button onClick={() => signOut()} style={{
            fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--error)',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}>
            Logout
          </button>
        </div>
      </nav>

      {/* SIDEBAR + CONTENT */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>

        {/* SIDEBAR */}
        <aside style={{
          width: '220px',
          flexShrink: 0,
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          padding: '24px 0',
        }}>
          {[
            { href: '/dashboard', icon: '▦', label: 'Overview', active: true },
            { href: '/dashboard/orders', icon: '📦', label: 'Orders', badge: pendingOrders },
            { href: '/dashboard/menu', icon: '🍽️', label: 'Menu Items' },
            { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: item.active ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: item.active ? '600' : '400',
              background: item.active ? 'var(--primary-light)' : 'transparent',
              borderLeft: item.active ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--error)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>

          {/* PAGE TITLE */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Overview</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>Dashboard</h1>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: '💰', change: 'All time' },
              { label: 'Today\'s Orders', value: todayOrders, icon: '📦', change: 'Today' },
              { label: 'Pending Orders', value: pendingOrders, icon: '⏳', change: 'Need action' },
              { label: 'Menu Items', value: menuItems.length, icon: '🍽️', change: 'Total items' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
                  <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)' }}>{stat.change}</div>
              </div>
            ))}
          </div>

          {/* TWO COLS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>

            {/* RECENT ORDERS */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Recent Orders</h2>
                <Link href="/dashboard/orders" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>View all →</Link>
              </div>
              <div>
                {orders.slice(0, 6).map((order, i) => (
                  <div key={order._id} style={{
                    padding: '14px 20px',
                    borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                        {order.address?.name || 'Customer'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {order.items?.length} item{order.items?.length > 1 ? 's' : ''} · ₹{order.total}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                      padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      background: `${statusColor[order.status]}20`,
                      color: statusColor[order.status],
                      textTransform: 'capitalize',
                    }}>
                      {order.status}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
                    No orders yet
                  </div>
                )}
              </div>
            </div>

            {/* QUICK ACTIONS + RESTAURANT STATUS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* RESTAURANT STATUS */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Restaurant Status</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Currently</span>
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                    background: restaurant?.isOpen ? 'var(--success-bg)' : 'var(--error-bg)',
                    color: restaurant?.isOpen ? 'var(--success)' : 'var(--error)',
                  }}>
                    {restaurant?.isOpen ? '🟢 Open' : '🔴 Closed'}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  ⏰ {restaurant?.openingTime} — {restaurant?.closingTime}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                  🛵 {restaurant?.deliveryTime} delivery
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { href: '/dashboard/orders', label: '📦 View Pending Orders', count: pendingOrders },
                    { href: '/dashboard/menu', label: '➕ Add Menu Item' },
                    { href: '/dashboard/settings', label: '⚙️ Update Settings' },
                  ].map(action => (
                    <Link key={action.href} href={action.href} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                      fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)',
                      fontWeight: '500', transition: 'all 0.2s',
                    }}>
                      {action.label}
                      {action.count > 0 && (
                        <span style={{ background: 'var(--error)', color: 'white', fontSize: '11px', fontWeight: 700, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {action.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}