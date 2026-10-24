import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShoppingBag,
  IndianRupee,
  Clock,
  Eye
} from 'lucide-react';
import { apiFetch } from '../../api';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCustomerDetails() {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch(`/api/admin/customers/${id}`);
        if (!res.ok) {
          throw new Error(`Customer #${id} not found (HTTP ${res.status})`);
        }
        const data = await res.json();
        setCustomer(data);
      } catch (err) {
        setError(err.message || 'Could not fetch customer details');
      } finally {
        setLoading(false);
      }
    }

    loadCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-loading-card">
          <div className="spinner-ring" />
          <p>Loading customer #{id} profile & history...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="admin-page-container">
        <div className="admin-error-box">
          <p>{error || 'Customer could not be found.'}</p>
          <Link to="/admin/customers" className="checkout-primary-btn" style={{ marginTop: '12px' }}>
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  const regDate = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const latestOrder = customer.mostRecentOrderDate
    ? new Date(customer.mostRecentOrderDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No orders placed yet';

  return (
    <div className="admin-page-container">
      {/* Header Bar */}
      <div className="admin-header-bar" style={{ marginBottom: '20px' }}>
        <Link to="/admin/customers" className="checkout-back-link">
          <ArrowLeft size={16} />
          <span>Back to All Customers</span>
        </Link>
      </div>

      {/* Customer Hero Banner */}
      <div className="admin-card customer-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="success-icon-badge" style={{ background: '#ECFDF5', width: '64px', height: '64px', margin: 0 }}>
            <User size={32} color="#15803D" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="admin-page-title font-serif" style={{ margin: 0 }}>
                {customer.name}
              </h1>
              <span className="customer-id-pill">ID #{customer.id}</span>
              <span className="status-pill placed">{customer.status || 'Active'}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
              Member registered on {regDate}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column: Profile & Stats */}
      <div className="admin-dashboard-two-col" style={{ marginTop: '20px' }}>
        {/* Profile Card */}
        <div className="admin-card">
          <h2 className="admin-card-title font-serif">Customer Profile</h2>

          <div className="order-customer-box" style={{ marginTop: '16px' }}>
            <div className="info-block">
              <span className="info-label">Customer ID</span>
              <strong>#{customer.id}</strong>
            </div>

            <div className="info-block">
              <span className="info-label">Full Name</span>
              <strong>{customer.name}</strong>
            </div>

            <div className="info-block">
              <span className="info-label">Email Address</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} color="#6B7280" />
                <span>{customer.email}</span>
              </div>
            </div>

            <div className="info-block">
              <span className="info-label">Phone Number</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#15803D" />
                <span>{customer.phone || 'Not recorded on account'}</span>
              </div>
            </div>

            <div className="info-block">
              <span className="info-label">Registration Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#6B7280" />
                <span>{regDate}</span>
              </div>
            </div>

            <div className="info-block">
              <span className="info-label">Account Role & Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#15803D" />
                <span>{customer.role || 'CUSTOMER'} • <strong>Active</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="admin-card">
          <h2 className="admin-card-title font-serif">Customer Lifetime Statistics</h2>

          <div className="customer-stats-box" style={{ marginTop: '16px' }}>
            <div className="cust-stat-row">
              <div className="cust-stat-icon emerald">
                <IndianRupee size={22} />
              </div>
              <div className="cust-stat-text">
                <span className="cust-stat-label">Total Spent</span>
                <strong className="cust-stat-val">₹{Number(customer.totalSpent || 0).toFixed(2)}</strong>
                <small className="cust-stat-note">
                  * Calculated strictly from active & delivered orders (excludes cancelled orders)
                </small>
              </div>
            </div>

            <div className="cust-stat-row">
              <div className="cust-stat-icon blue">
                <ShoppingBag size={22} />
              </div>
              <div className="cust-stat-text">
                <span className="cust-stat-label">Total Orders Placed</span>
                <strong className="cust-stat-val">{customer.totalOrders || 0}</strong>
              </div>
            </div>

            <div className="cust-stat-row">
              <div className="cust-stat-icon amber">
                <Clock size={22} />
              </div>
              <div className="cust-stat-text">
                <span className="cust-stat-label">Most Recent Order</span>
                <strong className="cust-stat-val" style={{ fontSize: '15px' }}>
                  {latestOrder}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order History Table */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <h2 className="admin-card-title font-serif">
          Order History ({customer.orders ? customer.orders.length : 0})
        </h2>

        {!customer.orders || customer.orders.length === 0 ? (
          <p className="admin-empty-text">This customer has not placed any orders yet.</p>
        ) : (
          <div className="admin-table-wrap" style={{ marginTop: '16px' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Purchased Items & Quantities</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((o) => {
                  const date = o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={o.id}>
                      <td>
                        <strong className="table-order-id">#{o.id}</strong>
                      </td>
                      <td className="table-date">{date}</td>
                      <td>
                        <div className="table-items-summary">
                          {o.items && o.items.length > 0 ? (
                            o.items.map((item, idx) => (
                              <div key={idx} className="table-item-chip">
                                {item.productName} <span className="chip-qty">×{item.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <span style={{ color: '#9CA3AF' }}>No item details</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong className="table-price">₹{Number(o.totalAmount).toFixed(2)}</strong>
                      </td>
                      <td>{o.paymentMethod || 'COD'}</td>
                      <td>
                        <span className={`status-pill ${o.status?.toLowerCase() || 'placed'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="admin-table-action-btn edit"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                          <span>View Order</span>
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
