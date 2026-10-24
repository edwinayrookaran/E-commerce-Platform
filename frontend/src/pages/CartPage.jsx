import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    changeQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount
  } = useShop();

  if (cart.length === 0) {
    return (
      <div className="section-container cart-empty-wrap">
        <div className="cart-empty-card">
          <div className="empty-cart-icon-wrap">
            <ShoppingBag size={52} color="#9CA3AF" />
          </div>
          <h1 className="font-serif">Your Shopping Cart is Empty</h1>
          <p>
            Explore our curated selection of authentic ready-to-eat Kerala meals and curries.
          </p>
          <Link to="/shop" className="checkout-primary-btn">
            <span>Browse Full Menu</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container cart-page-wrap">
      <div className="cart-page-header">
        <h1 className="font-serif">Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h1>
        <button
          type="button"
          className="cart-clear-link"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>

      <div className="cart-main-layout">
        {/* Items List */}
        <div className="cart-items-col">
          <div className="cart-table-card">
            <div className="cart-items-list">
              {cart.map((item) => {
                const stock = Number(item.stockQuantity) || 99;
                return (
                  <div key={item.id} className="cart-item-row">
                    <img
                      src={item.image || '/images/brand/logo.png'}
                      alt={item.name}
                      className="cart-item-thumbnail"
                      onError={(e) => {
                        e.target.src = '/images/brand/logo.png';
                      }}
                    />

                    <div className="cart-item-info">
                      <span className="cart-item-cat">{item.category} • {item.packageWeight || '200g'}</span>
                      <Link to={`/product/${item.id}`} className="cart-item-name font-serif">
                        {item.name}
                      </Link>
                      <span className="cart-item-unit-price">₹{Number(item.price).toFixed(2)} each</span>
                    </div>

                    <div className="cart-item-qty-cell">
                      <div className="cart-qty-picker">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => changeQuantity(item.id, 1)}
                          disabled={item.quantity >= stock}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total-cell">
                      <span className="cart-line-total">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="cart-item-del-cell">
                      <button
                        type="button"
                        className="cart-del-btn"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove from cart"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-continue-wrap">
            <Link to="/shop" className="cart-continue-link">
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary-col">
          <div className="cart-summary-card">
            <h2 className="summary-title font-serif">Order Summary</h2>

            <div className="summary-row">
              <span>Items Subtotal</span>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery Fee</span>
              <span className="free-shipping-tag">FREE (Launch Offer)</span>
            </div>

            <div className="summary-row">
              <span>Payment Mode</span>
              <strong>Cash on Delivery (COD)</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span>Estimated Total</span>
              <strong className="summary-grand-total">₹{cartTotal.toFixed(2)}</strong>
            </div>

            <p className="summary-tax-note">All taxes included. Free doorstep delivery.</p>

            <button
              type="button"
              className="checkout-primary-btn proceed-btn"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="cart-trust-points">
              <div className="trust-point">
                <Truck size={18} color="#15803D" />
                <span>Pan-India Delivery in 2–4 Business Days</span>
              </div>
              <div className="trust-point">
                <ShieldCheck size={18} color="#15803D" />
                <span>No Refrigeration Required Retort Pouch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
