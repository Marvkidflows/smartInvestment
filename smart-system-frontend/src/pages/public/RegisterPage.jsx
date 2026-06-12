import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCheck, FiShield, FiAlertCircle } from 'react-icons/fi';
import { authService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import './AuthPages.css';

const STAGES = [
  { n:1, label:'Account'        },
  { n:2, label:'Personal Info'  },
  { n:3, label:'Investor Profile' },
  { n:4, label:'Security'       },
];

function extractErrors(err) {
  const data = err.response?.data;
  if (!data) return `Network error — is the server running?`;
  if (data.message) return data.message;
  if (data.errors) {
    // Return the first validation error message
    const first = Object.values(data.errors)[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  return `Error ${err.response?.status || ''}`;
}

export default function RegisterPage() {
  const [stage, setStage]         = useState(1);
  const [loading, setLoading]     = useState(false);
  const [stageError, setStageError] = useState('');
  const [searchParams]            = useSearchParams();
  const { setUser }               = useAuthStore();
  const navigate                  = useNavigate();

  const [form, setForm] = useState({
    // Stage 1 — Account
    full_name: '', email: '', country_code: '', phone: '', country: '',
    password: '', password_confirmation: '',
    referral_code: searchParams.get('ref') || '',

    // Stage 2 — Personal / KYC
    date_of_birth: '', residential_address: '', city: '', state: '', postal_code: '',

    // Stage 3 — Investor Profile
    employment_status: '', annual_income_range: '', source_of_funds: '',
    investment_experience: '', risk_tolerance: '', investment_objectives: '',

    // Stage 4 — Security
    withdrawal_pin: '', withdrawal_pin_confirmation: '',
  });

  const update = (key, val) => {
    setStageError('');
    setForm(f => ({ ...f, [key]: val }));
  };

  const submitStage = async () => {
    setLoading(true);
    setStageError('');

    try {
      // Always refresh CSRF before any POST
      await authService.getCsrf();

      if (stage === 1) {
        await authService.registerStage1({
          full_name:             form.full_name,
          email:                 form.email,
          country_code:          form.country_code || undefined,
          phone:                 form.phone,
          country:               form.country,
          password:              form.password,
          password_confirmation: form.password_confirmation,
          referral_code:         form.referral_code || undefined,
        });
        setStage(2);

      } else if (stage === 2) {
        await authService.registerStage2({
          date_of_birth:        form.date_of_birth,
          residential_address:  form.residential_address,
          city:                 form.city,
          state:                form.state || undefined,
          postal_code:          form.postal_code || undefined,
        });
        setStage(3);

      } else if (stage === 3) {
        await authService.registerStage3({
          employment_status:     form.employment_status,
          annual_income_range:   form.annual_income_range,
          source_of_funds:       form.source_of_funds,
          investment_experience: form.investment_experience,
          risk_tolerance:        form.risk_tolerance,
          investment_objectives: form.investment_objectives || undefined,
        });
        setStage(4);

      } else if (stage === 4) {
        const payload = {};
        if (form.withdrawal_pin) {
          payload.withdrawal_pin = form.withdrawal_pin;
          payload.withdrawal_pin_confirmation = form.withdrawal_pin_confirmation;
        }

        const res = await authService.registerStage4(payload);

        // After stage 4, user should be logged in
        const user = res.data?.user || res.data;
        if (user?.id) {
          setUser({ ...user, role: user.role || 'investor' });
        }

        toast.success('Account created! Welcome to Smart System.');
        navigate('/investor/dashboard', { replace: true });
      }

    } catch (err) {
      const msg = extractErrors(err);
      setStageError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation before hitting API
    if (stage === 1) {
      if (form.password.length < 8) {
        setStageError('Password must be at least 8 characters.');
        return;
      }
      if (form.password !== form.password_confirmation) {
        setStageError('Passwords do not match.');
        return;
      }
    }

    if (stage === 4 && form.withdrawal_pin) {
      if (!/^\d{4}$/.test(form.withdrawal_pin)) {
        setStageError('Withdrawal PIN must be exactly 4 digits.');
        return;
      }
      if (form.withdrawal_pin !== form.withdrawal_pin_confirmation) {
        setStageError('Withdrawal PINs do not match.');
        return;
      }
    }

    submitStage();
  };

  return (
    <div className="auth-page">
      {/* ── LEFT ── */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo__icon">◆</span>
            Smart<b>System</b>
          </Link>
          <h2>Start building wealth today.</h2>
          <p>Complete registration in 4 simple steps and join thousands of successful investors.</p>

          <div className="reg-stages">
            {STAGES.map(s => (
              <div key={s.n} className={`reg-stage ${s.n < stage ? 'done' : s.n === stage ? 'active' : ''}`}>
                <div className="reg-stage__num">
                  {s.n < stage ? <FiCheck size={13} /> : s.n}
                </div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <FiShield size={32} className="auth-shield" />
            <h1>Create Account</h1>
            <p>Step {stage} of 4 — {STAGES[stage - 1].label}</p>
          </div>

          {/* PROGRESS BAR */}
          <div className="stage-progress">
            <div className="stage-progress__bar" style={{ width:`${(stage / 4) * 100}%` }} />
          </div>

          {/* ERROR BANNER */}
          {stageError && (
            <div className="auth-error" style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', marginBottom:'1.25rem' }}>
              <FiAlertCircle size={16} style={{ flexShrink:0, marginTop:2 }} />
              <span>{stageError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* ── STAGE 1 — Account ── */}
            {stage === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="auth-input-wrap">
                    <FiUser className="auth-input-icon" size={15} />
                    <input className="form-control auth-input" placeholder="John Doe" required
                      value={form.full_name} onChange={e => update('full_name', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <FiMail className="auth-input-icon" size={15} />
                    <input type="email" className="form-control auth-input"
                      placeholder="your@email.com" required autoComplete="email"
                      value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Country Code</label>
                    <input className="form-control" placeholder="+1"
                      value={form.country_code} onChange={e => update('country_code', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="auth-input-wrap">
                      <FiPhone className="auth-input-icon" size={15} />
                      <input className="form-control auth-input" placeholder="234 567 8900" required
                        value={form.phone} onChange={e => update('phone', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <div className="auth-input-wrap">
                    <FiMapPin className="auth-input-icon" size={15} />
                    <input className="form-control auth-input" placeholder="United States" required
                      value={form.country} onChange={e => update('country', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="auth-input-wrap">
                    <FiLock className="auth-input-icon" size={15} />
                    <input type="password" className="form-control auth-input"
                      placeholder="Min. 8 characters" required minLength={8}
                      autoComplete="new-password"
                      value={form.password} onChange={e => update('password', e.target.value)} />
                  </div>
                  {/* Password strength indicator */}
                  {form.password.length > 0 && (
                    <div style={{ marginTop:'0.4rem' }}>
                      <div style={{ height:4, background:'var(--gray-200)', borderRadius:999, overflow:'hidden' }}>
                        <div style={{
                          height:'100%', borderRadius:999, transition:'all 0.3s',
                          width: form.password.length < 6 ? '25%' : form.password.length < 8 ? '50%' : form.password.length < 12 ? '75%' : '100%',
                          background: form.password.length < 6 ? 'var(--danger)' : form.password.length < 8 ? 'var(--warning)' : form.password.length < 12 ? 'var(--info)' : 'var(--success)',
                        }} />
                      </div>
                      <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>
                        {form.password.length < 6 ? 'Too weak' : form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Good' : 'Strong'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <FiLock className="auth-input-icon" size={15} />
                    <input type="password" className="form-control auth-input"
                      placeholder="Repeat password" required autoComplete="new-password"
                      value={form.password_confirmation}
                      onChange={e => update('password_confirmation', e.target.value)} />
                  </div>
                  {form.password_confirmation.length > 0 && form.password !== form.password_confirmation && (
                    <div className="form-error">Passwords do not match</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Referral Code{' '}
                    <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span>
                  </label>
                  <input className="form-control" placeholder="e.g. REF123456"
                    value={form.referral_code}
                    onChange={e => update('referral_code', e.target.value)} />
                </div>
              </>
            )}

            {/* ── STAGE 2 — Personal Info / KYC ── */}
            {stage === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" required
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} />
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>
                    You must be at least 18 years old.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <div className="auth-input-wrap">
                    <FiMapPin className="auth-input-icon" size={15} />
                    <input className="form-control auth-input" placeholder="123 Main Street" required
                      value={form.residential_address} onChange={e => update('residential_address', e.target.value)} />
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-control" placeholder="New York" required
                      value={form.city} onChange={e => update('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      State / Province{' '}
                      <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span>
                    </label>
                    <input className="form-control" placeholder="NY"
                      value={form.state} onChange={e => update('state', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Postal Code{' '}
                    <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span>
                  </label>
                  <input className="form-control" placeholder="10001"
                    value={form.postal_code} onChange={e => update('postal_code', e.target.value)} />
                </div>
              </>
            )}

            {/* ── STAGE 3 — Investor Profile ── */}
            {stage === 3 && (
              <>
                <div className="form-group">
                  <label className="form-label">Employment Status</label>
                  <select className="form-control" required
                    value={form.employment_status}
                    onChange={e => update('employment_status', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Income Range</label>
                  <select className="form-control" required
                    value={form.annual_income_range}
                    onChange={e => update('annual_income_range', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="under_25000">Under $25,000</option>
                    <option value="25000_50000">$25,000 – $50,000</option>
                    <option value="50000_100000">$50,000 – $100,000</option>
                    <option value="100000_250000">$100,000 – $250,000</option>
                    <option value="over_250000">Over $250,000</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Source of Funds</label>
                  <select className="form-control" required
                    value={form.source_of_funds}
                    onChange={e => update('source_of_funds', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="salary">Salary / Employment Income</option>
                    <option value="business_income">Business Income</option>
                    <option value="savings">Savings</option>
                    <option value="investments">Investments</option>
                    <option value="inheritance">Inheritance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Investment Experience</label>
                  <select className="form-control" required
                    value={form.investment_experience}
                    onChange={e => update('investment_experience', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="none">None</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced / Professional</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Risk Tolerance</label>
                  <select className="form-control" required
                    value={form.risk_tolerance}
                    onChange={e => update('risk_tolerance', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Investment Objectives{' '}
                    <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span>
                  </label>
                  <textarea className="form-control" rows={3}
                    placeholder="e.g. Long-term growth, retirement planning…"
                    value={form.investment_objectives}
                    onChange={e => update('investment_objectives', e.target.value)} />
                </div>
              </>
            )}

            {/* ── STAGE 4 — Security ── */}
            {stage === 4 && (
              <>
                <div className="reg-success-banner">
                  <div>🎉</div>
                  <div>
                    <strong>Almost there!</strong>
                    <p>Optionally set a 4-digit withdrawal PIN to secure future withdrawals.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Withdrawal PIN{' '}
                    <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional, 4 digits)</span>
                  </label>
                  <div className="auth-input-wrap">
                    <FiLock className="auth-input-icon" size={15} />
                    <input type="password" inputMode="numeric" maxLength={4}
                      className="form-control auth-input" placeholder="••••"
                      autoComplete="off"
                      value={form.withdrawal_pin}
                      onChange={e => update('withdrawal_pin', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>

                {form.withdrawal_pin.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Confirm Withdrawal PIN</label>
                    <div className="auth-input-wrap">
                      <FiLock className="auth-input-icon" size={15} />
                      <input type="password" inputMode="numeric" maxLength={4}
                        className="form-control auth-input" placeholder="••••"
                        autoComplete="off"
                        value={form.withdrawal_pin_confirmation}
                        onChange={e => update('withdrawal_pin_confirmation', e.target.value.replace(/\D/g, ''))} />
                    </div>
                    {form.withdrawal_pin_confirmation.length > 0 && form.withdrawal_pin !== form.withdrawal_pin_confirmation && (
                      <div className="form-error">PINs do not match</div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* NAVIGATION BUTTONS */}
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
              {stage > 1 && (
                <button type="button" className="btn btn-ghost"
                  style={{ flex:1 }}
                  disabled={loading}
                  onClick={() => { setStageError(''); setStage(s => s - 1); }}>
                  Back
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: stage > 1 ? 1 : '1 0 100%', padding:'0.9rem' }}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner" style={{ borderTopColor:'white' }} /> {stage === 4 ? 'Creating account…' : 'Saving…'}</>
                  : stage === 4 ? 'Create Account' : 'Continue'
                }
              </button>
            </div>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
