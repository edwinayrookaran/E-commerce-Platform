import ProductCard from './ProductCard';
import { FAVOURITES_NAMES } from '../catalogHelper';

export default function FudcyFavourites({
  products = [],
  onAddToCart,
  onQuickView,
  cart = [],
  onViewAll
}) {
  // Find the 4 favourite products from backend products
  const favouriteProducts = FAVOURITES_NAMES.map(name => {
    return products.find(p => p.name === name || p.name?.trim() === name);
  }).filter(Boolean);

  // If some favourites not yet loaded or matched, take first 4 available products
  const displayProducts = favouriteProducts.length >= 4
    ? favouriteProducts
    : products.slice(0, 4);

  return (
    <section className="favourites-section scroll-reveal" id="favourites">
      <div className="section-container">
        <div className="section-header-split">
          <h2 className="display-title">The Fudcy Favourites</h2>
          <p className="split-caption">
            Our most-loved meals,<br />ready when you are.
          </p>
        </div>

        <div className="favourites-grid">
          {displayProducts.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                cartItem={cartItem}
              />
            );
          })}
        </div>

        <div className="view-all-row">
          <button
            type="button"
            className="view-all-link-btn"
            onClick={onViewAll}
          >
            <span>View all ready meals</span>
            <span className="arrow-line" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
