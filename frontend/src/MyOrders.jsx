import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  RefreshCw,
  Package,
  XCircle,
  ArrowLeft,
  Calendar,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShoppingBag,
  LogIn,
} from 'lucide-react';

import { apiFetch, getStoredAuth } from './api.js';

const API_URL = '/api/orders';

function readErrorMessage(response, fallback) {
  return response.text().then((text) => {
    if (!text) return fallback;
    try {
      const data = JSON.parse(text);
      return data.message || data.error || fallback;
    } catch {
      return text;
    }
  });
}

function getStatusClass(status) {
  switch (String(status || '').toUpperCase()) {
    case 'DELIVERED':
      return 'delivered';
    case 'CANCELLED':
      return 'cancelled';
    case 'SHIPPED':
      return 'shipped';
    case 'PREPARING':
      return 'preparing';
    case 'CONFIRMED':
      return 'confirmed';
    default:
      return 'placed';
  }
}

export default function MyOrders({ onBack, onTrackOrder, currentUser }) {
  const [guestOrderId, setGuestOrderId] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const isLoggedIn = Boolean(currentUser);

  const toggleOrderDetails = (oid) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(oid)) next.delete(oid);
      else next.add(oid);
      return next;
    });
  };

  const loadOrders = useCallback(async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError('');
    setMessage('');
    setIsSessionExpired(false);

    try {
      const auth = getStoredAuth();
      if (!auth?.token) {
        // If no stored token is present, do not show order history
        setLoading(false);
        return;
      }

      const response = await apiFetch(`${API_URL}/my-orders`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 401) {
        setIsSessionExpired(true);
        throw new Error('Your session has expired. Please sign in again.');
      }

      if (response.status === 403) {
        throw new Error('You are not authorized to view these orders.');
      }

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, `Could not load orders (HTTP ${response.status}).`)
        );
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('The server returned an unexpected orders response.');
      }

      setOrders(data);
      setSearched(true);
      setIsSessionExpired(false);
    } catch (err) {
      setError(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Handle guest lookup using verified Order ID + Phone
  const handleGuestLookup = async (e) => {
    if (e) e.preventDefault();

    const cleanOid = guestOrderId.trim();
    const cleanPhone = guestPhone.trim();

    if (!cleanOid) {
      setError('Please enter your Order ID.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiFetch(`${API_URL}/guest-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: Number(cleanOid), phone: cleanPhone }),
      });

      if (response.status === 404) {
        throw new Error('No matching order found for this Order ID and mobile number.');
      }
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, `Could not find order (HTTP ${response.status}).`)
        );
      }

      const data = await response.json();
      setOrders([data]);
      setSearched(true);
      // Auto-expand the single found order
      setExpandedOrders(new Set([data.orderId || data.id]));
    } catch (err) {
      setError(err.message || 'Could not locate order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      void loadOrders();
    } else {
      setOrders([]);
      setSearched(false);
      setError('');
      setMessage('');
      setIsSessionExpired(false);
    }
  }, [isLoggedIn, loadOrders]);

  async function cancelOrder(order) {
    if (!isLoggedIn) {
      setError('Please log in to cancel an order.');
      return;
    }

    const oid = order.orderId || order.id;
    const confirmed = window.confirm(`Are you sure you want to cancel Order #${oid}?`);
    if (!confirmed) return;

    setCancellingId(oid);
    setError('');
    setMessage('');

    try {
      const auth = getStoredAuth();
      if (!auth?.token) {
        setIsSessionExpired(true);
        throw new Error('Your session is missing or expired. Please log in again.');
      }

      const response = await apiFetch(`${API_URL}/${oid}/cancel`, {
        method: 'PUT',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 401) {
        setIsSessionExpired(true);
        throw new Error('Please log in again before cancelling your order.');
      }
      if (response.status === 403) {
        throw new Error('You are not authorized to cancel this order.');
      }
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'Could not cancel this order. Only eligible orders can be cancelled.')
        );
      }

      setOrders((current) =>
        current.map((item) =>
          (item.orderId || item.id) === oid ? { ...item, status: 'CANCELLED' } : item
        )
      );

      setMessage(`Order #${oid} was cancelled successfully. Inventory was restored.`);
    } catch (err) {
      setError(err.message || 'Could not cancel this order.');
    } finally {
      setCancellingId(null);
    }
  }

  function trackOrder(order) {
    if (!onTrackOrder) {
      setError('Order tracking is currently unavailable.');
      return;
    }

    const oid = order.orderId || order.id;
    onTrackOrder({
      orderId: oid,
      ...(!isLoggedIn ? { phone: guestPhone.trim() } : {}),
    });
  }

  return (
    <section className="orders-page-container">
      <div className="orders-header-nav">
        <button type="button" onClick={onBack} className="orders-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </button>
      </div>

      <div className="orders-card">
        <div className="orders-card-header">
          <div className="orders-icon-wrap">
            <ClipboardList size={26} color="#0A0A0A" />
          </div>
          <div>
            <h1 className="orders-page-title font-serif">My Order History</h1>
            <p className="orders-page-sub">
              {isLoggedIn
                ? `Logged in as ${currentUser.name} (${currentUser.email}). Your past orders load automatically.`
                : 'Sign in to access your complete purchase history, or look up a specific guest order below.'}
            </p>
          </div>
        </div>

        {/* Guest Order Lookup Form */}
        {!isLoggedIn && (
          <div className="guest-lookup-card">
            <div className="guest-prompt-banner">
              <LogIn size={20} color="#15803D" />
              <div>
                <strong>Have an account?</strong>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6B7280' }}>
                  <Link to="/login?redirect=/my-orders" style={{ color: '#15803D', fontWeight: 600 }}>
                    Sign in
                  </Link>{' '}
                  to view all your past orders automatically without entering phone numbers.
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '16px 0 10px', color: '#374151' }}>
              Or Look Up a Guest Order:
            </h3>

            <form onSubmit={handleGuestLookup} className="orders-lookup-form">
              <div className="lookup-input-wrap" style={{ flex: '0 0 130px' }}>
                <span style={{ padding: '0 8px', color: '#6B7280', fontWeight: 600 }}>#</span>
                <input
                  type="text"
                  value={guestOrderId}
                  onChange={(e) => setGuestOrderId(e.target.value)}
                  placeholder="Order ID"
                  required
                />
              </div>

              <div className="lookup-input-wrap">
                <Phone size={18} className="lookup-icon" />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </div>

              <button type="submit" disabled={loading} className="orders-lookup-btn">
                <RefreshCw size={16} className={loading ? 'spinning-icon' : ''} />
                <span>{loading ? 'Searching...' : 'Find Order'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="orders-alert info" role="status" style={{ marginTop: '16px' }}>
            <RefreshCw size={16} className="spinning-icon" />
            <span>Loading orders...</span>
          </div>
        )}

        {/* Session Expired Alert State */}
        {isSessionExpired && (
          <div className="orders-alert error" role="alert" style={{ marginTop: '16px' }}>
            <AlertCircle size={18} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Your session has expired. Please sign in again to access your order history.</span>
              <Link to="/login?redirect=/my-orders" className="checkout-primary-btn sm" style={{ marginLeft: '12px' }}>
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {error && !isSessionExpired && (
          <div className="orders-alert error" role="alert" style={{ marginTop: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="orders-alert info" role="status" style={{ marginTop: '16px' }}>
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Empty State for Logged-In Customer with Zero Orders */}
        {isLoggedIn && searched && orders.length === 0 && !loading && (
          <div className="orders-empty-state-card" style={{ marginTop: '24px' }}>
            <ShoppingBag size={48} color="#9CA3AF" />
            <h2 className="font-serif">No Orders Found</h2>
            <p>You haven't placed any orders yet. Browse our curated ready-to-eat authentic Kerala meals and curries!</p>
            <Link to="/shop" className="checkout-primary-btn" style={{ marginTop: '16px', display: 'inline-flex' }}>
              <span>Browse Catalogue</span>
            </Link>
          </div>
        )}

        {/* Orders List */}
        {searched && orders.length > 0 && (
          <div className="orders-results-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="orders-count-heading font-serif" style={{ margin: 0 }}>
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Found
              </h2>
              {isLoggedIn && (
                <button
                  type="button"
                  className="admin-refresh-pill"
                  onClick={loadOrders}
                  disabled={loading}
                  title="Reload orders"
                >
                  <RefreshCw size={13} className={loading ? 'spinning-icon' : ''} />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            <div className="orders-list">
              {orders.map((order) => {
                const oid = order.orderId || order.id;
                const status = String(order.status || '').toUpperCase();
                const canCancel = ['PLACED', 'CONFIRMED'].includes(status);
                const statusClass = getStatusClass(status);
                const isExpanded = expandedOrders.has(oid);
                const items = Array.isArray(order.items) ? order.items : [];

                return (
                  <article key={oid} className="customer-order-card">
                    {/* Top Row: Order ID & Status */}
                    <div className="order-card-top">
                      <div>
                        <span className="order-id-label">ORDER ID</span>
                        <h3 className="order-id-title font-serif">#{oid}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`order-status-badge ${statusClass}`}>
                          {status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="order-card-details">
                      <div className="order-detail-item">
                        <Calendar size={15} color="#7B7B7B" />
                        <span>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : 'Recent Order'}
                        </span>
                      </div>

                      <div className="order-detail-item">
                        <IndianRupee size={15} color="#7B7B7B" />
                        <strong>₹{Number(order.totalAmount ?? 0).toFixed(2)}</strong>
                        <span className="payment-tag">
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod || 'COD'}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Products Preview */}
                    {items.length > 0 && (
                      <div className="order-products-summary-line">
                        <span className="summary-label">Products:</span>
                        <div className="summary-items-pills">
                          {items.map((it, idx) => (
                            <span key={idx} className="order-item-chip">
                              {it.productName} <strong>×{it.quantity}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded Details Section */}
                    {isExpanded && (
                      <div className="order-card-expanded-panel">
                        <div className="expanded-divider" />
                        <h4 className="expanded-heading font-serif">Purchased Line Items</h4>
                        <div className="expanded-items-table">
                          {items.map((it, idx) => (
                            <div key={idx} className="expanded-item-row">
                              <span className="expanded-item-name">
                                {it.productName} <small style={{ color: '#6B7280' }}>× {it.quantity}</small>
                              </span>
                              <strong className="expanded-item-subtotal">
                                ₹{(Number(it.unitPrice || 0) * it.quantity).toFixed(2)}
                              </strong>
                            </div>
                          ))}
                        </div>

                        {order.deliveryAddress && (
                          <div className="expanded-delivery-address">
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                              <MapPin size={15} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                                  Delivering to:
                                </span>
                                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#1F2937' }}>
                                  {order.deliveryAddress}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="order-card-actions">
                      <button
                        type="button"
                        className="order-view-details-btn"
                        onClick={() => toggleOrderDetails(oid)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={15} />
                            <span>Hide Details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={15} />
                            <span>View Details ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="order-track-btn"
                        onClick={() => trackOrder(order)}
                      >
                        <Package size={16} />
                        <span>Track Order</span>
                      </button>

                      {isLoggedIn && canCancel && (
                        <button
                          type="button"
                          className="order-cancel-btn"
                          onClick={() => cancelOrder(order)}
                          disabled={cancellingId !== null}
                        >
                          <XCircle size={16} />
                          <span>
                            {cancellingId === oid ? 'Cancelling...' : 'Cancel Order'}
                          </span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
