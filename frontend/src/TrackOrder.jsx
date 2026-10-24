
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

import { apiFetch, getStoredAuth } from './api';

const API_URL = '/api/orders';

const ORDER_STAGES = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    icon: ShoppingBag,
    desc: 'Order details received',
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    icon: CheckCircle,
    desc: 'Verified by kitchen',
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    icon: ChefHat,
    desc: 'Preparing your order',
  },
  {
    key: 'SHIPPED',
    label: 'Dispatched',
    icon: Truck,
    desc: 'Handed over to courier',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    icon: Package,
    desc: 'Arrived at your door',
  },
];

function TrackOrder({
                      onBack,
                      initialOrderId = '',
                      initialPhone = '',
                      currentUser,
                    }) {
  const [orderId, setOrderId] = useState(
      initialOrderId ? String(initialOrderId) : ''
  );
  const [phone, setPhone] = useState(initialPhone || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(currentUser);

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

          // Logged-in requests include the stored JWT automatically.
          const response = await apiFetch(url, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });

          if (response.status === 401) {
            throw new Error(
                'Your session is missing or expired. Please sign in again.'
            );
          }

          if (response.status === 403) {
            throw new Error(
                'You are not authorized to track this order.'
            );
          }

          if (response.status === 404) {
            throw new Error(
                'Order not found. Check your Order ID and try again.'
            );
          }

          if (!response.ok) {
            const text = await response.text();
            throw new Error(
                text || `Unable to track order (HTTP ${response.status}).`
            );
          }

          const data = await response.json();
          setOrder(data);
        } catch (err) {
          setError(err.message || 'Could not connect to the tracking server.');
        } finally {
          setLoading(false);
        }
      },
      [isLoggedIn]
  );

  useEffect(() => {
    setOrderId(initialOrderId ? String(initialOrderId) : '');
    setPhone(initialPhone || '');
  }, [initialOrderId, initialPhone]);

  useEffect(() => {
    // Automatically track the selected order for a signed-in customer.
    // Guests must enter their phone number before tracking.
    if (initialOrderId && (isLoggedIn || initialPhone)) {
      void handleTrack(initialOrderId, initialPhone);
    }
  }, [initialOrderId, initialPhone, isLoggedIn, handleTrack]);

  function submitTrack(event) {
    event.preventDefault();
    void handleTrack(orderId, phone);
  }

  const currentStageIndex = order
      ? ORDER_STAGES.findIndex(
          (stage) => stage.key === String(order.status || '').toUpperCase()
      )
      : -1;

  const isCancelled =
      String(order?.status || '').toUpperCase() === 'CANCELLED';

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
              <Package size={26} color="#0A0A0A" />
            </div>

            <div>
              <h1 className="orders-page-title font-serif">
                Track Your Ready Meals
              </h1>

              <p className="orders-page-sub">
                {isLoggedIn
                    ? 'Enter an Order ID, or open tracking from My Orders to view your order status.'
                    : 'Enter your Order ID and the 10-digit mobile number used when placing the order.'}
              </p>
            </div>
          </div>

          <form onSubmit={submitTrack} className="track-order-form">
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
                      onChange={(event) => setOrderId(event.target.value)}
                      required
                  />
                </div>
              </div>

              {!isLoggedIn && (
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
                          onChange={(event) => setPhone(event.target.value)}
                          required
                          inputMode="numeric"
                          autoComplete="tel"
                      />
                    </div>
                  </div>
              )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="track-submit-btn"
            >
              <Search size={16} />
              <span>{loading ? 'Locating Order...' : 'Track Order'}</span>
            </button>
          </form>

          {error && (
              <div className="orders-alert error" role="alert">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
          )}

          {order && (
              <div className="track-result-card">
                <div className="track-result-top">
                  <div>
                    <span className="track-res-badge">ORDER TRACKING</span>

                    <h2 className="track-res-id font-serif">
                      Order #{order.orderId}
                    </h2>

                    <span className="track-res-date">
                  Placed on{' '}
                      {order.createdAt
                          ? new Date(order.createdAt).toLocaleString('en-IN')
                          : 'Recent date'}
                </span>
                  </div>

                  <div className="track-res-status-wrap">
                    <span className="res-amount-label">Amount</span>

                    <strong className="res-amount-val">
                      ₹{Number(order.totalAmount ?? 0).toFixed(2)}
                    </strong>

                    <span className="res-status-pill">
                  {order.status}
                </span>
                  </div>
                </div>

                {isCancelled ? (
                    <div className="cancelled-stepper-alert">
                      <AlertTriangle size={24} color="#B91C1C" />

                      <div>
                        <h4>Order Was Cancelled</h4>
                        <p>
                          This order has been cancelled. Contact customer
                          support if you need further assistance.
                        </p>
                      </div>
                    </div>
                ) : (
                    <div className="stepper-horizontal">
                      {ORDER_STAGES.map((stage, index) => {
                        const isDone = currentStageIndex >= index;
                        const isCurrent = currentStageIndex === index;
                        const Icon = stage.icon;

                        return (
                            <div
                                key={stage.key}
                                className={`stepper-node ${
                                    isDone ? 'done' : ''
                                } ${isCurrent ? 'current' : ''}`}
                            >
                              <div className="stepper-icon-circle">
                                <Icon size={18} />
                              </div>

                              <strong className="stepper-label">
                                {stage.label}
                              </strong>

                              <span className="stepper-desc">
                        {stage.desc}
                      </span>

                              {index < ORDER_STAGES.length - 1 && (
                                  <div
                                      className={`stepper-line ${
                                          currentStageIndex > index ? 'done' : ''
                                      }`}
                                  />
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

export default TrackOrder;
