import React, { useEffect, useState } from 'react';
import {
  Plus,
  CheckCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldAlert,
  Search,
  IndianRupee,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { apiFetch } from './api';
import './Admin.css';


const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

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
  imageUrl: ''
};

function Admin({ onProductAdded, onProductDeleted, onBack }) {
  // Product state
  const [form, setForm] = useState({ ...emptyForm });
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [listError, setListError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Order state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderMessageError, setOrderMessageError] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  // ---------------- PRODUCTS ----------------

  async function loadProducts() {
    setLoadingProducts(true);
    setListError('');

    try {
      const response = await apiFetch('/api/products');

      if (!response.ok) {
        throw new Error('Could not load products.');
      }

      setProducts(await response.json());
    } catch (error) {
      setListError(
          error.message || 'Could not connect to the backend.'
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  function showMessage(text, error = false) {
    setMessage(text);
    setIsError(error);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleEdit(product) {
    setEditingProduct(product);

    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: String(product.price ?? ''),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      stockQuantity: String(product.stockQuantity ?? ''),
      category: product.category || 'VEG',
      packageWeight: product.packageWeight || '200g',
      imageUrl: product.imageUrl || ''
    });

    showMessage('');
    setListError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingProduct(null);
    setForm({ ...emptyForm });
    showMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    showMessage('');

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : null;

    if (
        !form.name.trim() ||
        !form.description.trim() ||
        form.price.trim() === '' ||
        form.stockQuantity.trim() === '' ||
        !Number.isFinite(price) ||
        price <= 0 ||
        !Number.isInteger(stockQuantity) ||
        stockQuantity < 0
    ) {
      showMessage(
          'Enter a valid product name, description, positive price, and non-negative stock.',
          true
      );
      return;
    }

    setSaving(true);

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      originalPrice,
      stockQuantity,
      category: form.category || 'VEG',
      packageWeight: form.packageWeight.trim() || '200g',
      imageUrl: form.imageUrl.trim() || null
    };

    const isEditing = editingProduct !== null;
    const url = isEditing
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

    try {
      const response = await apiFetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
            details || `Request failed: ${response.status}`
        );
      }

      const savedProduct = await response.json();

      setForm({ ...emptyForm });
      setEditingProduct(null);

      showMessage(
          isEditing
              ? `"${savedProduct.name}" was updated successfully!`
              : `"${savedProduct.name}" was added successfully!`
      );

      if (onProductAdded) {
        onProductAdded(savedProduct);
      }

      await loadProducts();
    } catch (error) {
      console.error('Could not save product:', error);
      showMessage(
          error.message || 'Could not save the product.',
          true
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
        `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    showMessage('');

    try {
      const response = await apiFetch(
          `/api/products/${product.id}`,
          { method: 'DELETE' }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
            details || `Delete failed: ${response.status}`
        );
      }

      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
        setForm({ ...emptyForm });
      }

      setProducts((current) =>
          current.filter((item) => item.id !== product.id)
      );

      if (onProductDeleted) {
        onProductDeleted(product.id);
      }

      showMessage(`"${product.name}" was deleted successfully!`);
    } catch (error) {
      console.error('Could not delete product:', error);
      showMessage(
          error.message || 'Could not delete the product.',
          true
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ---------------- ORDERS ----------------

  async function loadOrders() {
    setLoadingOrders(true);
    setOrdersError('');

    try {
      const response = await apiFetch('/api/orders');

      if (response.status === 401) {
        throw new Error('Your admin session is missing or expired. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Admin access is required to view customer orders.');
      }
      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Could not load orders (HTTP ${response.status}).`);
      }

      const data = await response.json();
      setOrders(data);

      setSelectedStatuses((current) => {
        const next = { ...current };
        data.forEach((order) => {
          next[order.id] = order.status;
        });
        return next;
      });
    } catch (error) {
      setOrdersError(
          error.message || 'Could not load customer orders.'
      );
    } finally {
      setLoadingOrders(false);
    }
  }

  async function toggleOrderDetails(orderId) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    setOrdersError('');

    if (orderItems[orderId]) return;

    setLoadingOrderId(orderId);

    try {
      const response = await apiFetch(
          `/api/orders/${orderId}/items`
      );

      if (response.status === 401) {
        throw new Error('Your admin session is missing or expired. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Admin access is required to view order items.');
      }
      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Could not load order items (HTTP ${response.status}).`);
      }

      const data = await response.json();

      setOrderItems((current) => ({
        ...current,
        [orderId]: data,
      }));
    } catch (error) {
      setOrdersError(
          error.message || 'Could not load order items.'
      );
    } finally {
      setLoadingOrderId(null);
    }
  }

  async function handleUpdateStatus(order) {
    const newStatus = selectedStatuses[order.id];

    if (!newStatus || newStatus === order.status) {
      setOrderMessage('Select a different status first.');
      setOrderMessageError(true);
      return;
    }

    setUpdatingOrderId(order.id);
    setOrderMessage('');

    try {
      const response = await apiFetch(
          `/api/orders/${order.id}/status`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: newStatus,
            }),
          }
      );

      if (response.status === 401) {
        throw new Error('Your admin session is missing or expired. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Admin access is required to update order status.');
      }

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
            details || `Status update failed: ${response.status}`
        );
      }

      const updatedOrder = await response.json();

      setOrders((current) =>
          current.map((item) =>
              item.id === order.id ? updatedOrder : item
          )
      );

      setSelectedStatuses((current) => ({
        ...current,
        [order.id]: updatedOrder.status,
      }));

      setOrderMessage(
          `Order #${order.id} status updated to ${updatedOrder.status}.`
      );
      setOrderMessageError(false);
    } catch (error) {
      console.error('Could not update order status:', error);
      setOrderMessage(
          error.message || 'Could not update order status.'
      );
      setOrderMessageError(true);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // Filtered views
  const filteredProducts = products.filter(p =>
      (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
      String(o.id).includes(orderSearch) ||
      (o.customerName || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.phone || '').includes(orderSearch)
  );

  // Statistics
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'CANCELLED' ? sum + Number(o.totalAmount || 0) : sum, 0);
  const lowStockCount = products.filter(p => Number(p.stockQuantity) <= 5).length;

  return (
      <section className="admin-page-container">
        {/* Top Header */}
        <div className="admin-top-bar">
          <button
              type="button"
              onClick={onBack}
              className="admin-back-btn"
          >
            <ArrowLeft size={16} />
            <span>Back to Storefront</span>
          </button>

          <div className="admin-user-pill">
            <span className="admin-status-dot" />
            <span>Admin Portal Active</span>
          </div>
        </div>

        {/* Security Limitation Advisory */}
        <div className="admin-security-alert">
          <ShieldAlert size={20} color="#B45309" />
          <div>
            <strong>Security Limitation Notice</strong>
            <p>
              Admin requests use the shared authentication helper. The Spring Boot backend must also enforce ADMIN-role authorization on every admin-only endpoint; frontend checks alone are not sufficient.
            </p>
          </div>
        </div>

        {/* Key Metric Stats Cards */}
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="metric-icon-box green">
              <Package size={22} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Total Products</span>
              <strong className="metric-val">{products.length}</strong>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-box gold">
              <ShoppingBag size={22} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Total Orders</span>
              <strong className="metric-val">{orders.length}</strong>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-box blue">
              <IndianRupee size={22} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Active Order Revenue</span>
              <strong className="metric-val">₹{totalRevenue.toFixed(2)}</strong>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-box red">
              <AlertCircle size={22} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Low Stock Alerts</span>
              <strong className="metric-val">{lowStockCount}</strong>
            </div>
          </div>
        </div>

        {/* Dashboard View Tabs */}
        <div className="admin-tabs-row">
          <button
              type="button"
              className={`admin-view-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
          >
            <Package size={17} />
            <span>Product Catalogue ({products.length})</span>
          </button>

          <button
              type="button"
              className={`admin-view-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={17} />
            <span>Customer Orders ({orders.length})</span>
          </button>
        </div>

        {/* Tab 1: Product Management */}
        {activeTab === 'products' && (
            <div className="admin-tab-content">
              {/* Product form */}
              <div className="admin-card-box">
                <div className="admin-box-header">
                  <div>
                <span className="box-eyebrow">
                  {editingProduct ? 'EDIT EXISTING RECORD' : 'NEW CATALOGUE ENTRY'}
                </span>
                    <h2 className="box-title font-serif">
                      {editingProduct ? `Edit "${editingProduct.name}"` : 'Add a New Ready-to-Eat Product'}
                    </h2>
                  </div>
                </div>

                <form className="admin-crud-form" onSubmit={handleSubmit}>
                  <div className="admin-form-row col-2">
                    <div className="admin-field">
                      <label htmlFor="p-name">Product Name *</label>
                      <input
                          id="p-name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. Fish Vattichathu 200g"
                          maxLength={100}
                          required
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="p-category">Category *</label>
                      <select
                          id="p-category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                      >
                        {CATEGORY_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="p-desc">Description *</label>
                    <textarea
                        id="p-desc"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Authentic ingredients, regional Kerala cooking technique, spices..."
                        rows={3}
                        maxLength={1000}
                        required
                    />
                  </div>

                  <div className="admin-form-row col-4">
                    <div className="admin-field">
                      <label htmlFor="p-price">Selling Price (₹) *</label>
                      <input
                          id="p-price"
                          name="price"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="208.00"
                          required
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="p-orig-price">Original Price (₹)</label>
                      <input
                          id="p-orig-price"
                          name="originalPrice"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={form.originalPrice}
                          onChange={handleChange}
                          placeholder="260.00"
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="p-stock">Stock Quantity *</label>
                      <input
                          id="p-stock"
                          name="stockQuantity"
                          type="number"
                          min="0"
                          step="1"
                          value={form.stockQuantity}
                          onChange={handleChange}
                          placeholder="35"
                          required
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="p-weight">Weight (g)</label>
                      <input
                          id="p-weight"
                          name="packageWeight"
                          type="text"
                          value={form.packageWeight}
                          onChange={handleChange}
                          placeholder="200g"
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="p-img">Image URL / Path</label>
                    <input
                        id="p-img"
                        name="imageUrl"
                        type="text"
                        value={form.imageUrl}
                        onChange={handleChange}
                        placeholder="/images/products/fish-vattichathu-200g-front.webp"
                    />
                  </div>

                  {message && (
                      <div className={`admin-alert ${isError ? 'error' : 'success'}`}>
                        {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                        <span>{message}</span>
                      </div>
                  )}

                  <div className="admin-actions-bar">
                    <button
                        className="admin-primary-btn"
                        type="submit"
                        disabled={saving}
                    >
                      {saving ? (
                          <span>Saving...</span>
                      ) : editingProduct ? (
                          <>
                            <CheckCircle size={17} />
                            <span>Update Product</span>
                          </>
                      ) : (
                          <>
                            <Plus size={17} />
                            <span>Save to Catalogue</span>
                          </>
                      )}
                    </button>

                    {editingProduct && (
                        <button
                            className="admin-cancel-btn"
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                        >
                          <X size={16} />
                          <span>Cancel Edit</span>
                        </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Product Catalogue Table */}
              <div className="admin-card-box">
                <div className="admin-box-header split">
                  <div>
                    <span className="box-eyebrow">DATABASE INVENTORY</span>
                    <h2 className="box-title font-serif">Product Catalogue ({products.length})</h2>
                  </div>

                  <div className="admin-table-tools">
                    <div className="admin-search-wrap">
                      <Search size={16} />
                      <input
                          type="search"
                          placeholder="Search by name or category..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>

                    <button
                        className="admin-refresh-btn"
                        type="button"
                        onClick={loadProducts}
                        disabled={loadingProducts}
                        title="Reload from Spring Boot"
                    >
                      <RefreshCw size={15} className={loadingProducts ? 'spinning-icon' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {loadingProducts && <p className="admin-table-status">Loading products...</p>}
                {listError && <p className="admin-table-status error">{listError}</p>}

                {!loadingProducts && !listError && (
                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                        <tr>
                          <th>ID</th>
                          <th>Photo</th>
                          <th>Product & Category</th>
                          <th>Price & Weight</th>
                          <th>Stock Status</th>
                          <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProducts.map((p) => {
                          const stock = Number(p.stockQuantity) || 0;
                          return (
                              <tr key={p.id}>
                                <td><strong>#{p.id}</strong></td>
                                <td>
                                  <img
                                      src={p.imageUrl || '/images/brand/logo.png'}
                                      alt={p.name}
                                      className="admin-table-thumb"
                                      onError={(e) => { e.target.src = '/images/brand/logo.png'; }}
                                  />
                                </td>
                                <td>
                                  <strong>{p.name}</strong>
                                  <span className="admin-badge-cat">{p.category || 'General'}</span>
                                  <small className="admin-cell-desc">{p.description}</small>
                                </td>
                                <td>
                                  <div className="admin-price-cell">
                                    <strong>₹{Number(p.price).toFixed(2)}</strong>
                                    {p.originalPrice && (
                                        <del>₹{Number(p.originalPrice).toFixed(2)}</del>
                                    )}
                                    <small>{p.packageWeight || '200g'}</small>
                                  </div>
                                </td>
                                <td>
                            <span className={`admin-stock-tag ${stock <= 0 ? 'out' : stock <= 5 ? 'low' : 'ok'}`}>
                              {stock <= 0 ? 'Out of stock' : `${stock} in stock`}
                            </span>
                                </td>
                                <td>
                                  <div className="admin-row-btns">
                                    <button
                                        className="admin-icon-btn edit"
                                        type="button"
                                        onClick={() => handleEdit(p)}
                                        disabled={saving || deletingId !== null}
                                        title="Edit product"
                                    >
                                      <Pencil size={15} />
                                    </button>

                                    <button
                                        className="admin-icon-btn delete"
                                        type="button"
                                        onClick={() => handleDelete(p)}
                                        disabled={saving || deletingId !== null}
                                        title="Delete product"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          );
                        })}
                        {filteredProducts.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-4">
                                No products found matching your search.
                              </td>
                            </tr>
                        )}
                        </tbody>
                      </table>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
            <div className="admin-tab-content">
              <div className="admin-card-box">
                <div className="admin-box-header split">
                  <div>
                    <span className="box-eyebrow">ORDER FULFILLMENT</span>
                    <h2 className="box-title font-serif">Customer Orders ({orders.length})</h2>
                  </div>

                  <div className="admin-table-tools">
                    <div className="admin-search-wrap">
                      <Search size={16} />
                      <input
                          type="search"
                          placeholder="Search by ID, name, or phone..."
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                      />
                    </div>

                    <button
                        className="admin-refresh-btn"
                        type="button"
                        onClick={loadOrders}
                        disabled={loadingOrders}
                    >
                      <RefreshCw size={15} className={loadingOrders ? 'spinning-icon' : ''} />
                      <span>Refresh Orders</span>
                    </button>
                  </div>
                </div>

                {orderMessage && (
                    <div className={`admin-alert ${orderMessageError ? 'error' : 'success'}`}>
                      {orderMessageError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                      <span>{orderMessage}</span>
                    </div>
                )}

                {loadingOrders && <p className="admin-table-status">Loading orders...</p>}
                {ordersError && <p className="admin-table-status error">{ordersError}</p>}

                {!loadingOrders && !ordersError && (
                    <div className="admin-table-responsive">
                      <table className="admin-table">
                        <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer & Address</th>
                          <th>Phone</th>
                          <th>Total & Mode</th>
                          <th>Update Status</th>
                          <th>Order Items</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredOrders.map((order) => {
                          const isCancelled = order.status === 'CANCELLED';
                          return (
                              <tr key={order.id}>
                                <td><strong>#{order.id}</strong></td>
                                <td>
                                  <strong>{order.customerName}</strong>
                                  <small>{order.email || 'No email'}</small>
                                  <small className="admin-cell-desc">{order.deliveryAddress}</small>
                                </td>
                                <td>
                                  <code>{order.phone}</code>
                                </td>
                                <td>
                                  <strong>₹{Number(order.totalAmount).toFixed(2)}</strong>
                                  <span className="admin-payment-pill">{order.paymentMethod}</span>
                                </td>
                                <td>
                                  <div className="admin-status-control">
                                    <select
                                        value={selectedStatuses[order.id] ?? order.status}
                                        onChange={(e) => {
                                          setSelectedStatuses(prev => ({
                                            ...prev,
                                            [order.id]: e.target.value
                                          }));
                                          setOrderMessage('');
                                        }}
                                        disabled={updatingOrderId !== null || isCancelled}
                                        className={`admin-status-select ${order.status.toLowerCase()}`}
                                    >
                                      {ORDER_STATUSES.map(st => (
                                          <option
                                              key={st}
                                              value={st}
                                              disabled={isCancelled && st !== 'CANCELLED'}
                                          >
                                            {st}
                                          </option>
                                      ))}
                                    </select>

                                    <button
                                        type="button"
                                        className="admin-save-status-btn"
                                        onClick={() => handleUpdateStatus(order)}
                                        disabled={
                                            updatingOrderId !== null ||
                                            selectedStatuses[order.id] === order.status ||
                                            isCancelled
                                        }
                                    >
                                      {updatingOrderId === order.id ? 'Saving...' : 'Update'}
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <button
                                      type="button"
                                      className="admin-items-toggle-btn"
                                      onClick={() => toggleOrderDetails(order.id)}
                                  >
                                    {expandedOrderId === order.id ? <EyeOff size={15} /> : <Eye size={15} />}
                                    <span>{expandedOrderId === order.id ? 'Hide' : 'Items'}</span>
                                  </button>
                                </td>
                              </tr>
                          );
                        })}
                        {filteredOrders.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-4">No customer orders found.</td>
                            </tr>
                        )}
                        </tbody>
                      </table>
                    </div>
                )}

                {/* Expanded Order Items Sub-table */}
                {expandedOrderId !== null && (
                    <div className="admin-expanded-items-card">
                      <div className="expanded-header">
                        <Package size={18} color="#0A0A0A" />
                        <h4>Items in Order #{expandedOrderId}</h4>
                      </div>

                      {loadingOrderId === expandedOrderId && (
                          <p className="admin-table-status">Loading line items...</p>
                      )}

                      {orderItems[expandedOrderId] && (
                          <table className="admin-nested-table">
                            <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Quantity</th>
                              <th>Unit Price</th>
                              <th>Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orderItems[expandedOrderId].map((item) => (
                                <tr key={item.id}>
                                  <td><strong>{item.productName}</strong></td>
                                  <td>{item.quantity}</td>
                                  <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                                  <td><strong>₹{(Number(item.unitPrice) * Number(item.quantity)).toFixed(2)}</strong></td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                      )}
                    </div>
                )}
              </div>
            </div>
        )}
      </section>
  );
}

export default Admin;