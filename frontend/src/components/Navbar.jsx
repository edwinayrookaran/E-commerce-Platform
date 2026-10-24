import { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  ChevronDown,
  User,
  Menu,
  X
} from 'lucide-react';
import MegaMenu from './MegaMenu';
import { CATEGORIES } from '../catalogHelper';

export default function Navbar({
                                 currentPage,
                                 setCurrentPage,
                                 cartCount,
                                 onOpenCart,
                                 onOpenAccount,
                                 onOpenContact,
                                 onOpenShop,
                                 onSelectCategory,
                                 onSelectProduct,
                                 currentUser,
                                 selectedCategory = 'All',
                                 shopView = false,
                                 products = []
                               }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaTrigger, setMegaTrigger] = useState(null); // 'shop' | 'categories'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCatAccordion, setMobileCatAccordion] = useState(false);

  const hoverTimeoutRef = useRef(null);

  // Intentional hover handlers with debounce bridge (prevents accidental closing)
  function handleMouseEnter(triggerName) {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setMegaTrigger(triggerName);
    setMegaOpen(true);
  }

  function handleMouseLeave() {
    hoverTimeoutRef.current = setTimeout(() => {
      setMegaOpen(false);
      setMegaTrigger(null);
    }, 220); // 220ms grace period so moving mouse into dropdown never glitches
  }

  function toggleMega(triggerName) {
    if (megaOpen && megaTrigger === triggerName) {
      setMegaOpen(false);
      setMegaTrigger(null);
    } else {
      setMegaTrigger(triggerName);
      setMegaOpen(true);
    }
  }

  // Close mobile drawer on resize to desktop and on Escape key
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 992) {
        setMobileMenuOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
      <>
        <header className="site-header">
          {/* Top Announcement Bar */}
          <div className="announcement-bar">
            <div className="announcement-content">
              <span className="announcement-icon">✨</span>
              <span>
              <strong>Authentic Kerala Food, Ready for Real Life.</strong> No refrigeration required. Fast delivery across India.
            </span>
              <span className="announcement-badge">20% OFF LAUNCH SALE</span>
            </div>
          </div>

          {/* Main Navbar */}
          <div className="navbar-container">
            <div className="navbar-inner">
              {/* Mobile Hamburger Button (Top Left) */}
              <button
                  type="button"
                  className="mobile-hamburger-btn"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                  aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* Modern Logo */}
              <a
                  href="#home"
                  className="navbar-brand"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage('home');
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  aria-label="Fudcy Foods Home"
              >
                <img
                    src="/images/brand/logo.png"
                    alt="Fudcy Foods"
                    className="navbar-logo-img"
                />
              </a>

              {/* Desktop Navigation Links */}
              <nav className="desktop-nav" aria-label="Main Navigation">
                <a
                    href="#home"
                    className={`nav-link ${currentPage === 'home' && !shopView && !megaOpen ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage('home');
                      setMegaOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                >
                  Home
                </a>

                <button
                    type="button"
                    className={`nav-link ${(currentPage === 'shop' || (currentPage === 'home' && shopView)) && !megaOpen ? 'active' : ''}`}
                    onClick={() => {
                      setMegaOpen(false);
                      setMegaTrigger(null);
                      if (onOpenShop) onOpenShop();
                    }}
                >
                  Shop
                </button>

                {/* Categories dropdown trigger */}
                <div
                    className="nav-item-dropdown"
                    onMouseEnter={() => handleMouseEnter('categories')}
                    onMouseLeave={handleMouseLeave}
                >
                  <button
                      type="button"
                      className={`nav-link mega-trigger ${
                          (megaOpen && megaTrigger === 'categories') ||
                          (currentPage === 'home' && selectedCategory !== 'All')
                              ? 'active-pill'
                              : ''
                      }`}
                      onClick={() => toggleMega('categories')}
                      aria-expanded={megaOpen && megaTrigger === 'categories'}
                      aria-haspopup="true"
                  >
                    <span>Categories</span>
                    <ChevronDown
                        size={15}
                        className={`nav-caret ${megaOpen && megaTrigger === 'categories' ? 'caret-rotated' : ''}`}
                    />
                  </button>
                </div>

                <a
                    href="#story"
                    className="nav-link"
                    onClick={(e) => {
                      if (currentPage !== 'home') {
                        e.preventDefault();
                        setCurrentPage('home');
                        setTimeout(() => {
                          const el = document.getElementById('story');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                >
                  Our Story
                </a>

                <button
                    type="button"
                    className="nav-link nav-btn-link"
                    onClick={onOpenContact}
                >
                  Contact
                </button>

                <button
                    type="button"
                    className={`nav-link nav-btn-link ${currentPage === 'my-orders' ? 'active' : ''}`}
                    onClick={() => {
                      setMegaOpen(false);
                      setCurrentPage('my-orders');
                    }}
                >
                  My Orders
                </button>

                <button
                    type="button"
                    className={`nav-link nav-btn-link ${currentPage === 'track-order' ? 'active' : ''}`}
                    onClick={() => {
                      setMegaOpen(false);
                      setCurrentPage('track-order');
                    }}
                >
                  Track Order
                </button>
              </nav>

              {/* Right Action Icons & Buttons */}
              <div className="navbar-actions">
                {/* Account Button */}
                <button
                    type="button"
                    className="action-pill-btn account-pill"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccount();
                    }}
                    aria-label="Customer Account"
                >
                  <User size={15} className="account-icon" />
                  <span className="account-label">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
                </span>
                </button>

                {/* Cart Button with Live Badge */}
                <button
                    type="button"
                    className="action-pill-btn cart-pill"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCart();
                    }}
                    aria-label={`Open Cart with ${cartCount} items`}
                >
                  <div className="cart-icon-wrapper">
                    <ShoppingBag size={17} />
                    {cartCount > 0 && (
                        <span className="cart-badge-count">{cartCount}</span>
                    )}
                  </div>
                  <span className="cart-label">Cart</span>
                </button>

                {currentUser?.role === 'ADMIN' && (
                    <button
                        type="button"
                        className={`admin-portal-pill ${currentPage === 'admin' ? 'active' : ''}`}
                        onClick={() => {
                          setMegaOpen(false);
                          setMobileMenuOpen(false);
                          setCurrentPage('admin');
                        }}
                        title="Admin Dashboard"
                    >
                      Admin
                    </button>
                )}
              </div>
            </div>
          </div>

          {/* Mega Menu Dropdown */}
          <div
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
          >
            <MegaMenu
                isOpen={megaOpen}
                activeTrigger={megaTrigger}
                onClose={() => {
                  setMegaOpen(false);
                  setMegaTrigger(null);
                }}
                onSelectCategory={(catId) => {
                  if (currentPage !== 'home') setCurrentPage('home');
                  onSelectCategory(catId);
                }}
                onSelectProduct={onSelectProduct}
                products={products}
            />
          </div>

          {/* Mobile Navigation Dropdown (Aligned directly beneath navbar) */}
          {mobileMenuOpen && (
              <>
                <div
                    className="mobile-menu-backdrop"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
                <div
                    className="mobile-nav-panel"
                    role="dialog"
                    aria-label="Mobile Navigation"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="mobile-drawer-body">
                    <nav className="mobile-nav-links">
                      <a
                          href="#home"
                          className="mobile-nav-link"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('home');
                            setMobileMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                      >
                        Home
                      </a>

                      <button
                          type="button"
                          className={`mobile-nav-link text-left ${currentPage === 'shop' ? 'active' : ''}`}
                          onClick={() => {
                            if (onOpenShop) onOpenShop();
                            setMobileMenuOpen(false);
                          }}
                      >
                        Shop
                      </button>

                      {/* Categories Accordion */}
                      <div className="mobile-accordion">
                        <button
                            type="button"
                            className="mobile-accordion-header"
                            onClick={() => setMobileCatAccordion(!mobileCatAccordion)}
                        >
                          <span>Browse Categories</span>
                          <ChevronDown
                              size={18}
                              className={mobileCatAccordion ? 'caret-rotated' : ''}
                          />
                        </button>

                        {mobileCatAccordion && (
                            <div className="mobile-accordion-content">
                              {CATEGORIES.map((cat) => (
                                  <button
                                      key={cat.id}
                                      type="button"
                                      className="mobile-cat-pill"
                                      onClick={() => {
                                        if (currentPage !== 'home') setCurrentPage('home');
                                        onSelectCategory(cat.id);
                                        setMobileMenuOpen(false);
                                      }}
                                  >
                                    <span>{cat.name}</span>
                                    <span className="mobile-cat-count">{cat.count}</span>
                                  </button>
                              ))}
                            </div>
                        )}
                      </div>

                      <a
                          href="#story"
                          className="mobile-nav-link"
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            if (currentPage !== 'home') {
                              e.preventDefault();
                              setCurrentPage('home');
                              setTimeout(() => {
                                const el = document.getElementById('story');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }
                          }}
                      >
                        Our Story
                      </a>

                      <button
                          type="button"
                          className="mobile-nav-link text-left"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenContact();
                          }}
                      >
                        Contact & Support
                      </button>

                      <button
                          type="button"
                          className="mobile-nav-link text-left"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setCurrentPage('my-orders');
                          }}
                      >
                        My Orders
                      </button>

                      <button
                          type="button"
                          className="mobile-nav-link text-left"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setCurrentPage('track-order');
                          }}
                      >
                        Track Order
                      </button>

                      {currentUser?.role === 'ADMIN' && (
                          <button
                              type="button"
                              className="mobile-nav-link text-left"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setCurrentPage('admin');
                              }}
                          >
                            Admin Portal
                          </button>
                      )}
                    </nav>

                    <div className="mobile-drawer-footer">
                      <button
                          type="button"
                          className="mobile-account-btn"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            onOpenAccount();
                          }}
                      >
                        <User size={18} />
                        <span>{currentUser ? `Hi, ${currentUser.name}` : 'Login / Register'}</span>
                      </button>

                      <p className="mobile-drawer-tagline">
                        Authentic food, ready for real life 🌿
                      </p>
                    </div>
                  </div>
                </div>
              </>
          )}
        </header>
      </>
  );
}


