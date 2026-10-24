import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, Eye, Check } from 'lucide-react';

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  cartItem
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const stock = Number(product.stockQuantity) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const currentCartQty = cartItem ? cartItem.quantity : 0;

  function handleAdd() {
    if (isOutOfStock) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  }

  // Display image: if hovered and hoverImage exists, show hover image
  const displayImage = isHovered && product.hoverImage
    ? product.hoverImage
    : product.image;

  return (
    <article
      className="fudcy-product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges */}
      <div className="card-image-container">
        <Link to={`/product/${product.id}`} className="card-img-link" aria-label={`View ${product.name}`}>
          <img
            src={displayImage}
            alt={product.name}
            className="card-product-img"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/images/brand/logo.png';
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="card-badges-row">
          {product.discount && (
            <span className="discount-pill">{product.discount}</span>
          )}
          {product.badge && (
            <span className="special-pill">{product.badge}</span>
          )}
        </div>

        {/* Quick View Floating Action */}
        <button
          type="button"
          className="quick-view-action"
          onClick={() => onQuickView(product)}
          aria-label={`Quick view ${product.name}`}
        >
          <Eye size={16} />
          <span>Quick View</span>
        </button>

        {/* Package Weight Floating Pill */}
        {product.packageWeight && (
          <span className="weight-pill">{product.packageWeight}</span>
        )}
      </div>

      {/* Card Body */}
      <div className="card-content">
        <div className="card-meta">
          <span className="card-category">{product.category}</span>
          <span className={`stock-status ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} left` : 'In Stock'}
          </span>
        </div>

        <Link to={`/product/${product.id}`} className="card-title-link">
          <h3 className="card-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <p className="card-description">{product.description}</p>

        {/* Pricing & Add to Cart Area */}
        <div className="card-bottom-row">
          <div className="price-stack">
            <span className="price-current">
              ₹{Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <del className="price-original">
                ₹{Number(product.originalPrice).toFixed(2)}
              </del>
            )}
          </div>

          <div className="card-cta-area">
            {currentCartQty > 0 ? (
              <div className="card-qty-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onAddToCart(product, -1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="qty-number">{currentCartQty}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => onAddToCart(product, 1)}
                  disabled={stock <= currentCartQty}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`card-add-btn ${justAdded ? 'just-added' : ''}`}
                onClick={handleAdd}
                disabled={isOutOfStock}
              >
                {justAdded ? (
                  <>
                    <Check size={14} />
                    <span>Added</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>Add to cart</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
