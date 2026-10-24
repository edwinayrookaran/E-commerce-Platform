import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Hero from '../components/Hero';
import CravingCategories from '../components/CravingCategories';
import FudcyFavourites from '../components/FudcyFavourites';
import ProductCard from '../components/ProductCard';
import ConvenienceSection from '../components/ConvenienceSection';
import BrandStory from '../components/BrandStory';
import Testimonials from '../components/Testimonials';
import TrustBanner from '../components/TrustBanner';
import { CATEGORIES } from '../catalogHelper';
import { useShop } from '../context/ShopContext';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    products,
    loadingProducts,
    productsError,
    cart,
    addToCart,
    setQuickViewProduct
  } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = document.querySelectorAll('.scroll-reveal');

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category === selectedCategory ||
      (selectedCategory === 'RICE & MEALS' && product.category?.includes('RICE'));

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  return (
    <>
      {/* Hero Banner */}
      <Hero
        onShopClick={() => {
          const el = document.getElementById('catalogue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreClick={() => {
          const el = document.getElementById('story');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          const el = document.getElementById('catalogue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Craving Categories */}
      <CravingCategories
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          const el = document.getElementById('catalogue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        selectedCategory={selectedCategory}
      />

      {/* Fudcy Favourites */}
      <FudcyFavourites
        products={products}
        onAddToCart={addToCart}
        onQuickView={(p) => setQuickViewProduct(p)}
        cart={cart}
        onViewAll={() => {
          setSelectedCategory('All');
          const el = document.getElementById('catalogue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Full Shopping Catalogue */}
      <section className="catalogue-section" id="catalogue">
        <div className="section-container">
          <div className="section-header-split">
            <h2 className="display-title">Explore Our Full Menu</h2>
            <p className="split-caption">
              Cooked with authentic Kerala spices<br />and sealed for freshness.<br />No refrigeration required.
            </p>
          </div>

          {/* Filter Toolbar */}
          <div className="catalogue-toolbar">
            <div className="catalogue-search-row">
              <div className="catalog-search-box">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search by meal name or ingredient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical (A–Z)</option>
              </select>
            </div>

            {/* Category Filter Pills */}
            <div className="category-filter-pills" role="tablist">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  role="tab"
                  aria-selected={selectedCategory === cat.id}
                >
                  <span>{cat.displayName || cat.name}</span>
                  {cat.id !== 'All' && <small> ({cat.count})</small>}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts && (
            <p className="empty-catalogue-msg">Loading authentic Kerala catalogue...</p>
          )}

          {productsError && (
            <div className="empty-catalogue-msg">
              <p style={{ color: '#b91c1c' }}>{productsError}</p>
            </div>
          )}

          {!loadingProducts && !productsError && (
            <>
              <div className="product-grid">
                {sortedProducts.map((product) => {
                  const cartItem = cart.find((i) => i.id === product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onQuickView={(p) => setQuickViewProduct(p)}
                      cartItem={cartItem}
                    />
                  );
                })}
              </div>

              {sortedProducts.length === 0 && (
                <div className="empty-catalogue-msg">
                  <p>No products match your search or category filter.</p>
                  <button
                    type="button"
                    className="continue-shopping-btn"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Convenience Section */}
      <ConvenienceSection />

      {/* Brand Story */}
      <BrandStory
        onExploreMeals={() => {
          const el = document.getElementById('catalogue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Testimonials */}
      <Testimonials />

      {/* Trust & Features Banner */}
      <TrustBanner onTrackOrderClick={() => navigate('/track-order')} />
    </>
  );
}
