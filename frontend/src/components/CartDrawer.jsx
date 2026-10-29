import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  onChangeQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onViewCart,
}) {
  if (!isOpen) return null;

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} color="#0A0A0A" />
            <h2>Your Basket ({totalCount})</h2>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-icon-wrap">
              <ShoppingBag size={48} strokeWidth={1.5} color="#7B7B7B" />
            </div>
            <h3>Your basket is empty</h3>
            <p>Explore our ready-to-eat Kerala meals and treat yourself to authentic flavours today.</p>
            <button
              type="button"
              className="continue-shopping-btn"
              onClick={onClose}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="cart-items-scroll">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-thumb-box">
                    <img
                      src={item.image || item.imageUrl || '/images/brand/logo.png'}
                      alt={item.name}
                      className="cart-item-img"
                      onError={(e) => {
                        e.target.src = '/images/brand/logo.png';
                      }}
                    />
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h4 className="cart-item-title">{item.name}</h4>
                      <button
                        type="button"
                        className="cart-item-delete-btn"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <span className="cart-item-unit-price">
                      ₹{Number(item.price).toFixed(2)} each
                    </span>

                    <div className="cart-item-bottom">
                      <div className="cart-qty-pill">
                        <button
                          type="button"
                          onClick={() => onChangeQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onChangeQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <strong className="cart-item-subtotal">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="cart-drawer-footer">
              <div className="cart-summary-line">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>

              <div className="cart-notice-badge">
                <ShieldCheck size={16} color="#15803D" />
                <span>Cash on Delivery available at checkout. No hidden charges.</span>
              </div>

              <div className="cart-drawer-dual-actions">
                <button
                  type="button"
                  className="cart-view-cart-btn"
                  onClick={() => {
                    onClose();
                    if (onViewCart) onViewCart();
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>View Cart</span>
                </button>

                <button
                  type="button"
                  className="cart-checkout-cta"
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={17} />
                </button>
              </div>

              <button
                type="button"
                className="cart-clear-btn"
                onClick={onClearCart}
              >
                <Trash2 size={14} />
                <span>Clear entire basket</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
