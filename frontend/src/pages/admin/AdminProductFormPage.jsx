import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../api';
import { useShop } from '../../context/ShopContext';

const CATEGORY_OPTIONS = [
  'VEG',
  'CHICKEN',
  'FISH & PRAWNS',
  'MUTTON',
  'BUFFALO',
  'RICE & MEALS'
];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  stockQuantity: '',
  category: 'VEG',
  packageWeight: '200g',
  imageUrl: '',
  listed: true,
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { handleProductAdded } = useShop();

  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEditing) return;

    async function loadProduct() {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/api/products/${id}`);
        if (!res.ok) {
          throw new Error(`Product not found (HTTP ${res.status})`);
        }
        const p = await res.json();
        setForm({
          name: p.name ?? '',
          description: p.description ?? '',
          price: String(p.price ?? ''),
          originalPrice: p.originalPrice ? String(p.originalPrice) : '',
          stockQuantity: String(p.stockQuantity ?? ''),
          category: p.category || 'VEG',
          packageWeight: p.packageWeight || '200g',
          imageUrl: p.imageUrl || '',
          listed: p.listed !== false,
        });
      } catch (err) {
        setError(err.message || 'Could not load product for editing');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, isEditing]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : null;

    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }

    if (isNaN(price) || price <= 0) {
      setError('Price must be greater than zero.');
      return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError('Stock quantity must be a non-negative whole number.');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      originalPrice,
      stockQuantity,
      category: form.category || 'VEG',
      packageWeight: form.packageWeight.trim() || '200g',
      imageUrl: form.imageUrl.trim() || null,
      listed: form.listed,
    };

    try {
      const url = isEditing ? `/api/products/${id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Save failed with status ${res.status}`;
        try {
          const json = await res.json();
          if (json?.message) msg = json.message;
        } catch {
          const txt = await res.text();
          if (txt) msg = txt;
        }
        throw new Error(msg);
      }

      const saved = await res.json();
      handleProductAdded(saved);
      setSuccess(`"${saved.name}" was ${isEditing ? 'updated' : 'created'} successfully!`);

      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading-card">
          <div className="spinner-ring" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-header-bar" style={{ marginBottom: '24px' }}>
        <Link to="/admin/products" className="checkout-back-link">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 className="admin-page-title font-serif">
            {isEditing ? `Edit Product #${id}` : 'Add New Product'}
          </h1>
          <p className="admin-page-subtitle">
            Fill in the authentic Kerala retort food details and set inventory quantities.
          </p>
        </div>

        {error && (
          <div className="admin-error-box" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="admin-success-box" style={{ marginBottom: '20px' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="checkout-field-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Fish Vattichathu 200g"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-field-row">
              <div className="checkout-field-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="checkout-field-group">
                <label htmlFor="packageWeight">Package Weight</label>
                <input
                  id="packageWeight"
                  name="packageWeight"
                  type="text"
                  placeholder="e.g. 200g, 250g, 300g"
                  value={form.packageWeight}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="checkout-field-group">
              <label htmlFor="description">Product Description *</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe authentic recipe, spices, Kerala cooking style..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkout-field-row">
              <div className="checkout-field-group">
                <label htmlFor="price">Selling Price (₹) *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 208.00"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field-group">
                <label htmlFor="originalPrice">Original Price / MRP (₹)</label>
                <input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 260.00 (optional)"
                  value={form.originalPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-field-group">
                <label htmlFor="stockQuantity">Stock Quantity *</label>
                <input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 50"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="checkout-field-group">
              <label htmlFor="imageUrl">Product Image URL</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                placeholder="e.g. /images/products/fish-vattichathu-200g-front.webp"
                value={form.imageUrl}
                onChange={handleChange}
              />
              <small style={{ color: '#6B7280', marginTop: '4px', display: 'block' }}>
                Enter web path or external image URL
              </small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input
                id="listed"
                name="listed"
                type="checkbox"
                checked={form.listed}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#15803D' }}
              />
              <label htmlFor="listed" style={{ fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                Visible in Customer Shop Catalogue (Listed)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button
              type="submit"
              className="checkout-primary-btn"
              disabled={saving}
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}</span>
            </button>

            <Link to="/admin/products" className="checkout-secondary-btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
