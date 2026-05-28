'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const categories = ['Starters', 'Main Course', 'Breads', 'Drinks', 'Desserts'];

const emptyForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'Starters', isVeg: true, isAvailable: true,
  preparationTime: '20 mins', image: '',
};

export default function DashboardMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/'); return; }
    if (status === 'authenticated') fetchItems();
  }, [status, session]);

  async function fetchItems() {
    setLoading(true);
    const res = await fetch('/api/menu');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.category) {
      showToast('Please fill name, price and category'); return;
    }
    setSaving(true);
    const body = { ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : null };

    if (editingId) {
      await fetch(`/api/menu/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast('Item updated successfully!');
    } else {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast('Item added successfully!');
    }

    setSaving(false);
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    fetchItems();
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeleting(id);
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    showToast('Item deleted!');
    setDeleting(null);
    fetchItems();
  }

  function handleEdit(item) {
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      originalPrice: item.originalPrice || '',
      category: item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime,
      image: item.image || '',
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filtered = filterCategory === 'All' ? items : items.filter(i => i.category === filterCategory);

  return (
    <main style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '60px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>← Dashboard</Link>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>🍽️ Menu Items</span>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditingId(null); }}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
        >
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </nav>

      <div style={{ padding: '24px' }}>

        {/* ADD/EDIT FORM */}
        {showForm && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
              {editingId ? '✏️ Edit Item' : '➕ Add New Item'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* NAME */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Item Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Butter Chicken" className="input" />
              </div>

              {/* DESCRIPTION */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the dish..."
                  rows={3}
                  className="input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* PRICE */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="299" className="input" />
              </div>

              {/* ORIGINAL PRICE */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Original Price (₹) — for discount</label>
                <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="399" className="input" />
              </div>

              {/* CATEGORY */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* PREP TIME */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Preparation Time</label>
                <input value={form.preparationTime} onChange={e => setForm({ ...form, preparationTime: e.target.value })} placeholder="20 mins" className="input" />
              </div>

              {/* IMAGE UPLOAD */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Food Photo
                  </label>

                  {/* PREVIEW */}
                  {form.image && (
                    <div style={{ marginBottom: '10px', position: 'relative', display: 'inline-block' }}>
                      <img
                        src={form.image}
                        alt="Preview"
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'block' }}
                      />
                      <button
                        onClick={() => setForm({ ...form, image: '' })}
                        style={{
                          position: 'absolute', top: '-8px', right: '-8px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: 'var(--error)', border: 'none',
                          color: '#fff', fontSize: '12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* UPLOAD BUTTON */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: 'var(--radius-md)',
                      background: uploading ? 'var(--border)' : 'var(--primary)',
                      color: uploading ? 'var(--text-muted)' : 'var(--primary-text)',
                      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'opacity 0.2s',
                    }}>
                      <span className="material-icons" style={{ fontSize: '18px' }}>
                        {uploading ? 'hourglass_empty' : 'upload'}
                      </span>
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          // Check file size — max 5MB
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('Image too large. Max 5MB allowed.');
                            return;
                          }

                          setUploading(true);
                          try {
                            const { uploadToCloudinary } = await import('@/lib/cloudinary');
                            const url = await uploadToCloudinary(file);
                            setForm(prev => ({ ...prev, image: url }));
                            showToast('Photo uploaded successfully!');
                          } catch (err) {
                            showToast('Upload failed. Please try again.');
                          }
                          setUploading(false);
                        }}
                      />
                    </label>

                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      or
                    </span>

                    <input
                      value={form.image}
                      onChange={e => setForm({ ...form, image: e.target.value })}
                      placeholder="Paste image URL..."
                      className="input"
                      style={{ flex: 1, minWidth: '200px' }}
                    />
                  </div>

                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                    JPG, PNG or WEBP — Max 5MB
                  </div>
                </div>

              {/* TOGGLES */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '24px' }}>
                {[
                  { label: '🥗 Vegetarian', key: 'isVeg' },
                  { label: '✅ Available', key: 'isAvailable' },
                ].map(toggle => (
                  <label key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form[toggle.key]}
                      onChange={e => setForm({ ...form, [toggle.key]: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text)' }}>{toggle.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px', borderRadius: 'var(--radius-md)', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : editingId ? 'Update Item ✓' : 'Add Item ✓'}
              </button>
              <button
                onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}
                className="btn-outline"
                style={{ padding: '12px 20px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)',
              border: '1.5px solid', cursor: 'pointer',
              borderColor: filterCategory === cat ? 'var(--primary)' : 'var(--border)',
              background: filterCategory === cat ? 'var(--primary)' : 'var(--bg)',
              color: filterCategory === cat ? 'var(--primary-text)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontSize: '13px',
              fontWeight: filterCategory === cat ? '600' : '400',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* STATS ROW */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Items', value: items.length },
            { label: 'Available', value: items.filter(i => i.isAvailable).length },
            { label: 'Unavailable', value: items.filter(i => !i.isAvailable).length },
            { label: 'Veg Items', value: items.filter(i => i.isVeg).length },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{stat.value}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>Loading menu...</div>
          </div>
        )}

        {/* ITEMS TABLE */}
        {!loading && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  {['Item', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>

                    {/* ITEM */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0 }}>
                          {item.image
                            ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🍽️</div>
                          }
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <div className={item.isVeg ? 'badge-veg' : 'badge-nonveg'} />
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{item.name}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>⏱️ {item.preparationTime}</span>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</span>
                    </td>

                    {/* PRICE */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>₹{item.price}</span>
                      {item.originalPrice && <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'line-through', marginLeft: '6px' }}>₹{item.originalPrice}</span>}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                        padding: '4px 10px', borderRadius: 'var(--radius-full)',
                        background: item.isAvailable ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: item.isAvailable ? 'var(--success)' : 'var(--error)',
                      }}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(item)} style={{
                          padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                          fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text)',
                          cursor: 'pointer', fontWeight: '500',
                        }}>
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deleting === item._id}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--error-bg)', border: '1px solid var(--error)',
                            fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--error)',
                            cursor: 'pointer', fontWeight: '500',
                            opacity: deleting === item._id ? 0.7 : 1,
                          }}
                        >
                          {deleting === item._id ? '...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
                No items in this category
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOAST */}
      <div className={`toast ${toast ? 'show' : ''}`} style={{ background: 'var(--bg-dark)', bottom: '24px' }}>{toast}</div>

    </main>
  );
}