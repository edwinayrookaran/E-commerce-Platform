import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api';
import { useShop } from '../context/ShopContext';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const navigate = useNavigate();
  const { login } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        let msg = 'Registration failed.';
        try {
          const json = await res.json();
          if (json?.message) msg = json.message;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      login(data);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section-container" style={{ padding: '48px 16px', maxWidth: '480px', margin: '0 auto' }}>
      <div className="checkout-card" style={{ padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="success-icon-badge" style={{ background: '#ECFDF5', width: '64px', height: '64px', margin: '0 auto 16px' }}>
            <UserPlus size={30} color="#15803D" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#111827' }}>
            Create an Account
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Join Fudcy Foods to track orders, save addresses & get member updates
          </p>
        </div>

        {error && (
          <div className="checkout-error-banner" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="checkout-field-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="regName">Full Name *</label>
            <input
              id="regName"
              type="text"
              placeholder="e.g. Anand Krishna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <div className="checkout-field-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="regEmail">Email Address *</label>
            <input
              id="regEmail"
              type="email"
              placeholder="e.g. anand@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <div className="checkout-field-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="regPassword">Password (6+ characters) *</label>
            <input
              id="regPassword"
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <button
            type="submit"
            className="checkout-primary-btn"
            disabled={submitting}
            style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} style={{ color: '#15803D', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
