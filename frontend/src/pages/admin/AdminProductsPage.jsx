import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { apiFetch } from '../../api';
import { useShop } from '../../context/ShopContext';

export default function AdminProductsPage() {
  const { handleProductDeleted } = useShop();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/admin/products');
      if (!res.ok) {
        throw new Error(`Failed to load admin products (HTTP ${res.status})`);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Could not load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete or unlist "${product.name}"? If historical orders reference it, it will be safely hidden from the shop catalogue.`
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    setMessage('');
    try {
      const res = await apiFetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Failed to delete product (HTTP ${res.status})`);
      }
      const result = await res.json();
      setMessage(
        result.status === 'HIDDEN'
          ? `"${product.name}" is linked to previous customer orders and was unlisted from catalogue.`
          : `"${product.name}" was permanently deleted.`
      );
      handleProductDeleted(product.id);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Could not delete product');
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      String(p.id).includes(q)
    );
  });

  return (
    <div className="admin-page-container">
      {/* Header Row */}
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-title font-serif">Product Catalogue Management</h1>
          <p className="admin-page-subtitle">
            Manage your Kerala retort food products, inventory stock levels, and active menu listings.
          </p>
        </div>
        <Link to="/admin/products/new" className="checkout-primary-btn">
          <Plus size={18} />
          <span>Add New Product</span>
        </Link>
      </div>

      {message && (
        <div className="admin-success-box" style={{ marginBottom: '16px' }}>
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="admin-error-box" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Toolbar */}
      <div className="admin-card toolbar-card">
        <div className="admin-toolbar-row">
          <div className="catalog-search-box" style={{ maxWidth: '400px' }}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search products by title, category, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-toolbar-stats">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> total products
            </span>
            <button
              type="button"
              className="admin-table-action-btn"
              onClick={loadProducts}
              title="Refresh product list"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading-card">
            <div className="spinner-ring" />
            <p>Loading catalogue products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-empty-state">
            <Package size={48} color="#9CA3AF" />
            <h3 className="font-serif">No products found</h3>
            <p>No products match your search query.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const stock = Number(p.stockQuantity) || 0;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= 10;
                  return (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.imageUrl || '/images/brand/logo.png'}
                          alt={p.name}
                          className="admin-table-thumb"
                          onError={(e) => {
                            e.target.src = '/images/brand/logo.png';
                          }}
                        />
                      </td>
                      <td>
                        <strong className="table-product-title">{p.name}</strong>
                        <div className="table-product-sub">
                          <span>#{p.id}</span>
                          {p.packageWeight && <span>• {p.packageWeight}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="table-cat-badge">{p.category || 'VEG'}</span>
                      </td>
                      <td>
                        <strong className="table-price">₹{Number(p.price).toFixed(2)}</strong>
                        {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                          <del className="table-price-old">₹{Number(p.originalPrice).toFixed(2)}</del>
                        )}
                      </td>
                      <td>
                        <span className={`stock-status ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
                          {isOutOfStock ? 'Out of stock (0)' : isLowStock ? `Low: ${stock} units` : `${stock} units`}
                        </span>
                      </td>
                      <td>
                        {p.listed ? (
                          <span className="status-pill placed">Listed</span>
                        ) : (
                          <span className="status-pill cancelled">Unlisted</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-row-actions">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="admin-table-action-btn edit"
                            title="Edit Product"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            type="button"
                            className="admin-table-action-btn delete"
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            title="Delete / Unlist Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
