import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  CheckCircle,
  Truck,
  ChefHat,
  ShoppingBag,
  AlertTriangle,
  Search,
  Phone,
  RefreshCw,
} from 'lucide-react';

import { apiFetch } from './api';

const API_URL = '/api/orders';

const BASE_STAGES = [
  { key: 'PLACED', label: 'Order Placed', icon: ShoppingBag, desc: 'Order details received' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, desc: 'Verified by kitchen' },
  { key: 'PREPARING', label: 'Preparing', icon: ChefHat, desc: 'Preparing authentic meal' },
  { key: 'SHIPPED', label: 'Dispatched', icon: Truck, desc: 'Dispatched for delivery' },
  { key: 'DELIVERED', label: 'Delivered', icon: Package, desc: 'Arrived at your door' },
];

function getStageIndex(status) {
  const s = String(status || '').toUpperCase();
  switch (s) {
    case 'DELIVERED':
      return 4;
    case 'SHIPPED':
      return 3;
    case 'READY_FOR_DISPATCH':
    case 'PACKED':
    case 'PREPARING':
      return 2;
    case 'CONFIRMED':
      return 1;
    case 'PLACED':
      return 0;
    default:
      return 0;
  }
}

function getInternalOrderState(status) {
  const s = String(status || '').toUpperCase();
  switch (s) {
    case 'CANCELLED':
      return {
        label: 'Order Cancelled',
        desc: 'This order was cancelled and inventory has been restored.',
        badgeClass: 'cancelled',
      };
    case 'DELIVERED':
      return {
        label: 'Order Delivered',
        desc: 'Your order has been successfully delivered. Enjoy your meal!',
        badgeClass: 'delivered',
      };
    case 'SHIPPED':
      return {
        label: 'Order Dispatched',
        desc: 'Your order has been dispatched and is on the way to your delivery address.',
        badgeClass: 'shipped',
      };
    case 'READY_FOR_DISPATCH':
      return {
        label: 'Ready for Dispatch',
        desc: 'Your meal is prepared and packaged, ready for courier handover.',
        badgeClass: 'preparing',
      };
    case 'PACKED':
      return {
        label: 'Order Packed',
        desc: 'Your meal has been securely packed in retort containers.',
        badgeClass: 'preparing',
      };
    case 'PREPARING':
      return {
        label: 'Preparing in Kitchen',
        desc: 'Our chefs are preparing your authentic Kerala meal.',
        badgeClass: 'preparing',
      };
    case 'CONFIRMED':
      return {
        label: 'Order Confirmed',
        desc: 'Your order has been verified and scheduled for preparation.',
        badgeClass: 'confirmed',
      };
    case 'PLACED':
    default:
      return {
        label: 'Order Placed',
        desc: 'Your order has been received and is awaiting kitchen confirmation.',
        badgeClass: 'placed',
      };
  }
}

