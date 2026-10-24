import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Check, Flame, ShieldCheck, Clock, Award } from 'lucide-react';

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  cartItem
}) {
  const [selectedImage, setSelectedImage] = useState('front');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const stock = Number(product.stockQuantity) || 0;
  const isOutOfStock = stock <= 0;

  function handleAdd() {
    if (isOutOfStock) return;
    for (let i = 0; i < qty; i++) {
      onAddToCart(product, 1);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const currentImg = selectedImage === 'front' || !product.hoverImage
    ? product.image
    : product.hoverImage;

  return (
    <div className="product-modal-backdrop" onClick={onClose}>
      <div
        className="product-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${product.name} details`}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="modal-content-grid">
          {/* Left: Product Imagery with Pouch/Back Switcher */}
          <div className="modal-gallery-col">
            <div className="modal-main-image-wrap">
              <img
                src={currentImg}
                alt={product.name}
                className="modal-main-img"
              />
              {product.discount && (
                <span className="modal-badge">{product.discount}</span>
              )}
            </div>

            {product.hoverImage && (
              <div className="modal-thumb-switcher">
                <button
                  type="button"
                  className={`modal-thumb-btn ${selectedImage === 'front' ? 'active' : ''}`}
                  onClick={() => setSelectedImage('front')}
                >
                  <img src={product.image} alt="Front Pouch View" />
                  <span>Front View</span>
                </button>
                <button
                  type="button"
                  className={`modal-thumb-btn ${selectedImage === 'back' ? 'active' : ''}`}
                  onClick={() => setSelectedImage('back')}
                >
                  <img src={product.hoverImage} alt="Nutrition / Back View" />
                  <span>Nutrition & Back</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Product Details & Cart Action */}
          <div className="modal-info-col">
            <div className="modal-meta-row">
              <span className="modal-cat-tag">{product.category}</span>
              {product.packageWeight && (
                <span className="modal-weight-tag">{product.packageWeight}</span>
              )}
            </div>

            <h2 className="modal-product-title font-serif">{product.name}</h2>

            <div className="modal-price-row">
              <span className="modal-price-current">
                ₹{Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <del className="modal-price-orig">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </del>
              )}
              {product.discount && (
                <span className="modal-savings-tag">Save ₹{(Number(product.originalPrice) - Number(product.price)).toFixed(2)}</span>
              )}
            </div>

            <p className="modal-description">{product.description}</p>

            {/* Preparation / Retort Highlights */}
            <div className="modal-features-box">
              <div className="modal-feat-item">
                <Clock size={16} color="#0A0A0A" />
                <div>
                  <strong>Ready in 3–5 Minutes</strong>
                  <span>Immerse unopened pouch in boiling water for 3–5 mins or heat bowl in microwave for 1–2 mins.</span>
                </div>
              </div>
              <div className="modal-feat-item">
                <ShieldCheck size={16} color="#0A0A0A" />
                <div>
                  <strong>No Refrigeration Required</strong>
                  <span>State-of-the-art retort packaging technology keeps food fresh at ambient temperature.</span>
                </div>
              </div>
              <div className="modal-feat-item">
                <Award size={16} color="#F08A24" />
                <div>
                  <strong>Authentic Kerala Recipe</strong>
                  <span>Crafted with traditional ground spices and fresh ingredients.</span>
                </div>
              </div>
            </div>

            {/* Stock status */}
            <div className="modal-stock-line">
              <span className={`stock-indicator ${isOutOfStock ? 'out' : 'in'}`} />
              <span>
                {isOutOfStock
                  ? 'Currently out of stock'
                  : `In stock — ${stock} units available at warehouse`}
              </span>
            </div>

            {/* Quantity and Add to Cart Action */}
            <div className="modal-cta-row">
              {!isOutOfStock && (
                <div className="modal-qty-selector">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(stock, qty + 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              )}

              <button
                type="button"
                className={`modal-submit-btn ${added ? 'added' : ''}`}
                onClick={handleAdd}
                disabled={isOutOfStock}
              >
                {added ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Cart • ₹{(Number(product.price) * qty).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
