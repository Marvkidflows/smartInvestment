import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShield, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api'; // adjust path to match your axios instance
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/forgot-password', { email });
      // Always show success — backend never reveals whether email exists
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo__icon">◆</span>
            Smart<b>System</b>
          </Link>
          <h2>Your wealth, professionally managed.</h2>
          <p>Join thousands of investors building financial freedom with Smart System Investment.</p>
        </div>
      </div>

      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <FiShield size={32} className="auth-shield" />
            <h1>Forgot Password</h1>
            <p>Enter your email and we'll send you a reset link</p>
          </div>

          {error && (
            <div className="auth-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div
              className="auth-success"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}
            >
              <FiCheckCircle size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--success, #16a34a)' }} />
              <div>
                <strong>Check your inbox</strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                  If an account exists for <b>{email}</b>, a password reset link has been sent.
                  It will expire shortly, so use it soon.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="auth-input-wrap">
                  <FiMail className="auth-input-icon" size={16} />
                  <input
                    type="email"
                    className="form-control auth-input"
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', marginTop: '0.25rem' }}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
                  : 'Send Reset Link'
                }
              </button>
            </form>
          )}

          <p className="auth-switch">
            Remembered your password? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}