export default function TrackOrder({
  onBack,
  initialOrderId = '',
  initialPhone = '',
  currentUser,
  onSelectOrderDirect,
}) {
  const [orderId, setOrderId] = useState(initialOrderId ? String(initialOrderId) : '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Customer orders list (for logged-in automatic tracking)
  const [myOrders, setMyOrders] = useState([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);

  const isLoggedIn = Boolean(currentUser);

  // Track order by ID (+ optional phone for guests)
  const handleTrack = useCallback(
    async (id, phoneNumber = '') => {
      const cleanId = String(id || '').trim();
      const cleanPhone = String(phoneNumber || '').trim();

      if (!cleanId) {
        setError('Please enter your Order ID.');
        return;
      }

      if (!isLoggedIn && !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter the 10-digit phone number used for your order.');
        return;
      }

      setLoading(true);
      setError('');
      setOrder(null);

      try {
        let url = `${API_URL}/${encodeURIComponent(cleanId)}/track`;
        if (!isLoggedIn) {
          url += `?phone=${encodeURIComponent(cleanPhone)}`;
        }

        const response = await apiFetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        if (response.status === 403) {
          throw new Error('You are not authorized to track this order.');
        }
        if (response.status === 404) {
          throw new Error('Order not found. Please verify your Order ID and phone number.');
        }
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Unable to track order (HTTP ${response.status}).`);
        }

        const data = await response.json();
        setOrder(data);
        setOrderId(String(data.orderId || data.id));
      } catch (err) {
        setError(err.message || 'Could not connect to the tracking server.');
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn]
  );

  // For logged-in customers: load their orders automatically
  useEffect(() => {
    if (!isLoggedIn) return;

    setLoadingMyOrders(true);
    apiFetch(`${API_URL}/my-orders`)
      .then((res) => (res.ok ? res.json() : []))
      .then((ordersList) => {
        if (Array.isArray(ordersList)) {
          setMyOrders(ordersList);

          const target = initialOrderId
            ? ordersList.find((o) => String(o.orderId || o.id) === String(initialOrderId))
            : ordersList[0];

          if (target) {
            const targetId = target.orderId || target.id;
            setOrderId(String(targetId));
            void handleTrack(targetId);
          }
        }
      })
      .catch(() => {
        // Silently skip if orders list could not be loaded
      })
      .finally(() => {
        setLoadingMyOrders(false);
      });
  }, [isLoggedIn, initialOrderId, handleTrack]);

  // For guest customers: if both orderId and phone provided initially, trigger tracking
  useEffect(() => {
    if (!isLoggedIn && initialOrderId && initialPhone) {
      void handleTrack(initialOrderId, initialPhone);
    }
  }, [isLoggedIn, initialOrderId, initialPhone, handleTrack]);

  const submitGuestTrack = (e) => {
    e.preventDefault();
    void handleTrack(orderId, phone);
  };

  const handleSelectCustomerOrder = (selectedId) => {
    setOrderId(String(selectedId));
    if (onSelectOrderDirect) {
      onSelectOrderDirect(selectedId);
    } else {
      void handleTrack(selectedId);
    }
  };

  const currentStageIndex = order ? getStageIndex(order.status) : -1;
  const isCancelled = String(order?.status || '').toUpperCase() === 'CANCELLED';
  const orderState = order ? getInternalOrderState(order.status) : null;

  return (
    <section className="orders-page-container">
      <div className="orders-header-nav">
        <button type="button" onClick={onBack} className="orders-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </button>
      </div>

      <div className="orders-card">
        {/* Card Header */}
        <div className="orders-card-header">
          <div className="orders-icon-wrap">
            <Package size={26} color="#0A0A0A" />
          </div>
          <div>
            <h1 className="orders-title font-serif">Track Your Order</h1>
            <p className="orders-subtitle">
              {isLoggedIn
                ? 'Select an order to view its real-time preparation and delivery progress.'
                : 'Enter your Order ID and 10-digit mobile number to view live progress.'}
            </p>
          </div>
        </div>

        {/* LOGGED-IN CUSTOMER: Auto-loaded Orders Selection Panel */}
        {isLoggedIn ? (
          <div className="customer-tracking-panel">
            {loadingMyOrders ? (
              <div className="orders-alert info" style={{ marginBottom: '16px' }}>
                <RefreshCw size={15} className="spinning-icon" />
                <span>Loading your orders...</span>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="customer-no-orders-box">
                <ShoppingBag size={24} color="#6B7280" />
                <p>You have not placed any orders yet.</p>
                <Link to="/shop" className="checkout-primary-btn sm">
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="customer-order-chips-wrapper">
                <label className="customer-chips-label">Your Recent Orders:</label>
                <div className="customer-order-chips">
                  {myOrders.map((o) => {
                    const oid = o.orderId || o.id;
                    const isSelected = String(oid) === String(orderId);
                    const statusStr = String(o.status || 'placed').toLowerCase();

                    return (
                      <button
                        key={oid}
                        type="button"
                        className={`customer-order-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectCustomerOrder(oid)}
                      >
                        <div className="chip-left">
                          <span className="chip-id">#{oid}</span>
                          <span className={`status-pill ${statusStr}`}>{o.status}</span>
                        </div>
                        <div className="chip-meta">
                          <span>₹{Number(o.totalAmount ?? 0).toFixed(0)}</span>
                          <span className="chip-date">
                            {o.createdAt
                              ? new Date(o.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })
                              : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GUEST CUSTOMER: Clean lookup form with verified phone number */
          <form onSubmit={submitGuestTrack} className="track-order-form">
            <div className="track-inputs-row">
              <div className="track-field">
                <label htmlFor="track-order-id">Order ID</label>
                <div className="lookup-input-wrap">
                  <span className="field-prefix">#</span>
                  <input
                    id="track-order-id"
                    type="text"
                    placeholder="e.g. 1"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="track-field">
                <label htmlFor="track-phone">10-Digit Mobile Number</label>
                <div className="lookup-input-wrap">
                  <Phone size={17} className="lookup-icon" />
                  <input
                    id="track-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="track-submit-btn">
              <Search size={16} />
              <span>{loading ? 'Locating Order...' : 'Track Order'}</span>
            </button>
          </form>
        )}

        {/* Alerts / Error feedback */}
        {error && (
          <div className="orders-alert error" role="alert" style={{ marginTop: '16px' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="orders-alert info" role="status" style={{ marginTop: '16px' }}>
            <RefreshCw size={16} className="spinning-icon" />
            <span>Retrieving live tracking details...</span>
          </div>
        )}

        {/* Live Tracking Result Details */}
        {order && (
          <div className="track-result-card" style={{ marginTop: '24px' }}>
            {/* Top Order Information Bar */}
            <div className="track-result-top">
              <div>
                <span className="track-res-badge">ORDER PROGRESS</span>
                <h2 className="track-res-id font-serif">Order #{order.orderId || order.id}</h2>
                <span className="track-res-date">
                  Placed on{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Recent date'}
                </span>
              </div>

              <div className="track-res-status-wrap">
                <span className="res-amount-label">Amount</span>
                <strong className="res-amount-val">
                  ₹{Number(order.totalAmount ?? 0).toFixed(2)}
                </strong>
                <span className={`status-pill ${String(order.status || 'placed').toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Status Highlight Banner */}
            {orderState && (
              <div className={`carrier-status-banner ${orderState.badgeClass}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck size={20} />
                  <div>
                    <strong>{orderState.label}</strong>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{orderState.desc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Horizontal Stepper */}
            {isCancelled ? (
              <div className="cancelled-stepper-alert">
                <AlertTriangle size={24} color="#B91C1C" />
                <div>
                  <h4>Order Was Cancelled</h4>
                  <p>This order has been cancelled and stock returned. Contact customer care if you need assistance.</p>
                </div>
              </div>
            ) : (
              <div className="stepper-horizontal">
                {BASE_STAGES.map((stage, index) => {
                  const isDone = currentStageIndex >= index;
                  const isCurrent = currentStageIndex === index;
                  const Icon = stage.icon;

                  return (
                    <div
                      key={stage.key}
                      className={`stepper-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="stepper-icon-circle">
                        <Icon size={18} />
                      </div>
                      <div className="stepper-content">
                        <strong className="stepper-label">{stage.label}</strong>
                        <span className="stepper-desc">{stage.desc}</span>
                      </div>
                      {index < BASE_STAGES.length - 1 && (
                        <div className={`stepper-line ${currentStageIndex > index ? 'done' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
