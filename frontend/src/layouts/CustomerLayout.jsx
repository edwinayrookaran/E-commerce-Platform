import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
    if (path === '/my-orders') return 'my-orders';
    if (path === '/track-order') return 'track-order';
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
      else if (page === 'my-orders') navigate('/my-orders');
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
      <footer className="site-footer">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <span className="footer-wordmark">FUDCY FOODS</span>
            <p className="footer-tagline">
              Delicious ready-to-eat Kerala meals crafted for busy lives. Authentic flavours, traditional recipes, and retort packaging that requires no refrigeration.
            </p>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
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
            </div>
          </div>

          <div className="footer-col">
            <h4>Customer Care</h4>
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
                View Shopping Cart
              </button>
              <button type="button" onClick={() => setContactOpen(true)}>
                Help & Contact Us
              </button>
            </div>
          </div>

          <div className="footer-col">
            <h4>Brand Promise</h4>
            <ul className="footer-promise">
              <li>No Refrigeration Required</li>
              <li>Ready in 3–5 Minutes</li>
              <li>Authentic Kerala Recipes</li>
              <li>Pan-India Delivery</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>
            © {new Date().getFullYear()} Fudcy Foods. All rights reserved.
          </span>
          <button
            type="button"
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top
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
