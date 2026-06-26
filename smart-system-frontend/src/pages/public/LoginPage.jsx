import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await login(form);

    if (result.success) {
      const role = result.user?.role;
      toast.success(`Welcome back, ${result.user?.name || ''}!`);

      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/investor/dashboard', { replace: true });
      }
    }
    // Error is shown from store state — no need to toast here
  };

  return (
    <div className="auth-page">
      {/* ── LEFT BRAND PANEL ── */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo__icon">◆</span>
            Smart<b>System</b>
          </Link>
          <h2>Your wealth, professionally managed.</h2>
          <p>Join thousands of investors building financial freedom with Smart System Investment.</p>
          <div className="auth-trust-list">
            {[
              { icon:'🔒', text:'Bank-level security on all accounts'  },
              { icon:'📈', text:'Average 14% annual returns'            },
              { icon:'⚡', text:'Withdraw profits anytime'               },
              { icon:'🌍', text:'Investors in 256+ countries'            },
            ].map(t => (
              <div key={t.text} className="auth-trust-item">
                <span>{t.icon}</span> {t.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <FiShield size={32} className="auth-shield" />
            <h1>Investor Login</h1>
            <p>Sign in to access your investment portal</p>
          </div>

          {/* ERROR BANNER */}
          {error && (
            <div className="auth-error" style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem' }}>
              <FiAlertCircle size={16} style={{ flexShrink:0, marginTop:2 }} />
              <span>{error}</span>
            </div>
          )}

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
                  value={form.email}
                  onChange={e => {
                    clearError();
                    setForm(f => ({ ...f, email: e.target.value }));
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrap">
                <FiLock className="auth-input-icon" size={16} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-control auth-input"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => {
                    clearError();
                    setForm(f => ({ ...f, password: e.target.value }));
                  }}
                />
               <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                >
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:'100%', padding:'0.9rem', marginTop:'0.25rem' }}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ borderTopColor:'white' }} /> Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>

          {/* Debug helper — remove in production */}
          {import.meta.env.DEV && (
            <details style={{ marginTop:'2rem', fontSize:'0.75rem', color:'var(--gray-400)', background:'var(--gray-50)', padding:'0.75rem', borderRadius:'8px' }}>
              <summary style={{ cursor:'pointer', fontWeight:600 }}>🛠 Dev: Auth Debug</summary>
              <div style={{ marginTop:'0.5rem', lineHeight:1.8 }}>
                <div><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</div>
                <div><strong>CSRF Cookie:</strong> {document.cookie.includes('XSRF-TOKEN') ? '✅ Present' : '❌ Missing'}</div>
                <div><strong>Last error:</strong> {error || '—'}</div>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
