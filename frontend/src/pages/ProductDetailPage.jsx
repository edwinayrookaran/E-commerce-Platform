import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../api';
import { enrichProduct } from '../catalogHelper';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { cart, addToCart, products, setQuickViewProduct } = useShop();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('front');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id || isNaN(Number(id))) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/api/products/${id}`);
        if (res.status === 404) {
          throw new Error('This product is no longer available or does not exist.');
        }
        if (!res.ok) {
          throw new Error(`Unable to load product (HTTP ${res.status})`);
        }
        const data = await res.json();
        setProduct(enrichProduct(data));
        setQuantity(1);
        setSelectedImage('front');
      } catch (err) {
        setError(err.message || 'Could not fetch product details');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page section-container">
        <div className="product-loading-container">
          <div className="spinner-ring" />
          <p>Loading meal details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page section-container">
        <div className="product-error-container">
          <AlertCircle size={48} color="#DC2626" />
          <h2 className="font-serif">Product Not Found</h2>
          <p>{error || 'The requested product could not be found.'}</p>
          <div className="error-actions">
            <Link to="/shop" className="checkout-primary-btn">
              Browse Menu Catalogue
            </Link>
            <Link to="/" className="checkout-secondary-btn">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stock = Number(product.stockQuantity) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const cartItem = cart.find((i) => i.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock || quantity <= 0) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const currentImg =
    selectedImage === 'front' || !product.hoverImage
      ? product.image
      : product.hoverImage;

  // Related products from the same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="product-detail-page">
      <div className="section-container">
        {/* Breadcrumb Navigation */}
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link to="/shop">Shop</Link>
          <span className="crumb-sep">/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category || 'All')}`}>
            {product.category}
          </Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="product-detail-grid">
          {/* Gallery Column */}
          <div className="product-detail-gallery">
            <div className="product-detail-main-img-wrap">
              <img
                src={currentImg}
                alt={product.name}
                className="product-detail-main-img"
                onError={(e) => {
                  e.target.src = '/images/brand/logo.png';
                }}
              />
              {product.discount && (
                <span className="product-detail-discount-badge">{product.discount}</span>
              )}
              {product.badge && (
                <span className="product-detail-special-badge">{product.badge}</span>
              )}
            </div>

            {product.hoverImage && (
              <div className="product-detail-thumbs">
                <button
                  type="button"
                  className={`detail-thumb-btn ${selectedImage === 'front' ? 'active' : ''}`}
                  onClick={() => setSelectedImage('front')}
                >
                  <img src={product.image} alt="Front View" />
                  <span>Front View</span>
                </button>
                <button
                  type="button"
                  className={`detail-thumb-btn ${selectedImage === 'back' ? 'active' : ''}`}
                  onClick={() => setSelectedImage('back')}
                >
                  <img src={product.hoverImage} alt="Nutrition & Back View" />
                  <span>Nutrition & Details</span>
                </button>
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="product-detail-info">
            <div className="detail-tags-row">
              <span className="detail-cat-pill">{product.category}</span>
              {product.packageWeight && (
                <span className="detail-weight-pill">{product.packageWeight}</span>
              )}
              <span className={`detail-stock-pill ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
                {isOutOfStock ? 'Sold Out' : isLowStock ? `Only ${stock} left in stock` : `In Stock (${stock} available)`}
              </span>
            </div>

            <h1 className="product-detail-title font-serif">{product.name}</h1>

            <div className="product-detail-price-box">
              <span className="price-tag-currency">₹</span>
              <span className="price-tag-amount">{Number(product.price).toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <del className="price-tag-original">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </del>
              )}
              <span className="price-tax-note">Inclusive of all taxes</span>
            </div>

            <div className="product-detail-desc">
              <p>{product.description}</p>
            </div>

            {/* Quantity Selector and CTA */}
            <div className="product-detail-actions">
              <div className="detail-qty-group">
                <label className="qty-label">Quantity</label>
                <div className="detail-qty-picker">
                  <button
                    type="button"
                    className="detail-qty-btn"
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="detail-qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="detail-qty-btn"
                    onClick={handleIncrement}
                    disabled={quantity >= stock || isOutOfStock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`detail-add-cart-btn ${justAdded ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {justAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Currently Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Cart • ₹{(Number(product.price) * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            {inCartQty > 0 && (
              <p className="cart-feedback-note">
                You already have <strong>{inCartQty}</strong> of this item in your shopping cart.
              </p>
            )}

            {/* Quality & Retort Assurances */}
            <div className="product-detail-promises">
              <div className="promise-item">
                <ShieldCheck size={20} color="#15803D" />
                <div>
                  <strong>No Refrigeration Required</strong>
                  <p>Sterilised & hermetically sealed retort pouch. Store at room temperature.</p>
                </div>
              </div>
              <div className="promise-item">
                <Clock size={20} color="#D97706" />
                <div>
                  <strong>Ready in 3–5 Minutes</strong>
                  <p>Immerse boiling pouch in water, microwave bowl, or pan-heat.</p>
                </div>
              </div>
              <div className="promise-item">
                <Sparkles size={20} color="#059669" />
                <div>
                  <strong>100% Traditional Recipe</strong>
                  <p>Authentic Kerala spices, coconut milk, and zero chemical preservatives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <h2 className="related-title font-serif">You May Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={addToCart}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                  cartItem={cart.find((i) => i.id === p.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
