import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import TrustBanner from '../components/TrustBanner';
import { CATEGORIES } from '../catalogHelper';
import { useShop } from '../context/ShopContext';

export default function ShopPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const {
    products,
    loadingProducts,
    productsError,
    cart,
    addToCart,
    setQuickViewProduct
  } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

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
    <div className="shop-page-wrap">
      {/* Themed Catalogue Section */}
      <section className="catalogue-section shop-catalogue-page">
        <div className="section-container">
          {/* Breadcrumbs */}
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Shop Menu</span>
          </nav>

          {/* Section Heading matching Home Theme */}
          <div className="shop-page-header">
            <span className="section-eyebrow">AUTHENTIC KERALA CUISINE · READY TO EAT</span>
            <div className="section-header-split">
              <div className="heading-row">
                <h1 className="display-title">Explore Our Full Menu</h1>
                <span className="heading-rule" aria-hidden="true" />
              </div>
              <p className="split-caption">
                Cooked with authentic Kerala spices<br />and sealed for freshness.<br />No refrigeration required.
              </p>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="catalogue-toolbar">
            <div className="catalogue-search-row">
              <div className="catalog-search-box">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search meals, curries, or ingredients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search meals"
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
                  onClick={() => handleCategoryChange(cat.id)}
                  role="tab"
                  aria-selected={selectedCategory === cat.id}
                >
                  <span>{cat.displayName || cat.name}</span>
                  {cat.id !== 'All' && <small> ({cat.count})</small>}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="shop-results-bar">
            <span className="shop-count-label">
              Showing <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? 'meal' : 'meals'}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </span>
            {(search || selectedCategory !== 'All') && (
              <button
                type="button"
                className="shop-clear-btn"
                onClick={() => {
                  setSearch('');
                  handleCategoryChange('All');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Loading & Error States */}
          {loadingProducts && (
            <div className="shop-loading-card">
              <div className="spinner-ring" />
              <p>Loading ready-to-eat meals...</p>
            </div>
          )}

          {productsError && (
            <div className="shop-error-card">
              <p>{productsError}</p>
            </div>
          )}

          {/* Products Grid */}
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
                  <Package size={48} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
                  <h3 className="empty-title">No meals found</h3>
                  <p>We couldn't find any products matching your selected search or filter.</p>
                  <button
                    type="button"
                    className="continue-shopping-btn"
                    onClick={() => {
                      setSearch('');
                      handleCategoryChange('All');
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <TrustBanner onTrackOrderClick={() => navigate('/track-order')} />
    </div>
  );
}
