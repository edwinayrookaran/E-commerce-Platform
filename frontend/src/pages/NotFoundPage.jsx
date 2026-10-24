import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ShoppingBag } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="section-container" style={{ padding: '80px 16px', maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
      <div className="checkout-card" style={{ padding: '48px 32px' }}>
        <div className="success-icon-badge" style={{ background: '#FEE2E2', margin: '0 auto 20px' }}>
          <AlertCircle size={44} color="#DC2626" />
        </div>
        <h1 className="font-serif" style={{ fontSize: '32px', margin: '0 0 12px 0', color: '#111827' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.6, margin: '0 0 28px 0' }}>
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="checkout-primary-btn">
            <Home size={18} />
            <span>Return Home</span>
          </Link>
          <Link to="/shop" className="checkout-secondary-btn">
            <ShoppingBag size={18} />
            <span>Browse Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
