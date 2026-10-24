import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Copy,
  Check,
  Package,
  ArrowRight,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  Lock
} from 'lucide-react';
import { apiFetch } from '../api';
import { useShop } from '../context/ShopContext';
import '../Checkout.css';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const { currentUser } = useShop();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [guestPhoneInput, setGuestPhoneInput] = useState(phoneParam);

  async function fetchOrderDetails(phoneToVerify = phoneParam) {
    if (!id || isNaN(Number(id))) {
      setError('Invalid order ID provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = phoneToVerify
        ? `/api/orders/${id}?phone=${encodeURIComponent(phoneToVerify.trim())}`
        : `/api/orders/${id}`;

      const res = await apiFetch(url);

      if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
        if (!phoneToVerify && !currentUser) {
          setError('AUTH_REQUIRED');
        } else {
          setError('Order not found or you are not authorized to view this order.');
        }
        setOrder(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load order details (HTTP ${res.status})`);
      }

      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Could not retrieve order details from the server.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrderDetails(phoneParam);
  }, [id]);

  function handleCopyOrderId() {
    if (!order?.id) return;
    navigator.clipboard.writeText(String(order.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGuestVerifySubmit(e) {
    e.preventDefault();
    if (!guestPhoneInput.trim()) return;
    fetchOrderDetails(guestPhoneInput.trim());
  }

  if (loading) {
    return (
      <section className="checkout-page-container">
        <div className="product-loading-container" style={{ margin: '60px auto' }}>
          <div className="spinner-ring" />
          <p>Verifying and retrieving order #{id} from database...</p>
        </div>
      </section>
    );
  }

  if (error === 'AUTH_REQUIRED') {
    return (
      <section className="checkout-page-container">
        <div className="checkout-success-card" style={{ maxWidth: '560px' }}>
          <div className="success-icon-badge" style={{ background: '#FEF3C7' }}>
            <Lock size={44} color="#D97706" />
          </div>
          <h1 className="success-title font-serif">Order Verification Required</h1>
          <p className="success-subtitle">
            To view order <strong>#{id}</strong>, please verify the 10-digit mobile number used during checkout, or log in with your customer account.
          </p>

          <form onSubmit={handleGuestVerifySubmit} style={{ marginTop: '20px' }}>
            <div className="checkout-field-group" style={{ textAlign: 'left' }}>
              <label htmlFor="verifyPhone">10-Digit Mobile Number</label>
              <input
                id="verifyPhone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={guestPhoneInput}
                onChange={(e) => setGuestPhoneInput(e.target.value)}
                required
                style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '100%' }}
              />
            </div>
            <button
              type="submit"
              className="checkout-primary-btn"
              style={{ marginTop: '16px', width: '100%' }}
            >
              Verify & View Order
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link to="/login" className="checkout-secondary-btn" style={{ width: '100%' }}>
              Log In With Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="checkout-page-container">
        <div className="checkout-success-card" style={{ maxWidth: '560px' }}>
          <div className="success-icon-badge" style={{ background: '#FEE2E2' }}>
            <AlertCircle size={44} color="#DC2626" />
          </div>
          <h1 className="success-title font-serif">Unable to Retrieve Order</h1>
          <p className="success-subtitle">
            {error || 'This order could not be loaded. Please ensure you have entered the correct order ID and phone number.'}
          </p>
          <div className="success-actions" style={{ marginTop: '24px' }}>
            <Link to="/shop" className="checkout-primary-btn">
              Continue Shopping
            </Link>
            <Link to="/track-order" className="checkout-secondary-btn">
              Track Order via Lookup
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <section className="checkout-page-container">
      <div className="checkout-success-card">
        {/* Success Icon Badge */}
        <div className="success-icon-badge">
          <CheckCircle size={56} color="#15803D" />
        </div>

        <span className="success-tag">ORDER CONFIRMED & VERIFIED</span>
        <h1 className="success-title font-serif">Thank You for Your Order!</h1>

        <p className="success-subtitle">
          Your order <strong>#{order.id}</strong> has been successfully placed and saved in our system. Our team in Kerala is preparing your ready-to-eat meals for dispatch.
        </p>

        {/* Order Details Receipt Box */}
        <div className="order-receipt-box">
          <div className="receipt-row top">
            <div>
              <span className="receipt-label">OFFICIAL ORDER ID</span>
              <h2 className="receipt-order-id font-serif">#{order.id}</h2>
            </div>
            <button
              type="button"
              className="copy-id-btn"
              onClick={handleCopyOrderId}
              title="Copy Order ID"
            >
              {copied ? <Check size={16} color="#15803D" /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>

          <div className="receipt-details">
            <div className="receipt-item">
              <span className="receipt-meta-label">
                <Calendar size={15} /> Order Date:
              </span>
              <strong>{orderDate}</strong>
            </div>

            <div className="receipt-item">
              <span className="receipt-meta-label">
                <Clock size={15} /> Order Status:
              </span>
              <span className={`status-pill ${order.status?.toLowerCase() || 'placed'}`}>
                {order.status || 'PLACED'}
              </span>
            </div>

            <div className="receipt-item">
              <span className="receipt-meta-label">
                <CreditCard size={15} /> Payment Mode:
              </span>
              <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}</strong>
            </div>

            <div className="receipt-item">
              <span className="receipt-meta-label">Recipient:</span>
              <strong>{order.customerName || 'Valued Customer'}</strong>
            </div>

            {order.phone && (
              <div className="receipt-item">
                <span className="receipt-meta-label">
                  <Phone size={15} /> Contact Mobile:
                </span>
                <strong>{order.phone}</strong>
              </div>
            )}

            <div className="receipt-item">
              <span className="receipt-meta-label">
                <MapPin size={15} /> Delivery Address:
              </span>
              <span className="receipt-address">{order.deliveryAddress}</span>
            </div>
          </div>

          {/* Purchased Items Table */}
          {order.items && order.items.length > 0 && (
            <div className="receipt-items-section" style={{ marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#374151' }}>Purchased Items</h4>
              <div className="receipt-items-table" style={{ width: '100%' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px dashed #F3F4F6',
                      fontSize: '14px',
                    }}
                  >
                    <div>
                      <strong>{item.productName}</strong>
                      <span style={{ color: '#6B7280', marginLeft: '8px' }}>
                        Qty: {item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}
                      </span>
                    </div>
                    <strong style={{ color: '#111827' }}>
                      ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grand Total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '2px solid #E5E7EB',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>Total Amount</span>
            <strong style={{ fontSize: '20px', color: '#15803D' }}>
              ₹{Number(order.totalAmount).toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <Link
            to={`/track-order?orderId=${order.id}${order.phone ? '&phone=' + encodeURIComponent(order.phone) : ''}`}
            className="checkout-primary-btn"
          >
            <Package size={18} />
            <span>Track This Order</span>
          </Link>

          <Link to="/shop" className="checkout-secondary-btn">
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
