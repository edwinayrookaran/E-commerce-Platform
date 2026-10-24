import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../api';
import { useShop } from '../context/ShopContext';
import '../Checkout.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, currentUser, cartTotal } = useShop();

  // Scroll to top immediately on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Form state initialized cleanly without hardcoding admin details
  const [form, setForm] = useState(() => ({
    customerName: (currentUser && currentUser.role !== 'ADMIN') ? (currentUser.name || '') : '',
    phone: (currentUser && currentUser.role !== 'ADMIN') ? (currentUser.phone || '') : '',
    email: (currentUser && currentUser.role !== 'ADMIN') ? (currentUser.email || '') : '',
    streetAddress: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
  }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update initial form values if standard customer logs in later, but never force admin details
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    const trimmedName = form.customerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter a valid recipient full name (at least 2 characters).');
      return;
    }

    const trimmedPhone = form.phone.trim();
    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    const trimmedEmail = form.email.trim();
    if (trimmedEmail && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com) or leave it empty.');
      return;
    }

    const trimmedStreet = form.streetAddress.trim();
    if (!trimmedStreet || trimmedStreet.length < 5) {
      setError('Please enter a complete street address (house/flat no., building, street/area).');
      return;
    }

    const trimmedCity = form.city.trim();
    if (!trimmedCity) {
      setError('Please enter town or city name.');
      return;
    }

    const trimmedState = form.state.trim();
    if (!trimmedState) {
      setError('Please enter state name.');
      return;
    }

    const trimmedPostalCode = form.postalCode.trim();
    if (!/^\d{6}$/.test(trimmedPostalCode)) {
      setError('Please enter a valid 6-digit Indian PIN code (e.g. 682001).');
      return;
    }

    const formattedDeliveryAddress = `${trimmedStreet}, ${trimmedCity}, ${trimmedState} - ${trimmedPostalCode}`;

    setSubmitting(true);

    try {
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail || null,
          streetAddress: trimmedStreet,
          city: trimmedCity,
          state: trimmedState,
          postalCode: trimmedPostalCode,
          deliveryAddress: formattedDeliveryAddress,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        let errorMsg = `Order placement failed with status: ${response.status}`;
        try {
          const json = await response.json();
          if (json?.message) errorMsg = json.message;
        } catch {
          const txt = await response.text();
          if (txt) errorMsg = txt;
        }
        throw new Error(errorMsg);
      }

      const savedOrder = await response.json();

      // Only clear cart after backend confirms order creation
      clearCart();

      // Navigate to order-success page, passing phone query parameter for guest order protection
      const phoneParam = !currentUser ? `?phone=${encodeURIComponent(trimmedPhone)}` : '';
      navigate(`/order-success/${savedOrder.id}${phoneParam}`);
    } catch (err) {
      setError(err.message || 'Could not place your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <section className="checkout-page-container">
        <div className="cart-empty-card" style={{ maxWidth: '540px', margin: '40px auto', textAlign: 'center' }}>
          <ShoppingBag size={48} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
          <h2 className="font-serif">Your Cart is Empty</h2>
          <p>Please add some authentic Kerala meals to your cart before proceeding to checkout.</p>
          <Link to="/shop" className="checkout-primary-btn" style={{ marginTop: '16px' }}>
            Browse Menu Catalogue
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page-container">
      <div className="checkout-header-bar">
        <Link to="/cart" className="checkout-back-link">
          <ArrowLeft size={16} />
          <span>Back to Shopping Cart</span>
        </Link>
      </div>

      <div className="checkout-main-grid">
        {/* Left: Customer & Delivery Address Form */}
        <div className="checkout-form-col">
          <div className="checkout-card">
            <div className="checkout-section-header">
              <span className="checkout-step-badge">STEP 1</span>
              <h2 className="font-serif">Delivery & Contact Information</h2>
              <p>Enter the recipient details where your meals should be delivered.</p>
            </div>

            <form className="checkout-form-body" onSubmit={handleSubmit}>
              {/* Recipient Full Name */}
              <div className="checkout-field-group">
                <label htmlFor="customerName">Recipient Full Name *</label>
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

              {/* Mobile Phone & Optional Email */}
              <div className="checkout-field-row">
                <div className="checkout-field-group">
                  <label htmlFor="phone">10-Digit Mobile Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel-national"
                    maxLength={10}
                    required
                  />
                  <small className="field-hint">Used for delivery dispatch & SMS tracking</small>
                </div>

                <div className="checkout-field-group">
                  <label htmlFor="email">Email Address (Optional)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. anandhu@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  <small className="field-hint">Order receipt & status updates will be sent here</small>
                </div>
              </div>

              {/* Street Address */}
              <div className="checkout-field-group">
                <label htmlFor="streetAddress">Street Address / House & Building *</label>
                <input
                  id="streetAddress"
                  name="streetAddress"
                  type="text"
                  placeholder="Flat / House No., Apartment / Building Name, Street, Landmark"
                  value={form.streetAddress}
                  onChange={handleChange}
                  autoComplete="street-address"
                  maxLength={250}
                  required
                />
              </div>

              {/* City, State, PIN Code */}
              <div className="checkout-field-row three-col">
                <div className="checkout-field-group">
                  <label htmlFor="city">City / Town *</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g. Kochi"
                    value={form.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    maxLength={60}
                    required
                  />
                </div>

                <div className="checkout-field-group">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="e.g. Kerala"
                    value={form.state}
                    onChange={handleChange}
                    autoComplete="address-level1"
                    maxLength={60}
                    required
                  />
                </div>

                <div className="checkout-field-group">
                  <label htmlFor="postalCode">PIN Code *</label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 682001"
                    value={form.postalCode}
                    onChange={handleChange}
                    autoComplete="postal-code"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="checkout-section-header payment-step-header" style={{ marginTop: '32px' }}>
                <span className="checkout-step-badge">STEP 2</span>
                <h2 className="font-serif">Payment Method</h2>
                <p>Safe and verified payment at your doorstep</p>
              </div>

              <div className="checkout-payment-box">
                <div className="payment-radio-header">
                  <input
                    type="radio"
                    id="payment-cod"
                    name="paymentMethod"
                    value="COD"
                    checked
                    readOnly
                  />
                  <label htmlFor="payment-cod">
                    <strong>Cash on Delivery (COD)</strong>
                  </label>
                </div>
                <p className="payment-explanation">
                  Pay cash or UPI directly to the courier executive upon parcel delivery. No upfront payment required.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="checkout-alert error" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Prominent Place Order Button */}
              <button
                type="submit"
                className="checkout-submit-btn"
                disabled={submitting || cart.length === 0}
              >
                {submitting ? (
                  <>
                    <div className="spinner-ring sm" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Place Order (COD) • ₹{cartTotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="checkout-security-note">
                <ShieldCheck size={16} color="#15803D" />
                <span>Backend validated pricing. Stock deducted securely in a single transaction.</span>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="checkout-summary-col">
          <div className="checkout-card order-review-card">
            <h3 className="summary-title font-serif">Order Summary ({cart.length} items)</h3>

            <div className="checkout-items-list">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <img
                    src={item.image || '/images/brand/logo.png'}
                    alt={item.name}
                    className="checkout-item-img"
                    onError={(e) => {
                      e.target.src = '/images/brand/logo.png';
                    }}
                  />
                  <div className="checkout-item-details">
                    <span className="checkout-item-title">{item.name}</span>
                    <span className="checkout-item-meta">
                      Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                    </span>
                  </div>
                  <strong className="checkout-item-price">
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-totals-box">
              <div className="checkout-total-row">
                <span>Items Subtotal</span>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>
              <div className="checkout-total-row">
                <span>Shipping & Delivery</span>
                <span className="free-shipping-tag">FREE</span>
              </div>
              <div className="checkout-total-row">
                <span>Payment Mode</span>
                <span>Cash on Delivery</span>
              </div>
              <div className="checkout-total-divider" />
              <div className="checkout-grand-total-row">
                <span>Total Payable</span>
                <strong className="grand-price">₹{cartTotal.toFixed(2)}</strong>
              </div>
            </div>

            <div className="checkout-trust-box">
              <div className="checkout-trust-item">
                <Truck size={18} color="#15803D" />
                <span>Pan-India express delivery</span>
              </div>
              <div className="checkout-trust-item">
                <ShieldCheck size={18} color="#15803D" />
                <span>Quality guaranteed retort pouch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
