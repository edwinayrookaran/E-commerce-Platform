import React from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  Plus,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import '../Admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useShop();

  if (!currentUser || !isAdmin) {
    return (
      <div className="admin-auth-guard section-container" style={{ padding: '80px 16px', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div className="checkout-card" style={{ padding: '40px 24px' }}>
          <div className="success-icon-badge" style={{ background: '#FEE2E2', margin: '0 auto 16px' }}>
            <ShieldAlert size={44} color="#DC2626" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#111827' }}>
            Administrator Access Required
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            You must be logged in as an administrator to access the Fudcy Foods Admin Dashboard and management tools.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              className="checkout-primary-btn"
            >
              Sign In as Administrator
            </Link>
            <Link to="/" className="checkout-secondary-btn">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-shell-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand-link">
            <img src="/images/brand/logo.png" alt="Fudcy Foods" className="admin-brand-logo" />
            <div className="admin-brand-text">
              <span className="brand-name">FUDCY FOODS</span>
              <span className="admin-portal-tag">ADMIN PORTAL</span>
            </div>
          </Link>
        </div>

        <nav className="admin-nav-menu" aria-label="Admin Navigation">
          <div className="nav-group-label">OVERVIEW</div>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <div className="nav-group-label">COMMERCE</div>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Package size={19} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={19} />
            <span>Orders</span>
          </NavLink>

          <div className="nav-group-label">PEOPLE</div>
          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={19} />
            <span>Customers</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="sidebar-store-link">
            <Store size={17} />
            <span>View Public Store</span>
          </Link>

          <div className="admin-user-profile-badge">
            <div className="admin-avatar">
              <ShieldCheck size={18} color="#15803D" />
            </div>
            <div className="admin-user-info">
              <span className="admin-name">{currentUser.name}</span>
              <span className="admin-email">{currentUser.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Log out of admin session"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <div className="admin-topbar-breadcrumb">
            <Link to="/admin">Admin</Link>
            <ChevronRight size={14} className="crumb-arrow" />
            <span className="current-crumb">
              {location.pathname === '/admin' && 'Dashboard'}
              {location.pathname === '/admin/products' && 'Product Catalogue'}
              {location.pathname === '/admin/products/new' && 'Add New Product'}
              {location.pathname.includes('/edit') && 'Edit Product'}
              {location.pathname === '/admin/orders' && 'Order Management'}
              {location.pathname.startsWith('/admin/orders/') && 'Order Details'}
              {location.pathname === '/admin/customers' && 'Registered Customers'}
              {location.pathname.startsWith('/admin/customers/') && 'Customer Profile'}
            </span>
          </div>

          <div className="admin-topbar-actions">
            <Link to="/admin/products/new" className="admin-quick-add-btn">
              <Plus size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        </header>

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
