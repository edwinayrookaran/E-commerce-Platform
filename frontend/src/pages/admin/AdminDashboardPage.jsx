import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { apiFetch } from '../../api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboardStats() {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/admin/stats');
      if (!res.ok) {
        throw new Error(`Failed to load admin statistics (HTTP ${res.status})`);
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Could not fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading-card">
          <div className="spinner-ring" />
          <p>Calculating live statistics from database...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-page-container">
        <div className="admin-error-box">
          <p>{error || 'Unable to load dashboard data.'}</p>
          <button type="button" onClick={loadDashboardStats} className="admin-retry-btn">
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    totalProducts = 0,
    totalOrders = 0,
    registeredCustomers = 0,
    totalSales = 0,
    statusCounts = {},
    lowStockCount = 0,
    lowStockProducts = [],
    recentOrders = []
  } = stats;

  return (
    <div className="admin-page-container">
      {/* Top Banner */}
      <div className="admin-dashboard-hero">
        <div>
          <h1 className="admin-page-title font-serif">Operations Dashboard</h1>
          <p className="admin-page-subtitle">
            Real-time overview of catalogue products, order fulfillment, and registered customers.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDashboardStats}
          className="admin-refresh-pill"
          title="Refresh statistics"
        >
          <RefreshCw size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-icon emerald">
            <IndianRupee size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Net Sales Volume</span>
            <h2 className="stat-value font-serif">₹{Number(totalSales).toFixed(2)}</h2>
            <span className="stat-rule-note">
              Calculated from all fulfilled & active orders (excluding cancelled)
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon blue">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Total Orders</span>
            <h2 className="stat-value font-serif">{totalOrders}</h2>
            <Link to="/admin/orders" className="stat-link">
              <span>Manage orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon amber">
            <Package size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Catalogue Products</span>
            <h2 className="stat-value font-serif">{totalProducts}</h2>
            <Link to="/admin/products" className="stat-link">
              <span>View products</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon purple">
            <Users size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Registered Customers</span>
            <h2 className="stat-value font-serif">{registeredCustomers}</h2>
            <Link to="/admin/customers" className="stat-link">
              <span>View customer list</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Fulfillment Status Pipeline */}
      <div className="admin-card fulfillment-pipeline-card">
        <h3 className="admin-card-title font-serif">Order Fulfillment Pipeline</h3>
        <div className="pipeline-chips-row">
          <div className="pipeline-chip placed">
            <span className="chip-count">{statusCounts.PLACED || 0}</span>
            <span className="chip-label">Placed</span>
          </div>
          <div className="pipeline-chip confirmed">
            <span className="chip-count">{statusCounts.CONFIRMED || 0}</span>
            <span className="chip-label">Confirmed</span>
          </div>
          <div className="pipeline-chip preparing">
            <span className="chip-count">{statusCounts.PREPARING || 0}</span>
            <span className="chip-label">Preparing</span>
          </div>
          <div className="pipeline-chip shipped">
            <span className="chip-count">{statusCounts.SHIPPED || 0}</span>
            <span className="chip-label">Dispatched</span>
          </div>
          <div className="pipeline-chip delivered">
            <span className="chip-count">{statusCounts.DELIVERED || 0}</span>
            <span className="chip-label">Delivered</span>
          </div>
          <div className="pipeline-chip cancelled">
            <span className="chip-count">{statusCounts.CANCELLED || 0}</span>
            <span className="chip-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Alert & Recent Orders */}
      <div className="admin-dashboard-two-col">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header-row">
            <h3 className="admin-card-title font-serif">Recent Orders</h3>
            <Link to="/admin/orders" className="admin-card-action-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="admin-empty-text">No orders placed yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>#{o.id}</strong>
                      </td>
                      <td>
                        <span className="table-cust-name">{o.customerName || 'Guest'}</span>
                        {o.email && <small className="table-cust-email">{o.email}</small>}
                      </td>
                      <td>
                        <strong className="table-price">₹{Number(o.totalAmount).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${o.status?.toLowerCase() || 'placed'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="table-date">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/admin/orders/${o.id}`} className="admin-table-action-btn" title="View Order">
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-card">
          <div className="admin-card-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#D97706" />
              <h3 className="admin-card-title font-serif">Inventory Stock Watch</h3>
            </div>
            <span className={`stock-badge-pill ${lowStockCount > 0 ? 'warning' : 'healthy'}`}>
              {lowStockCount > 0 ? `${lowStockCount} Need Restock` : 'Healthy Inventory'}
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="inventory-healthy-box">
              <CheckCircle2 size={32} color="#15803D" />
              <p>All active products have adequate stock quantity (&gt; 10 units).</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <span className="stock-alert-critical">
                          {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} remaining`}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/admin/products/${p.id}/edit`} className="admin-table-action-btn edit" title="Edit stock">
                          Update
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
