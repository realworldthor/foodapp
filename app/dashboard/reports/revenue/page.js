'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RevenuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/'); return; }
    if (status === 'authenticated') fetchOrders();
  }, [status, session]);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  // Group orders by date
  function getRevenueByDay() {
    const days = parseInt(range);
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === dateStr;
      });

      const delivered = dayOrders.filter(o => o.status === 'delivered');
      const revenue = delivered.reduce((acc, o) => acc + o.total, 0);

      result.push({
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        totalOrders: dayOrders.length,
        deliveredOrders: delivered.length,
        cancelledOrders: dayOrders.filter(o => o.status === 'cancelled').length,
        revenue,
        isToday: dateStr === new Date().toDateString(),
      });
    }
    return result;
  }

  const revenueData = getRevenueByDay();
  const totalRevenue = revenueData.reduce((acc, d) => acc + d.revenue, 0);
  const totalOrders = revenueData.reduce((acc, d) => acc + d.totalOrders, 0);
  const totalDelivered = revenueData.reduce((acc, d) => acc + d.deliveredOrders, 0);
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* PAGE HEADER */}
      <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Reports</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>Revenue Report</h1>
        </div>

        {/* DATE RANGE */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '7 Days', value: '7' },
            { label: '14 Days', value: '14' },
            { label: '30 Days', value: '30' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setRange(opt.value)} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid', cursor: 'pointer', transition: 'all 0.2s',
              borderColor: range === opt.value ? 'var(--primary)' : 'var(--border)',
              background: range === opt.value ? 'var(--primary)' : 'var(--bg-card)',
              color: range === opt.value ? 'var(--primary-text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: range === opt.value ? '600' : '400',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue}`, sub: `Last ${range} days`, color: 'var(--primary)' },
            { label: 'Total Orders', value: totalOrders, sub: `Last ${range} days`, color: 'var(--info)' },
            { label: 'Delivered', value: totalDelivered, sub: `${totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0}% success rate`, color: 'var(--success)' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* BAR CHART */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '24px' }}>
            Daily Revenue
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', marginBottom: '8px' }}>
            {revenueData.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {day.revenue > 0 ? `₹${day.revenue}` : ''}
                </div>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  background: day.isToday ? 'var(--primary)' : 'var(--primary-light)',
                  height: `${Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 4 : 1)}%`,
                  minHeight: '2px',
                  border: day.isToday ? 'none' : '1px solid var(--border)',
                  transition: 'height 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                }} title={`${day.date}: ₹${day.revenue}`} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {revenueData.map((day, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: day.isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: day.isToday ? '700' : '400' }}>
                  {day.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REVENUE TABLE */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>Day by Day Breakdown</h2>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Date', 'Total Orders', 'Delivered', 'Cancelled', 'Revenue'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueData.map((day, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: day.isToday ? 'var(--primary-light)' : 'transparent' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: day.isToday ? 700 : 400, color: day.isToday ? 'var(--primary)' : 'var(--text)' }}>
                        {day.isToday ? 'Today' : day.date}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>{day.day}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text)' }}>{day.totalOrders}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--success)', fontWeight: '600' }}>{day.deliveredOrders}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: day.cancelledOrders > 0 ? 'var(--error)' : 'var(--text-muted)' }}>{day.cancelledOrders}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: day.revenue > 0 ? 'var(--text)' : 'var(--text-dim)' }}>
                        {day.revenue > 0 ? `₹${day.revenue}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-secondary)', borderTop: '2px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Total</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{totalOrders}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>{totalDelivered}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--error)' }}>{revenueData.reduce((acc, d) => acc + d.cancelledOrders, 0)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>₹{totalRevenue}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

      </div>
    </main>
  );
}