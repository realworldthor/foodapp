// app/dashboard/order/[id]/print/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrintReceiptPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const id = await params.id;
      const [orderRes, restRes] = await Promise.all([
        fetch(`/api/orders/${id}`),
        fetch('/api/restaurant'),
      ]);
      const orderData = await orderRes.json();
      const restData = await restRes.json();
      setOrder(orderData);
      setRestaurant(restData);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && order) {
      setTimeout(() => window.print(), 300);
    }
  }, [loading, order]);

  if (loading) return <p style={{ padding: 24, fontFamily: 'monospace' }}>Loading receipt...</p>;
  if (!order) return <p style={{ padding: 24 }}>Order not found.</p>;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = order.total;

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fff; }

        .receipt {
          width: 320px;
          margin: 0 auto;
          padding: 24px 16px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #000;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .receipt-header h1 {
          font-size: 20px;
          font-weight: 700;
          font-family: sans-serif;
          letter-spacing: 1px;
        }

        .receipt-header p {
          font-size: 12px;
          margin-top: 2px;
          color: #444;
        }

        .divider {
          border: none;
          border-top: 1px dashed #000;
          margin: 12px 0;
        }

        .receipt-meta {
          margin-bottom: 4px;
        }

        .receipt-meta p {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .receipt-meta span {
          font-weight: 600;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 4px 0;
        }

        .items-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          padding-bottom: 4px;
          border-bottom: 1px solid #000;
        }

        .items-table th:last-child,
        .items-table td:last-child {
          text-align: right;
        }

        .items-table td {
          padding: 5px 0;
          vertical-align: top;
          font-size: 12px;
        }

        .item-name {
          max-width: 140px;
        }

        .totals {
          width: 100%;
          margin-top: 4px;
        }

        .totals tr td {
          padding: 3px 0;
          font-size: 12px;
        }

        .totals tr td:last-child {
          text-align: right;
        }

        .total-row td {
          font-weight: 700;
          font-size: 14px;
          padding-top: 6px;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 16px;
          font-size: 12px;
          color: #555;
        }

        .no-print {
          display: flex;
          justify-content: center;
          gap: 12px;
          padding: 24px;
          background: #f3f4f6;
        }

        .btn {
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .btn-primary { background: #ff6b35; color: #fff; }
        .btn-secondary { background: #e5e7eb; color: #1a1a1a; }

        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .receipt { margin: 0; padding: 12px; }
        }
      `}</style>

      <div className="no-print">
        <button className="btn btn-secondary" onClick={() => window.close()}>← Close</button>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨 Print</button>
      </div>

      <div className="receipt">
        <div className="receipt-header">
          <h1>{restaurant?.name || 'Restaurant'}</h1>
          {restaurant?.address && <p>{restaurant.address}</p>}
          {restaurant?.phone && <p>📞 {restaurant.phone}</p>}
        </div>

        <hr className="divider" />

        <div className="receipt-meta">
          <p>Order ID: <span>#{order._id.toString().slice(-6).toUpperCase()}</span></p>
          <p>Date: <span>{formatDate(order.createdAt)}</span></p>
          <p>Payment: <span>{order.paymentMethod?.toUpperCase()}</span></p>
          <p>Status: <span>{order.status?.toUpperCase()}</span></p>
        </div>

        <hr className="divider" />

        <div className="receipt-meta">
          <p>Customer: <span>{order.customer?.name}</span></p>
          {order.customer?.phone && <p>Phone: <span>{order.customer.phone}</span></p>}
          {order.address && (
            <p style={{ alignItems: 'flex-start' }}>
              Address: <span style={{ textAlign: 'right', maxWidth: '160px' }}>
                {typeof order.address === 'object'
                  ? `${order.address.street}, ${order.address.city} - ${order.address.pincode}`
                  : order.address}
              </span>
            </p>
          )}
        </div>

        <hr className="divider" />

        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th>Amt</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="item-name">{item.name}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="divider" />

        <table className="totals">
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>₹{subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (5%)</td>
              <td>₹{tax.toFixed(2)}</td>
            </tr>
            <tr className="total-row">
              <td>TOTAL</td>
              <td>₹{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <hr className="divider" />

        <div className="receipt-footer">
          <p>Thank you for your order!</p>
          <p style={{ marginTop: 4 }}>Please come again 🙏</p>
        </div>
      </div>
    </>
  );
}