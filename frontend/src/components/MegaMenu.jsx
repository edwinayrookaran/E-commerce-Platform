import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../catalogHelper';

export default function MegaMenu({
  isOpen,
  activeTrigger,
  onClose,
  onSelectCategory,
  onSelectProduct,
  products = []
}) {
  const menuRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtered categories for menu
  const menuCategories = CATEGORIES;

  // Find 2 featured products for right column
  const fishProd = products.find(p => p.name?.includes('Fish Vattichathu')) || {
    id: 20,
    name: 'Fish Vattichathu 200g',
    price: 208,
    originalPrice: 260,
    image: '/images/products/fish-vattichathu-200g-front.webp'
  };

  const beefProd = products.find(p => p.name?.includes('Buffalo Meat Roast')) || {
    id: 17,
    name: 'Kerala Buffalo Meat Roast 200g',
    price: 232,
    originalPrice: 290,
    image: '/images/products/kerala-buffalo-meat-roast-200g-front.webp'
  };

  return (
    <div
      className="mega-menu-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={menuRef}
        className="mega-menu-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Shop and Categories Mega Menu"
      >
        <div className="mega-menu-grid">
          {/* Column 1: Shop by Category */}
          <div className="mega-col category-col">
            <div className="mega-col-header">
              <span className="mega-tag">EXPLORE</span>
              <h3>Shop by Category</h3>
            </div>

            <div className="mega-category-list">
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="mega-cat-item"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onClose();
                  }}
                >
                  <div className="mega-cat-icon-wrap">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="mega-cat-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="mega-cat-info">
                    <span className="mega-cat-name">{cat.name}</span>
                    <span className="mega-cat-tagline">{cat.tagline}</span>
                  </div>
                  <ChevronRight size={16} className="mega-cat-arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Highlights & Curated Collections (Athleats style) */}
          <div className="mega-col curated-col">
            <div className="mega-col-header">
              <span className="mega-tag">HIGHLIGHTS</span>
              <h3>Authentic Meals</h3>
            </div>

            <div className="mega-curated-list">
              <div
                className="mega-curated-card"
                onClick={() => {
                  onSelectCategory('All');
                  onClose();
                  const el = document.getElementById('favourites');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="curated-icon-box">
                  <Flame size={18} color="#F08A24" />
                </div>
                <div>
                  <h4>The Fudcy Favourites</h4>
                  <p>Our four top-rated Kerala classics, prepared with authentic spice blends.</p>
                </div>
              </div>

              <div
                className="mega-curated-card"
                onClick={() => {
                  onClose();
                  const el = document.getElementById('convenience');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="curated-icon-box">
                  <ShieldCheck size={18} color="#0A0A0A" />
                </div>
                <div>
                  <h4>No Refrigeration Required</h4>
                  <p>Safe retort pouch packaging preserves fresh home-cooked taste at room temperature.</p>
                </div>
              </div>

              <div
                className="mega-curated-card"
                onClick={() => {
                  onClose();
                  const el = document.getElementById('convenience');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="curated-icon-box">
                  <Clock size={18} color="#0A0A0A" />
                </div>
                <div>
                  <h4>Ready in 3–5 Minutes</h4>
                  <p>Made for busy days and quick lunches — simply heat and enjoy anytime.</p>
                </div>
              </div>

              <div
                className="mega-curated-card promo-card"
                onClick={() => {
                  onSelectCategory('All');
                  onClose();
                }}
              >
                <div className="curated-icon-box gold">
                  <Sparkles size={18} color="#F08A24" />
                </div>
                <div>
                  <h4>Official 20% Off Promotion</h4>
                  <p>Verified launch discounts active on the entire ready-to-eat catalogue.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Tall Editorial Product Cards (Engine style) */}
          <div className="mega-col visual-col">
            <div className="mega-col-header">
              <span className="mega-tag">FEATURED</span>
              <h3>Signature Dishes</h3>
            </div>

            <div className="mega-visual-grid">
              {/* Card 1: Fish Vattichathu */}
              <div
                className="mega-image-card"
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(fishProd);
                  onClose();
                }}
              >
                <div className="mega-image-wrapper">
                  <img
                    src={fishProd.image || '/images/products/fish-vattichathu-200g-front.webp'}
                    alt="Fish Vattichathu"
                    loading="lazy"
                  />
                  <span className="mega-badge">20% OFF</span>
                </div>
                <div className="mega-card-body">
                  <span className="mega-card-cat">Kottayam Classic</span>
                  <h5>Fish Vattichathu 200g</h5>
                  <div className="mega-card-price">
                    <strong>₹208.00</strong>
                    <del>₹260.00</del>
                  </div>
                  <span className="mega-card-link">
                    View Details <ArrowRight size={13} />
                  </span>
                </div>
              </div>

              {/* Card 2: Buffalo Meat Roast */}
              <div
                className="mega-image-card"
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(beefProd);
                  onClose();
                }}
              >
                <div className="mega-image-wrapper">
                  <img
                    src={beefProd.image || '/images/products/kerala-buffalo-meat-roast-200g-front.webp'}
                    alt="Kerala Buffalo Meat Roast"
                    loading="lazy"
                  />
                  <span className="mega-badge">20% OFF</span>
                </div>
                <div className="mega-card-body">
                  <span className="mega-card-cat">Kerala Specialty</span>
                  <h5>Kerala Buffalo Roast</h5>
                  <div className="mega-card-price">
                    <strong>₹232.00</strong>
                    <del>₹290.00</del>
                  </div>
                  <span className="mega-card-link">
                    View Details <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mega Menu Footer Bar */}
        <div className="mega-menu-footer">
          <span>🌿 Authentic food, ready for real life — Kerala flavours, delivered across India.</span>
          <button
            type="button"
            className="mega-footer-link"
            onClick={() => {
              onSelectCategory('All');
              onClose();
            }}
          >
            Browse Full Shop Catalogue (21 items) <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
