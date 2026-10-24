import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, ShoppingBag, LogOut, ShieldCheck, Mail, Calendar, Shield } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function AccountPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useShop();

  if (!currentUser) {
    return (
      <div className="section-container" style={{ padding: '60px 16px', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div className="checkout-card" style={{ padding: '40px 24px' }}>
          <div className="success-icon-badge" style={{ background: '#F3F4F6', margin: '0 auto 16px' }}>
            <User size={36} color="#6B7280" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '24px', marginBottom: '8px' }}>Customer Account</h1>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Please sign in to access your personal profile, delivery addresses, and order history.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/login?redirect=/account" className="checkout-primary-btn">
              Sign In
            </Link>
            <Link to="/register?redirect=/account" className="checkout-secondary-btn">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const memberDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Active Member';

  return (
    <div className="section-container" style={{ padding: '48px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="checkout-header-bar" style={{ marginBottom: '24px' }}>
        <h1 className="font-serif" style={{ fontSize: '28px', margin: 0 }}>My Account</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div className="checkout-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div className="success-icon-badge" style={{ background: '#ECFDF5', width: '56px', height: '56px', margin: 0 }}>
              <User size={28} color="#15803D" />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: '20px', margin: '0 0 4px 0' }}>{currentUser.name}</h2>
              <span className="status-pill placed">{currentUser.role || 'CUSTOMER'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#4B5563' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="#6B7280" />
              <span>{currentUser.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="#6B7280" />
              <span>Member since: {memberDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={16} color="#15803D" />
              <span>Account Status: <strong>Active</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            style={{
              marginTop: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#FEE2E2',
              color: '#DC2626',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Quick Shortcuts Card */}
        <div className="checkout-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="font-serif" style={{ fontSize: '18px', margin: '0 0 16px 0' }}>Account Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/my-orders"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#1F2937',
                  border: '1px solid #E5E7EB',
                  fontWeight: 500
                }}
              >
                <Package size={20} color="#15803D" />
                <div>
                  <strong style={{ display: 'block', fontSize: '15px' }}>My Orders</strong>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>View recent orders and live tracking status</span>
                </div>
              </Link>

              <Link
                to="/cart"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#1F2937',
                  border: '1px solid #E5E7EB',
                  fontWeight: 500
                }}
              >
                <ShoppingBag size={20} color="#15803D" />
                <div>
                  <strong style={{ display: 'block', fontSize: '15px' }}>Shopping Cart</strong>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>Review items currently queued for checkout</span>
                </div>
              </Link>

              {currentUser.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: '#FEF3C7',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    fontWeight: 600
                  }}
                >
                  <Shield size={20} color="#D97706" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '15px' }}>Admin Dashboard</strong>
                    <span style={{ fontSize: '13px', color: '#B45309' }}>Access product, order & customer management</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <Link to="/shop" className="checkout-primary-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Explore Ready-to-Eat Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
