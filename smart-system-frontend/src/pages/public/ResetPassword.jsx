import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api'; // adjust path to match your axios instance
import './AuthPages.css';

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', color: '#dc2626', pct: 25 };
  if (score <= 2) return { label: 'Fair', color: '#f59e0b', pct: 50 };
  if (score <= 3) return { label: 'Good', color: '#3b82f6', pct: 75 };
  return { label: 'Strong', color: '#16a34a', pct: 100 };
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword]               = useState('');
  const [passwordConfirm, setPasswordConfirm]  = useState('');
  const [showPw, setShowPw]                    = useState(false);
  const [showPwConfirm, setShowPwConfirm]      = useState(false);
  const [loading, setLoading]                  = useState(false);
  const [error, setError]                      = useState('');
  const [success, setSuccess]                  = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);
  const missingLink = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (missingLink) {
      setError('This reset link is invalid or incomplete. Please request a new one.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirm,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Unable to reset password. The link may have expired.');
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
            <h1>Reset Password</h1>
            <p>Choose a new password for your account</p>
          </div>

          {error && (
            <div className="auth-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div
              className="auth-success"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '8px' }}
            >
              <FiCheckCircle size={18} style={{ flexShrink: 0, marginTop: 2, color: '#16a34a' }} />
              <div>
                <strong>Password reset successful</strong>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                  Redirecting you to login…
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="auth-input-wrap">
                  <FiLock className="auth-input-icon" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-control auth-input"
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>

                {password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: 4, borderRadius: 4, background: 'var(--gray-100, #eee)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${strength.pct}%`,
                          background: strength.color,
                          transition: 'width 0.2s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <FiLock className="auth-input-icon" size={16} />
                  <input
                    type={showPwConfirm ? 'text' : 'password'}
                    className="form-control auth-input"
                    placeholder="Confirm new password"
                    required
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPwConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPwConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', marginTop: '0.25rem' }}
                disabled={loading || missingLink}
              >
                {loading
                  ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Resetting…</>
                  : 'Reset Password'
                }
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}