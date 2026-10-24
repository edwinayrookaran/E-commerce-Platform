
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

import { apiFetch, getStoredAuth } from './api.js';

const API_URL = '/api/orders';
const PHONE_KEY = 'fudcy_customer_phone';

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

function MyOrders({ onBack, onTrackOrder, currentUser }) {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isLoggedIn = Boolean(currentUser);

  const loadOrders = useCallback(
      async (event) => {
        if (event) {
          event.preventDefault();
        }

        const cleanPhone = phone.trim();

        if (!isLoggedIn && !/^[6-9]\d{9}$/.test(cleanPhone)) {
          setError('Please enter a valid 10-digit Indian mobile number.');
          return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
          // Use the application's shared authentication storage.
          const auth = getStoredAuth();

          if (isLoggedIn && !auth?.token) {
            throw new Error(
                'Your session is missing or expired. Please log in again.'
            );
          }

          let ordersUrl = `${API_URL}/my-orders`;

          if (!isLoggedIn) {
            localStorage.setItem(PHONE_KEY, cleanPhone);
            ordersUrl += `?phone=${encodeURIComponent(cleanPhone)}`;
          }

          // apiFetch automatically adds the JWT Authorization header.
          const response = await apiFetch(ordersUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });

          if (response.status === 401) {
            throw new Error(
                'Your session is missing or expired. Please log in again.'
            );
          }

          if (response.status === 403) {
            throw new Error(
                'You are not authorized to view these orders.'
            );
          }

          if (!response.ok) {
            throw new Error(
                await readErrorMessage(
                    response,
                    `Could not load orders (HTTP ${response.status}).`
                )
            );
          }

          const data = await response.json();

          if (!Array.isArray(data)) {
            throw new Error(
                'The server returned an unexpected orders response.'
            );
          }

          setOrders(data);
          setSearched(true);

          if (data.length === 0) {
            setMessage('No orders were found.');
          }
        } catch (err) {
          setError(err.message || 'Could not connect to the server.');
        } finally {
          setLoading(false);
        }
      },
      [phone, isLoggedIn]
  );

  useEffect(() => {
    if (isLoggedIn) {
      // Logged-in customers see their own orders automatically.
      void loadOrders();
    } else {
      // Guest lookup starts fresh when opening the page.
      setPhone('');
      setOrders([]);
      setSearched(false);
      setError('');
      setMessage('');

      localStorage.removeItem(PHONE_KEY);
    }
  }, [isLoggedIn, loadOrders]);

  async function cancelOrder(order) {
    if (!isLoggedIn) {
      setError('Please log in to cancel an order.');
      return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to cancel Order #${order.orderId}?`
    );

    if (!confirmed) return;

    setCancellingId(order.orderId);
    setError('');
    setMessage('');

    try {
      const auth = getStoredAuth();

      if (!auth?.token) {
        throw new Error(
            'Your session is missing or expired. Please log in again.'
        );
      }

      const response = await apiFetch(
          `${API_URL}/${order.orderId}/cancel`,
          {
            method: 'PUT',
            headers: {
              Accept: 'application/json',
            },
          }
      );

      if (response.status === 401) {
        throw new Error(
            'Please log in again before cancelling your order.'
        );
      }

      if (response.status === 403) {
        throw new Error(
            'You are not authorized to cancel this order.'
        );
      }

      if (!response.ok) {
        throw new Error(
            await readErrorMessage(
                response,
                'Could not cancel this order. Only eligible orders can be cancelled.'
            )
        );
      }

      // Update the displayed order after backend confirms cancellation.
      setOrders((current) =>
          current.map((item) =>
              item.orderId === order.orderId
                  ? { ...item, status: 'CANCELLED' }
                  : item
          )
      );

      setMessage(
          `Order #${order.orderId} was cancelled successfully.`
      );
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

    onTrackOrder({
      orderId: order.orderId,
      ...(!isLoggedIn ? { phone: phone.trim() } : {}),
    });
  }

  return (
      <section className="orders-page-container">
        <div className="orders-header-nav">
          <button
              type="button"
              onClick={onBack}
              className="orders-back-btn"
          >
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
              <h1 className="orders-page-title font-serif">
                My Order History
              </h1>

              <p className="orders-page-sub">
                {isLoggedIn
                    ? 'Your order history is shown automatically.'
                    : 'Enter the phone number used at checkout to look up a guest order.'}
              </p>
            </div>
          </div>

          {!isLoggedIn && (
              <form
                  onSubmit={loadOrders}
                  className="orders-lookup-form"
              >
                <div className="lookup-input-wrap">
                  <Phone size={18} className="lookup-icon" />

                  <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      required
                      inputMode="numeric"
                      autoComplete="tel"
                  />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="orders-lookup-btn"
                >
                  <RefreshCw
                      size={16}
                      className={loading ? 'spinning-icon' : ''}
                  />

                  <span>
                {loading ? 'Searching...' : 'Find My Orders'}
              </span>
                </button>
              </form>
          )}

          {isLoggedIn && loading && (
              <div className="orders-alert info" role="status">
                <RefreshCw size={16} className="spinning-icon" />
                <span>Loading your orders...</span>
              </div>
          )}

          {error && (
              <div className="orders-alert error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
          )}

          {message && (
              <div className="orders-alert info" role="status">
                <CheckCircle size={16} />
                <span>{message}</span>
              </div>
          )}

          {searched && orders.length > 0 && (
              <div className="orders-results-section">
                <h2 className="orders-count-heading font-serif">
                  Found {orders.length}{' '}
                  {orders.length === 1 ? 'Order' : 'Orders'}
                </h2>

                <div className="orders-list">
                  {orders.map((order) => {
                    const status = String(
                        order.status || ''
                    ).toUpperCase();

                    const canCancel = ['PLACED', 'CONFIRMED'].includes(
                        status
                    );

                    const statusClass = getStatusClass(status);

                    return (
                        <article
                            key={order.orderId}
                            className="customer-order-card"
                        >
                          <div className="order-card-top">
                            <div>
                        <span className="order-id-label">
                          ORDER ID
                        </span>

                              <h3 className="order-id-title font-serif">
                                #{order.orderId}
                              </h3>
                            </div>

                            <span
                                className={`order-status-badge ${statusClass}`}
                            >
                        {status || 'UNKNOWN'}
                      </span>
                          </div>

                          <div className="order-card-details">
                            <div className="order-detail-item">
                              <Calendar size={15} color="#7B7B7B" />

                              <span>
                          {order.createdAt
                              ? new Date(
                                  order.createdAt
                              ).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                              : 'Recent Order'}
                        </span>
                            </div>

                            <div className="order-detail-item">
                              <IndianRupee
                                  size={15}
                                  color="#7B7B7B"
                              />

                              <strong>
                                ₹
                                {Number(
                                    order.totalAmount ?? 0
                                ).toFixed(2)}
                              </strong>

                              <span className="payment-tag">COD</span>
                            </div>
                          </div>

                          <div className="order-card-actions">
                            <button
                                type="button"
                                className="order-track-btn"
                                onClick={() => trackOrder(order)}
                            >
                              <Package size={16} />
                              <span>Track Live Status</span>
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
                            {cancellingId === order.orderId
                                ? 'Cancelling...'
                                : 'Cancel Order'}
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

export default MyOrders;
