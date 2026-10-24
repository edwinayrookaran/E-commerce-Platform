import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiFetch } from '../../api';

const ORDER_STATUSES = [
  'ALL',
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  async function loadOrders(status = activeStatus, query = search) {
    setLoading(true);
    setError('');
    try {
      let url = '/api/admin/orders';
      const params = new URLSearchParams();
      if (status && status !== 'ALL') {
        params.append('status', status);
      }
      if (query && query.trim()) {
        params.append('search', query.trim());
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await apiFetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load orders (HTTP ${res.status})`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Could not load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(activeStatus, search);
  }, [activeStatus]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadOrders(activeStatus, search);
  }

  async function handleQuickStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    setMessage('');
    setError('');
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        let errText = `Status update failed (${res.status})`;
        try {
          const json = await res.json();
          if (json?.message) errText = json.message;
        } catch {
          // ignore error
        }
        throw new Error(errText);
      }

      setMessage(`Order #${orderId} status changed to ${newStatus}`);
      loadOrders(activeStatus, search);
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-title font-serif">Customer Order Management</h1>
          <p className="admin-page-subtitle">
            Track customer orders, manage fulfilment statuses, and inspect shipping destinations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadOrders(activeStatus, search)}
          className="admin-refresh-pill"
          title="Refresh orders"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
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

      {/* Filter and Search Toolbar */}
      <div className="admin-card toolbar-card">
        {/* Status Filter Tabs */}
        <div className="admin-status-tabs" role="tablist">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`status-tab ${activeStatus === status ? 'active' : ''}`}
              onClick={() => setActiveStatus(status)}
              role="tab"
              aria-selected={activeStatus === status}
            >
              {status}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="admin-order-search-form">
          <div className="catalog-search-box" style={{ maxWidth: '440px', flex: 1 }}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by Order ID, customer, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="checkout-primary-btn sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="admin-table-action-btn"
              onClick={() => {
                setSearch('');
                loadOrders(activeStatus, '');
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading-card">
            <div className="spinner-ring" />
            <p>Loading customer orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingBag size={48} color="#9CA3AF" />
            <h3 className="font-serif">No orders found</h3>
            <p>There are no customer orders matching the selected status or search criteria.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Order Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong className="table-order-id">#{order.id}</strong>
                      </td>
                      <td>
                        <strong className="table-cust-name">{order.customerName || 'Guest'}</strong>
                        {order.customerId && (
                          <span className="customer-registered-badge">Registered #{order.customerId}</span>
                        )}
                      </td>
                      <td>
                        <div className="table-contact-cell">
                          <span>{order.phone}</span>
                          {order.email && <small>{order.email}</small>}
                        </div>
                      </td>
                      <td className="table-date">{orderDate}</td>
                      <td>
                        <strong className="table-price">₹{Number(order.totalAmount).toFixed(2)}</strong>
                        <small className="table-pay-mode">COD</small>
                      </td>
                      <td>
                        <span className={`status-pill ${order.status?.toLowerCase() || 'placed'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="table-status-select"
                          value={order.status}
                          disabled={updatingId === order.id || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                          onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                          aria-label={`Update status for order #${order.id}`}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="admin-table-action-btn edit"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                          <span>View</span>
                        </Link>
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
