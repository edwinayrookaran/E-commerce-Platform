import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function loadCustomers(query = search) {
    setLoading(true);
    setError('');
    try {
      const url = query && query.trim()
        ? `/api/admin/customers?search=${encodeURIComponent(query.trim())}`
        : '/api/admin/customers';

      const res = await apiFetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load customer list (HTTP ${res.status})`);
      }
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Could not load registered customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers(search);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadCustomers(search);
  }

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-title font-serif">Registered Customer Management</h1>
          <p className="admin-page-subtitle">
            Directory of registered member accounts, lifetime order metrics, and individual profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadCustomers(search)}
          className="admin-refresh-pill"
          title="Refresh customer accounts"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="admin-error-box" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-card toolbar-card">
        <form onSubmit={handleSearchSubmit} className="admin-order-search-form">
          <div className="catalog-search-box" style={{ maxWidth: '440px', flex: 1 }}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search by customer name, email, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="checkout-primary-btn sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="admin-table-action-btn"
              onClick={() => {
                setSearch('');
                loadCustomers('');
              }}
            >
              Clear
            </button>
          )}
        </form>

        <span style={{ fontSize: '14px', color: '#6B7280' }}>
          Showing <strong>{customers.length}</strong> customer {customers.length === 1 ? 'account' : 'accounts'}
        </span>
      </div>

      {/* Customers Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading-card">
            <div className="spinner-ring" />
            <p>Loading registered customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={48} color="#9CA3AF" />
            <h3 className="font-serif">No customers found</h3>
            <p>No registered customer accounts match your search filter.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Registration Date</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const regDate = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={c.id}>
                      <td>
                        <strong className="table-order-id">#{c.id}</strong>
                      </td>
                      <td>
                        <strong className="table-cust-name">{c.name}</strong>
                        {c.role === 'ADMIN' && (
                          <span className="stock-badge-pill warning" style={{ marginLeft: '6px', fontSize: '11px' }}>
                            Admin
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="table-cust-email">{c.email}</span>
                      </td>
                      <td>
                        <span className="table-phone">{c.phone || '—'}</span>
                      </td>
                      <td className="table-date">{regDate}</td>
                      <td>
                        <span className="table-order-count">{c.orderCount || 0}</span>
                      </td>
                      <td>
                        <strong className="table-price">
                          ₹{Number(c.totalSpent || 0).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className="status-pill placed">Active</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/customers/${c.id}`}
                          className="admin-table-action-btn edit"
                          title="View Customer Profile & History"
                        >
                          <Eye size={15} />
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
