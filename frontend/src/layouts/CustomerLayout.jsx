import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ArrowUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import AccountModal from '../components/AccountModal';
import ContactModal from '../components/ContactModal';
import ProductModal from '../components/ProductModal';
import SessionGuard from '../components/SessionGuard';
import InstagramSection from '../components/InstagramSection';
import { useShop } from '../context/ShopContext';
import { clearAuth } from '../api';

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    products,
    cart,
    cartCount,
    addToCart,
    changeQuantity,
    removeFromCart,
    clearCart,
    currentUser,
    setCurrentUser,
    login,
    logout,
    cartOpen,
    setCartOpen,
    accountOpen,
    setAccountOpen,
    contactOpen,
    setContactOpen,
    quickViewProduct,
    setQuickViewProduct,
    sessionMessage,
    setSessionMessage,
  } = useShop();

  const handleSessionRenewed = (user) => {
    if (!user) return;
    setCurrentUser(user);
  };

  const handleSessionLogout = () => {
    clearAuth();
    setCurrentUser(null);
  };

  const handleSessionExpired = (message) => {
    clearAuth();
    setCurrentUser(null);
    setSessionMessage(message);
    navigate('/');
  };

  // Map route to navbar active state
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/shop')) return 'shop';
    if (path.startsWith('/product/')) return 'product';
    if (path === '/cart') return 'cart';
    if (path === '/checkout') return 'checkout';
    if (path.startsWith('/order-success')) return 'order-success';
    if (path.startsWith('/my-orders') || path.startsWith('/orders')) return 'my-orders';
    if (path.startsWith('/track-order')) return 'track-order';
    if (path.startsWith('/our-story') || path.startsWith('/story')) return 'story';
    if (path.startsWith('/admin')) return 'admin';
    return '';
  };

  const handleSelectCategory = (catId) => {
    navigate(`/shop?category=${encodeURIComponent(catId)}`);
  };

  const navProps = {
    currentPage: getCurrentPage(),
    setCurrentPage: (page) => {
      if (page === 'home') navigate('/');
      else if (page === 'shop') navigate('/shop');
      else if (page === 'my-orders' || page === 'orders') navigate('/my-orders');
      else if (page === 'track-order') navigate('/track-order');
      else if (page === 'checkout') navigate('/checkout');
      else if (page === 'cart') navigate('/cart');
      else if (page === 'admin') navigate('/admin');
      else navigate(`/${page}`);
    },
    cartCount,
    onOpenCart: () => setCartOpen(true),
    onOpenAccount: () => setAccountOpen(true),
    onOpenContact: () => setContactOpen(true),
    onOpenShop: () => navigate('/shop'),
    onSelectCategory: handleSelectCategory,
    onSelectProduct: (p) => setQuickViewProduct(p),
    currentUser,
    products,
    shopView: location.pathname === '/shop',
  };

  return (
    <div className="store-shell">
      {/* Session Guard & Alert Banner */}
      <SessionGuard
        currentUser={currentUser}
        onSessionRenewed={handleSessionRenewed}
        onLogout={handleSessionLogout}
        onExpired={handleSessionExpired}
      />

      {sessionMessage && (
        <div className="session-banner">
          <div className="session-banner-card">
            <p>{sessionMessage}</p>
            <button type="button" onClick={() => setSessionMessage('')}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Primary Navigation */}
      <Navbar {...navProps} />

      {/* Main Content Area */}
      <main className="main-content-flow">
        <Outlet />
      </main>

      {/* Instagram Community Section */}
      <InstagramSection />

      {/* Site Footer */}
      <footer className="site-footer" id="site-footer">
        <div className="footer-top-grid">
          {/* Brand & Social Column */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <span className="footer-wordmark">FUDCY FOODS</span>
              <span className="footer-brand-badge">Kerala Ready Meals</span>
            </div>
            <p className="footer-tagline">
              Delicious ready-to-eat Kerala meals crafted for busy lives. Authentic flavours, traditional recipes, and retort packaging that requires no refrigeration.
            </p>

            {/* Social Media & Quick Contact Row */}
            <div className="footer-social-row" aria-label="Social media and quick contact">
              <a
                href="https://www.instagram.com/fudcyfoods/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn instagram"
                aria-label="Follow Fudcy Foods on Instagram (opens in new tab)"
                title="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href="mailto:support@fudcyfoods.com"
                className="footer-social-icon-btn email"
                aria-label="Send email to support@fudcyfoods.com"
                title="Email Support"
              >
                <Mail size={18} />
              </a>

              <a
                href="tel:+919876543210"
                className="footer-social-icon-btn phone"
                aria-label="Call customer support at +91 98765 43210"
                title="Call Support"
              >
                <Phone size={18} />
              </a>

              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="footer-contact-modal-trigger"
                aria-label="Open contact form"
              >
                <span>Get in Touch</span>
              </button>
            </div>
          </div>

          {/* Explore Menu Section */}
          <div className="footer-col footer-col-links">
            <h4 className="footer-col-title">Explore Menu</h4>
            <div className="footer-links-list">
              <button type="button" onClick={() => navigate('/shop')}>
                All Products
              </button>
              <button type="button" onClick={() => handleSelectCategory('VEG')}>
                Veg Specialties
              </button>
              <button type="button" onClick={() => handleSelectCategory('CHICKEN')}>
                Chicken Meals
              </button>
              <button type="button" onClick={() => handleSelectCategory('FISH & PRAWNS')}>
                Fish & Prawns
              </button>
              <button type="button" onClick={() => handleSelectCategory('BUFFALO')}>
                Kerala Buffalo Mixes
              </button>
              <button type="button" onClick={() => navigate('/our-story')}>
                Our Story
              </button>
            </div>
          </div>

          {/* Customer Care Section */}
          <div className="footer-col footer-col-links">
            <h4 className="footer-col-title">Customer Care</h4>
            <div className="footer-links-list">
              <button type="button" onClick={() => navigate('/track-order')}>
                Track Your Order
              </button>
              <button type="button" onClick={() => navigate('/my-orders')}>
                My Orders
              </button>
              <button type="button" onClick={() => navigate('/account')}>
                Account & Profile
              </button>
              <button type="button" onClick={() => navigate('/cart')}>
                View Shopping Cart ({cartCount})
              </button>
              <button type="button" onClick={() => setContactOpen(true)}>
                Help & Contact Us
              </button>
            </div>
          </div>

          {/* Contact & Brand Promise Section */}
          <div className="footer-col footer-col-contact">
            <h4 className="footer-col-title">Contact & Support</h4>
            <div className="footer-contact-details">
              <a
                href="tel:+919876543210"
                className="footer-contact-pill"
                aria-label="Call Fudcy Foods support at +91 98765 43210"
              >
                <Phone size={15} className="contact-icon" />
                <span className="contact-text">+91 98765 43210</span>
              </a>

              <a
                href="mailto:support@fudcyfoods.com"
                className="footer-contact-pill"
                aria-label="Email Fudcy Foods support at support@fudcyfoods.com"
              >
                <Mail size={15} className="contact-icon" />
                <span className="contact-text">support@fudcyfoods.com</span>
              </a>

              <div className="footer-contact-info-item">
                <Clock size={15} className="contact-icon" />
                <span>Mon – Sat: 9:00 AM – 6:00 PM IST</span>
              </div>

              <div className="footer-contact-info-item">
                <MapPin size={15} className="contact-icon" />
                <span>Kerala, India • Pan-India Delivery</span>
              </div>
            </div>

            <div className="footer-promise-box">
              <span className="footer-promise-label">Brand Promise</span>
              <ul className="footer-promise">
                <li>No Refrigeration Required</li>
                <li>Ready in 3–5 Minutes</li>
                <li>Authentic Kerala Flavours</li>
                <li>Retort Pouch Protection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright-wrap">
            <span>
              © {new Date().getFullYear()} Fudcy Foods. All rights reserved.
            </span>
            <span className="footer-sub-tag">Traditional recipes, modern convenience.</span>
          </div>

          <button
            type="button"
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </footer>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onChangeQuantity={changeQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onViewCart={() => {
          setCartOpen(false);
          navigate('/cart');
        }}
        onProceedToCheckout={() => {
          setCartOpen(false);
          navigate('/checkout');
        }}
      />

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <ProductModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={addToCart}
          cartItem={cart.find((i) => i.id === quickViewProduct.id)}
        />
      )}

      {/* Account Login / Register Modal */}
      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={login}
        onLogout={logout}
        onGoToOrders={() => {
          setAccountOpen(false);
          navigate('/my-orders');
        }}
      />

      {/* Contact Inquiry Modal */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
