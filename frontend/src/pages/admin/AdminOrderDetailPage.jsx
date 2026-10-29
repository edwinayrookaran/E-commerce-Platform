import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { apiFetch } from '../../api';

const ALL_STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'PACKED', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  async function loadOrder() {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/admin/orders/${id}`);
      if (!res.ok) {
        throw new Error(`Order #${id} not found (HTTP ${res.status})`);
      }
      const data = await res.json();
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setError(err.message || 'Could not load order details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function handleUpdateStatus(newStatus) {
    if (!newStatus || newStatus === order.status) return;

    if (newStatus === 'CANCELLED') {
      const confirmCancel = window.confirm(
        `Are you sure you want to CANCEL Order #${order.id}? This will restore the purchased stock back into product inventory.`
      );
      if (!confirmCancel) return;
    }

    setUpdating(true);
    setMessage('');
    setError('');

    try {
      const res = await apiFetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        let errText = `Failed to update status (${res.status})`;
        try {
          const json = await res.json();
          if (json?.message) errText = json.message;
        } catch {}
        throw new Error(errText);
      }

      setMessage(
        newStatus === 'CANCELLED'
          ? `Order #${order.id} cancelled. Stock quantities were successfully restored.`
          : `Order #${order.id} status updated to ${newStatus}.`
      );
      loadOrder();
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading-card">
          <div className="spinner-ring" />
          <p>Loading order #{id} details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-page-container">
        <div className="admin-error-box">
          <p>{error || 'Order could not be found.'}</p>
          <Link to="/admin/orders" className="checkout-primary-btn" style={{ marginTop: '12px' }}>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="admin-page-container">
      {/* Header bar */}
      <div className="admin-header-bar" style={{ marginBottom: '20px' }}>
        <Link to="/admin/orders" className="checkout-back-link">
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
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

      {/* Main Order Header Card */}
      <div className="admin-card order-detail-header-card">
        <div className="order-detail-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="admin-page-title font-serif" style={{ margin: 0 }}>
              Order #{order.id}
            </h1>
            <span className={`status-pill ${order.status?.toLowerCase() || 'placed'}`}>
              {order.status}
            </span>
            {order.stockRestored && (
              <span className="stock-restored-tag">
                <RotateCcw size={12} /> Stock Restored
              </span>
            )}
          </div>
          <div className="order-meta-dates">
            <span>
              <Calendar size={14} /> Placed on: {orderDate}
            </span>
            <span>•</span>
            <span>
              <CreditCard size={14} /> Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Status Control */}
        <div className="order-detail-header-right">
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Change Status:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="table-status-select"
              value={selectedStatus}
              disabled={updating || isCancelled || isDelivered}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              className="checkout-primary-btn sm"
              disabled={updating || selectedStatus === order.status || isCancelled || isDelivered}
              onClick={() => handleUpdateStatus(selectedStatus)}
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left: Items Table, Right: Customer & Delivery Info */}
      <div className="admin-dashboard-two-col">
        {/* Purchased Items Card */}
        <div className="admin-card">
          <h2 className="admin-card-title font-serif">Purchased Line Items</h2>

          {order.items && order.items.length > 0 ? (
            <div className="admin-table-wrap" style={{ marginTop: '16px' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.productName}</strong>
                        {item.productId && (
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            ID: #{item.productId}
                          </div>
                        )}
                      </td>
                      <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong className="table-price">
                          ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-empty-text">No items found for this order.</p>
          )}

          {/* Totals Summary */}
          <div className="order-totals-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{Number(order.totalAmount).toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping & Delivery</span>
              <span className="free-shipping-tag">FREE (Launch Offer)</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-total-row">
              <span>Grand Total</span>
              <strong className="summary-grand-total">₹{Number(order.totalAmount).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Address Card */}
        <div className="admin-card">
          <h2 className="admin-card-title font-serif">Customer & Fulfillment Details</h2>

          <div className="order-customer-box" style={{ marginTop: '16px' }}>
            <div className="info-block">
              <span className="info-label">Customer Name</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '16px' }}>{order.customerName || 'Guest'}</strong>
                {order.customerId && (
                  <Link
                    to={`/admin/customers/${order.customerId}`}
                    className="customer-registered-badge"
                    title="View Customer Profile"
                  >
                    View Account #{order.customerId}
                  </Link>
                )}
              </div>
            </div>

            <div className="info-block">
              <span className="info-label">Contact Phone</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#15803D" />
                <span>{order.phone}</span>
              </div>
            </div>

            {order.email && (
              <div className="info-block">
                <span className="info-label">Email Address</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="#6B7280" />
                  <span>{order.email}</span>
                </div>
              </div>
            )}

            <div className="info-block">
              <span className="info-label">Delivery Destination</span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <MapPin size={16} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span className="receipt-address">{order.deliveryAddress}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '28px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            {!isCancelled && !isDelivered && (
              <button
                type="button"
                className="admin-cancel-order-btn"
                onClick={() => handleUpdateStatus('CANCELLED')}
                disabled={updating}
              >
                <XCircle size={16} />
                <span>Cancel Order & Restore Stock</span>
              </button>
            )}

            {isCancelled && (
              <div className="cancelled-notice">
                <XCircle size={16} color="#DC2626" />
                <span>This order was cancelled. Stock has been restored and status cannot be modified.</span>
              </div>
            )}

            {isDelivered && (
              <div className="delivered-notice">
                <CheckCircle size={16} color="#15803D" />
                <span>This order has been completed and delivered to the recipient.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
