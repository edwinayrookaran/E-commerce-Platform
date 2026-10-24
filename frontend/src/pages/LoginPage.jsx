import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api';
import { useShop } from '../context/ShopContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const navigate = useNavigate();
  const { login } = useShop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        let msg = 'Invalid email or password.';
        try {
          const json = await res.json();
          if (json?.message) msg = json.message;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      login(data);

      if (data?.user?.role === 'ADMIN' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section-container" style={{ padding: '48px 16px', maxWidth: '460px', margin: '0 auto' }}>
      <div className="checkout-card" style={{ padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="success-icon-badge" style={{ background: '#ECFDF5', width: '64px', height: '64px', margin: '0 auto 16px' }}>
            <LogIn size={30} color="#15803D" />
          </div>
          <h1 className="font-serif" style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#111827' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Sign in to view your orders and manage your account
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
            <label htmlFor="loginEmail">Email Address</label>
            <input
              id="loginEmail"
              type="email"
              placeholder="e.g. anand@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <div className="checkout-field-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
          </div>

          <button
            type="submit"
            className="checkout-primary-btn"
            disabled={submitting}
            style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
          Don't have an account yet?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} style={{ color: '#15803D', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
