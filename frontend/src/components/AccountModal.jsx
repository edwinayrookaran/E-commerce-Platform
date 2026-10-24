import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle, LogOut, ArrowRight, Package } from 'lucide-react';

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onGoToOrders
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validations
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'register' && !formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    const endpoint = mode === 'register'
      ? 'http://localhost:8080/api/auth/register'
      : 'http://localhost:8080/api/auth/login';

    const payload = mode === 'register'
      ? { name: formData.name.trim(), email: formData.email.trim(), password: formData.password }
      : { email: formData.email.trim(), password: formData.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid email or password.');
        if (res.status === 409) throw new Error('An account with this email already exists.');
        const text = await res.text();
        throw new Error(text || 'Authentication request failed.');
      }

      const userData = await res.json();
      setSuccessMsg(mode === 'register' ? 'Account created successfully!' : 'Signed in successfully!');
      
      setTimeout(() => {
        onLoginSuccess(userData);
        setFormData({ name: '', email: '', password: '' });
      }, 700);

    } catch (err) {
      setError(err.message || 'Could not connect to authentication service.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div
        className="account-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Customer Account"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {currentUser ? (
          /* Logged In View */
          <div className="account-profile-view">
            <div className="profile-avatar-wrap">
              <User size={36} color="#0A0A0A" />
            </div>

            <span className="profile-badge">VERIFIED ACCOUNT</span>
            <h2 className="profile-name font-serif">{currentUser.name}</h2>
            <p className="profile-email">{currentUser.email}</p>

            <div className="profile-info-box">
              <div className="profile-info-row">
                <span>Customer ID</span>
                <strong>#{currentUser.id}</strong>
              </div>
              <div className="profile-info-row">
                <span>Account Created</span>
                <strong>
                  {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active Member'}
                </strong>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-cta-btn"
                onClick={() => {
                  onClose();
                  onGoToOrders();
                }}
              >
                <Package size={17} />
                <span>View My Orders</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="profile-logout-btn"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <div className="account-form-wrap">
            <div className="account-header text-center">
              <div className="account-icon-box">
                <User size={24} color="#0A0A0A" />
              </div>
              <h2 className="account-title font-serif">
                {mode === 'login' ? 'WELCOME BACK' : 'CREATE AN ACCOUNT'}
              </h2>
              <p className="account-sub">
                {mode === 'login'
                  ? 'Access your saved addresses and track your Kerala meals.'
                  : 'Join Fudcy Foods for seamless ordering and real-time tracking.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="account-tabs">
              <button
                type="button"
                className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="account-alert error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="account-alert success">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="account-form">
              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="acc-name">Full Name</label>
                  <div className="input-wrap">
                    <User size={17} className="input-icon" />
                    <input
                      id="acc-name"
                      type="text"
                      name="name"
                      placeholder="e.g. Sandra Thomas"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="acc-email">Email Address</label>
                <div className="input-wrap">
                  <Mail size={17} className="input-icon" />
                  <input
                    id="acc-email"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="acc-password">Password</label>
                <div className="input-wrap">
                  <Lock size={17} className="input-icon" />
                  <input
                    id="acc-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="account-submit-btn"
                disabled={loading}
              >
                {loading
                  ? (mode === 'register' ? 'Creating Account...' : 'Signing In...')
                  : (mode === 'register' ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="account-footer-switch">
              {mode === 'login' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    className="switch-link"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="switch-link"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
