import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  Package,
  ShieldCheck,
  Truck,
  Copy,
  Check
} from 'lucide-react';
import './Checkout.css';

function Checkout({ cart, onBack, onOrderPlaced, onTrackOrder, currentUser }) {
  const [form, setForm] = useState({
    customerName: currentUser?.name || '',
    phone: '',
    email: currentUser?.email || '',
    deliveryAddress: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setForm(prev => ({
        ...prev,
        customerName: prev.customerName || currentUser.name || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCopyOrderId(id) {
    navigator.clipboard.writeText(String(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError('Enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:8080/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...form,
            customerName: form.customerName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            deliveryAddress: form.deliveryAddress.trim(),
            items: cart.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Order placement failed with status: ${response.status}`
        );
      }

      const savedOrder = await response.json();
      setOrder(savedOrder);

      if (onOrderPlaced) {
        onOrderPlaced();
      }
    } catch (err) {
      setError(
        err.message || 'Could not place your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <section className="checkout-page-container">
        <div className="checkout-success-card">
          <div className="success-icon-badge">
            <CheckCircle size={56} color="#15803D" />
          </div>

          <span className="success-tag">ORDER CONFIRMED</span>
          <h1 className="success-title font-serif">Order Placed Successfully!</h1>

          <p className="success-subtitle">
            Thank you, <strong>{order.customerName || form.customerName}</strong>, for ordering with Fudcy Foods. Your ready-to-eat Kerala meals are being prepared for dispatch.
          </p>

          <div className="order-receipt-box">
            <div className="receipt-row top">
              <div>
                <span className="receipt-label">YOUR ORDER NUMBER</span>
                <h2 className="receipt-order-id font-serif">#{order.id}</h2>
              </div>
              <button
                type="button"
                className="copy-id-btn"
                onClick={() => handleCopyOrderId(order.id)}
                title="Copy Order ID"
              >
                {copied ? <Check size={16} color="#15803D" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="receipt-details">
              <div className="receipt-item">
                <span>Total Amount:</span>
                <strong>₹{Number(order.totalAmount).toFixed(2)}</strong>
              </div>
              <div className="receipt-item">
                <span>Payment Mode:</span>
                <strong>Cash on Delivery (COD)</strong>
              </div>
              <div className="receipt-item">
                <span>Delivery Address:</span>
                <span className="receipt-address">{order.deliveryAddress || form.deliveryAddress}</span>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button
              className="checkout-primary-btn"
              type="button"
              onClick={() => {
                if (onTrackOrder) {
                  onTrackOrder({
                    orderId: order.id,
                    phone: form.phone,
                  });
                }
              }}
            >
              <Package size={18} />
              <span>Track This Order</span>
            </button>

            <button
              className="checkout-secondary-btn"
              type="button"
              onClick={onBack}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page-container">
      <div className="checkout-header-bar">
        <button
          className="checkout-back-link"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Return to Store</span>
        </button>
      </div>

      <div className="checkout-main-grid">
        {/* Left: Customer & Delivery Address Form */}
        <div className="checkout-form-col">
          <div className="checkout-card">
            <div className="checkout-section-header">
              <span className="checkout-step-badge">STEP 1</span>
              <h2 className="font-serif">Delivery & Contact Information</h2>
              <p>Enter your recipient details where your meals should be delivered.</p>
            </div>

            <form className="checkout-form-body" onSubmit={handleSubmit}>
              <div className="checkout-field-group">
                <label htmlFor="customerName">Full Recipient Name *</label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  placeholder="e.g. Anandhu Krishnan"
                  value={form.customerName}
                  onChange={handleChange}
                  autoComplete="name"
                  maxLength={120}
                  required
                />
              </div>

              <div className="checkout-field-row">
                <div className="checkout-field-group">
                  <label htmlFor="phone">10-Digit Mobile Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    autoComplete="tel-national"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    required
                  />
                  <small className="field-hint">Used for order tracking and delivery updates.</small>
                </div>

                <div className="checkout-field-group">
                  <label htmlFor="email">Email Address (Optional)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  <small className="field-hint">Order confirmation details sent here.</small>
                </div>
              </div>

              <div className="checkout-field-group">
                <label htmlFor="deliveryAddress">Complete Delivery Address *</label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Flat / House number, Building / Street, Landmark, Town / City, State, PIN code"
                  rows={4}
                  maxLength={1000}
                  autoComplete="street-address"
                  required
                />
              </div>

              {/* Payment Section */}
              <div className="checkout-payment-box">
                <div className="payment-radio-header">
                  <input
                    type="radio"
                    id="cod-option"
                    name="paymentMethod"
                    checked
                    readOnly
                  />
                  <label htmlFor="cod-option">
                    <strong>Cash on Delivery (COD)</strong>
                  </label>
                </div>
                <p className="payment-explanation">
                  Pay cash or UPI directly to the courier executive upon parcel delivery. No upfront payment required.
                </p>
              </div>

              {error && (
                <div className="checkout-alert error" role="alert">
                  {error}
                </div>
              )}

              <button
                className="checkout-submit-btn"
                type="submit"
                disabled={submitting || cart.length === 0}
              >
                <ShoppingBag size={18} />
                <span>{submitting ? 'Placing Order...' : `Confirm & Place Order • ₹${total.toFixed(2)}`}</span>
              </button>

              <div className="checkout-security-note">
                <ShieldCheck size={16} color="#15803D" />
                <span>Backend validated pricing. Stock restored automatically if order is cancelled.</span>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <aside className="checkout-summary-col">
          <div className="checkout-summary-card">
            <h3 className="summary-title font-serif">Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>

            <div className="summary-items-list">
              {cart.map((item) => (
                <div className="summary-item-row" key={item.id}>
                  <div className="summary-item-info">
                    <strong>{item.name}</strong>
                    <span>Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</span>
                  </div>
                  <strong className="summary-item-price">
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="summary-calculation">
              <div className="summary-calc-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="summary-calc-row">
                <span>Delivery</span>
                <span className="free-shipping">Calculated at dispatch</span>
              </div>
              <div className="summary-calc-row total">
                <span>Estimated Total</span>
                <span className="total-highlight">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-trust-badge">
              <Truck size={18} color="#0A0A0A" />
              <div>
                <strong>Safe Pan-India Packaging</strong>
                <p>Retort food pouches safely packed for long transit without spoilage.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
