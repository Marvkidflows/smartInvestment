// LOCATION: src/pages/investor/InvestorDeposits.jsx
import { useState, useEffect } from 'react';
import {
  FiDollarSign, FiCheck, FiClock, FiX,
  FiSend, FiCopy, FiUpload, FiArrowRight, FiArrowLeft
} from 'react-icons/fi';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

// ── PLAN RECOMMENDATION LOGIC ─────────────────────────────────────────────────
function recommendPlan(plans, experience, risk, amount) {
  if (!plans.length) return null;
  const eligible = plans.filter(p =>
    parseFloat(amount) >= parseFloat(p.min_amount) &&
    (!p.max_amount || parseFloat(amount) <= parseFloat(p.max_amount))
  );
  const pool = eligible.length ? eligible : plans;

  const scored = pool.map(p => {
    let score = 0;
    const roi  = parseFloat(p.profit_percentage ?? p.profit_percent ?? 0);
    const days = p.duration_days ?? 30;

    if (experience === 'beginner')     { score += roi < 15 ? 2 : 0; score += days <= 30 ? 2 : 0; }
    if (experience === 'intermediate') { score += (roi >= 10 && roi <= 25) ? 2 : 0; }
    if (experience === 'advanced')     { score += roi > 20 ? 2 : 0; }

    if (risk === 'conservative') { score += roi < 15 ? 2 : 0; score += days <= 30 ? 1 : 0; }
    if (risk === 'moderate')     { score += (roi >= 10 && roi <= 25) ? 2 : 0; }
    if (risk === 'aggressive')   { score += roi > 15 ? 2 : 0; }

    if (p.is_featured) score += 1;
    return { ...p, score };
  });

  return scored.sort((a, b) => b.score - a.score)[0];
}

// ── STAGE 1 — QUIZ + AMOUNT ────────────────────────────────────────────────────
// onNext receives { plan, amount } — API call happens in the parent, not here
function Stage1({ plans, onNext, initiating }) {
  const [experience, setExperience] = useState('');
  const [risk, setRisk]             = useState('');
  const [amount, setAmount]         = useState('');
  const [recommended, setRecommended] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');

  const handleRecommend = (e) => {
    e.preventDefault();
    if (!experience || !risk || !amount) {
      toast.error('Please answer all questions.');
      return;
    }
    const rec = recommendPlan(plans, experience, risk, parseFloat(amount));
    setRecommended(rec);
    setSelectedPlan(rec?.id?.toString() || '');
  };

  const handleContinue = () => {
    const plan = plans.find(p => p.id.toString() === selectedPlan);
    if (!plan) { toast.error('Please select a plan.'); return; }
    const amt = parseFloat(amount);
    if (amt < parseFloat(plan.min_amount)) {
      toast.error(`Minimum for ${plan.name} is $${parseFloat(plan.min_amount).toLocaleString()}`);
      return;
    }
    onNext({ plan, amount: amt }); // parent handles API call
  };

  return (
    <div className="inv-card dep-form">
      <h3 className="inv-card__title" style={{ marginBottom: '0.5rem' }}>Step 1 — Investment Profile</h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
        Answer a few quick questions so we can recommend the right plan for you.
      </p>

      <form onSubmit={handleRecommend}>
        <div className="form-group">
          <label className="form-label">What is your investment experience?</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { value: 'beginner',     label: '🌱 Beginner'    },
              { value: 'intermediate', label: '📈 Intermediate' },
              { value: 'advanced',     label: '🚀 Advanced'     },
            ].map(o => (
              <button key={o.value} type="button"
                className={`btn btn-sm ${experience === o.value ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setExperience(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">What is your risk tolerance?</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { value: 'conservative', label: '🛡 Conservative' },
              { value: 'moderate',     label: '⚖ Moderate'     },
              { value: 'aggressive',   label: '⚡ Aggressive'   },
            ].map(o => (
              <button key={o.value} type="button"
                className={`btn btn-sm ${risk === o.value ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setRisk(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">How much do you want to invest? (USD)</label>
          <div className="auth-input-wrap">
            <FiDollarSign className="auth-input-icon" size={15} />
            <input type="number" className="form-control auth-input" placeholder="e.g. 500"
              value={amount} onChange={e => { setAmount(e.target.value); setRecommended(null); }} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Find My Plan <FiArrowRight size={14} />
        </button>
      </form>

      {recommended && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem' }}>✨</span>
            <strong>Recommended Plan</strong>
          </div>

          <div style={{
            padding: '1rem', background: 'var(--gray-50)',
            borderRadius: 'var(--radius-md)', border: '2px solid var(--royal)',
            marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)', marginBottom: '0.35rem' }}>
              {recommended.name}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--gray-500)' }}>
              <span>💰 Min: ${parseFloat(recommended.min_amount).toLocaleString()}</span>
              <span>📈 ROI: {recommended.profit_percentage ?? recommended.profit_percent}%</span>
              <span>⏱ {recommended.duration_days} days</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Or choose a different plan</label>
            <select className="form-control" value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value)}>
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.profit_percentage ?? p.profit_percent}% ROI
                  (Min: ${parseFloat(p.min_amount).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleContinue} disabled={initiating}>
            {initiating
              ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Setting up deposit…</>
              : <>Continue with this Plan <FiArrowRight size={14} /></>}
          </button>
        </div>
      )}
    </div>
  );
}

// ── STAGE 2 — CONTACT AGENT ────────────────────────────────────────────────────
// Now receives `reference` from the API and displays it prominently
function Stage2({ plan, amount, reference, agent, onNext, onBack }) {
  const copyRef = () => {
    navigator.clipboard.writeText(reference);
    toast.success('Reference copied!');
  };

  return (
    <div className="inv-card dep-form">
      <h3 className="inv-card__title" style={{ marginBottom: '0.5rem' }}>Step 2 — Make Your Payment</h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
        Contact the agent on Telegram, send your payment, and give them your reference below.
      </p>

      {/* Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
        marginBottom: '1.25rem', padding: '1rem',
        background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--gray-200)',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Plan</div>
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{plan.name}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Amount</div>
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>${parseFloat(amount).toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>ROI</div>
          <div style={{ fontWeight: 700, color: 'var(--success)' }}>+{plan.profit_percentage ?? plan.profit_percent}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Duration</div>
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{plan.duration_days} days</div>
        </div>
      </div>

      {/* ── Reference block — NEW ── */}
      <div style={{
        background: 'var(--gray-50)', border: '2px solid var(--royal)',
        borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Your Deposit Reference
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <code style={{
            flex: 1, background: 'white', border: '1px solid var(--gray-200)',
            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
            fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '0.05em',
          }}>
            {reference}
          </code>
          <button className="btn btn-ghost btn-sm" type="button" onClick={copyRef}>
            <FiCopy size={14} />
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.4rem' }}>
          Share this reference with the agent when you message them — they'll use it to confirm your payment.
        </div>
      </div>

      {/* Agent card */}
      <div style={{
        background: 'linear-gradient(135deg, #1A3A8F, #2552C4)',
        borderRadius: 'var(--radius-md)', padding: '1.5rem',
        color: 'white', marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment Agent</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{agent.name}</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '1rem' }}>@{agent.username}</div>
        <p style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Send <strong>${parseFloat(amount).toLocaleString()}</strong> to {agent.name} on Telegram
          and include your reference <strong>{reference}</strong>.
          Then come back here and click <strong>"I've Made My Payment"</strong>.
        </p>
        <a href={agent.link} target="_blank" rel="noopener noreferrer"
          className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
          <FiSend size={15} /> Message {agent.name} on Telegram
        </a>
      </div>

      <div className="inv-announcement" style={{ marginBottom: '1.25rem' }}>
        ⚠️ Do <strong>not</strong> close this page after payment. Come back here to complete your deposit submission.
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-ghost" onClick={onBack}><FiArrowLeft size={14} /> Back</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNext}>
          I've Made My Payment <FiArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── STAGE 3 — PAYMENT PROOF ────────────────────────────────────────────────────
// reference is read-only (pre-filled from Stage 1 API response)
// calls confirmDeposit (PUT) instead of storeDeposit (POST)
function Stage3({ plan, amount, depositId, reference, onBack, onSubmitted }) {
  const [method, setMethod]         = useState('');
  const [paidAmount, setPaidAmount] = useState(amount.toString());
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!method) { toast.error('Select a payment method.'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('payment_method', method);
      fd.append('amount',         paidAmount);
      if (screenshot) fd.append('screenshot', screenshot);

      const res = await investorService.confirmDeposit(depositId, fd);
      toast.success('Deposit submitted! Awaiting admin approval.');
      onSubmitted(res.data?.deposit);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit deposit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inv-card dep-form">
      <h3 className="inv-card__title" style={{ marginBottom: '0.5rem' }}>Step 3 — Confirm Your Payment</h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
        Select how you paid and optionally upload a screenshot as proof.
      </p>

      <form onSubmit={handleSubmit}>

        {/* Reference — read-only, pre-filled */}
        <div className="form-group">
          <label className="form-label">Deposit Reference</label>
          <input className="form-control" readOnly value={reference}
            style={{ background: 'var(--gray-50)', fontWeight: 700, cursor: 'not-allowed', letterSpacing: '0.04em' }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
            Auto-filled from your deposit — do not change
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Payment Method Used</label>
          <select className="form-control" required value={method}
            onChange={e => setMethod(e.target.value)}>
            <option value="">Select method…</option>
            <option value="bitcoin">Bitcoin (BTC)</option>
            <option value="ethereum">Ethereum (ETH)</option>
            <option value="usdt">USDT (TRC20)</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Amount Paid (USD)</label>
          <div className="auth-input-wrap">
            <FiDollarSign className="auth-input-icon" size={15} />
            <input type="number" className="form-control auth-input" required
              value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Payment Screenshot <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional but recommended)</span>
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-md)',
            padding: '1.5rem', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.85rem',
          }}>
            <FiUpload size={16} />
            {screenshot
              ? <span style={{ color: 'var(--success)' }}>✓ {screenshot.name}</span>
              : 'Click to upload payment proof'}
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => setScreenshot(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            <FiArrowLeft size={14} /> Back
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
            {submitting
              ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
              : 'Submit Deposit'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── STAGE 4 — SUCCESS ─────────────────────────────────────────────────────────
function Stage4({ deposit, onDone }) {
  const copyRef = () => {
    navigator.clipboard.writeText(deposit.reference || '');
    toast.success('Reference copied!');
  };

  return (
    <div className="inv-card dep-form" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
      <h3 style={{ color: 'var(--navy)', marginBottom: '0.4rem' }}>Deposit Submitted!</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
        Your payment is being reviewed. Your balance will be credited once the admin approves.
      </p>

      <div style={{
        background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: '1.25rem',
        marginBottom: '1.5rem', textAlign: 'left',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Plan</div>
            <div style={{ fontWeight: 700 }}>{deposit.plan_name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Amount</div>
            <div style={{ fontWeight: 700 }}>${parseFloat(deposit.amount).toLocaleString()}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Reference</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <code style={{
              flex: 1, background: 'white', border: '1px solid var(--gray-200)',
              padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem', fontWeight: 700,
            }}>
              {deposit.reference}
            </code>
            <button className="btn btn-ghost btn-sm" onClick={copyRef}><FiCopy size={14} /></button>
          </div>
        </div>
      </div>

      <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', marginBottom: '1.5rem', display: 'inline-flex', gap: '0.3rem' }}>
        <FiClock size={13} /> Pending Admin Approval
      </span>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onDone}>
        Back to Deposits
      </button>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function InvestorDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [initiating, setInitiating] = useState(false); // loading state for Stage1→2 API call

  // Multi-step state
  const [step, setStep]         = useState(0); // 0=list, 1=quiz, 2=agent, 3=proof, 4=success
  const [stepData, setStepData] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      investorService.getDeposits(),
      investorService.getPlans(),
    ]).then(([dRes, pRes]) => {
      setDeposits(dRes.data?.deposits || []);
      setPlans(pRes.data?.plans    || []);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const statusClass = (s) => s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'hold' ? 'info' : 'danger';
  const statusIcon  = (s) => s === 'approved' ? <FiCheck /> : s === 'pending' ? <FiClock /> : s === 'hold' ? <FiClock /> : <FiX />;

  // ── Stage 1 → 2: call initiate, fire Telegram, save reference ──────────────
  const handleStage1Next = async ({ plan, amount }) => {
    setInitiating(true);
    try {
      const res = await investorService.initiateDeposit({
        investment_plan_id: plan.id,
        amount,
      });
      setStepData({
        plan,
        amount,
        deposit_id: res.data.deposit_id,
        reference:  res.data.reference,
        agent:      res.data.agent,
      });
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate deposit. Please try again.');
    } finally {
      setInitiating(false);
    }
  };

  // Fallback agent info in case API didn't return one
  const agentInfo = stepData.agent || {
    name:     'Agent Frank',
    username: 'AgentlanFrank',
    link:     'https://t.me/AgentlanFrank',
  };

  // ── Step renderers ──────────────────────────────────────────────────────────

  if (step === 1) return (
    <div className="inv-page">
      <div className="inv-page__header"><div><h1>New Deposit</h1><p>Step 1 of 3</p></div></div>
      <Stage1
        plans={plans}
        initiating={initiating}
        onNext={handleStage1Next}   // API call happens here now
      />
    </div>
  );

  if (step === 2) return (
    <div className="inv-page">
      <div className="inv-page__header"><div><h1>New Deposit</h1><p>Step 2 of 3</p></div></div>
      <Stage2
        plan={stepData.plan}
        amount={stepData.amount}
        reference={stepData.reference}   // ← from API
        agent={agentInfo}                // ← from API
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
      />
    </div>
  );

  if (step === 3) return (
    <div className="inv-page">
      <div className="inv-page__header"><div><h1>New Deposit</h1><p>Step 3 of 3</p></div></div>
      <Stage3
        plan={stepData.plan}
        amount={stepData.amount}
        depositId={stepData.deposit_id}  // ← for PUT /deposits/{id}/confirm
        reference={stepData.reference}   // ← read-only, pre-filled
        onBack={() => setStep(2)}
        onSubmitted={(deposit) => { setSubmitted(deposit); setStep(4); fetchAll(); }}
      />
    </div>
  );

  if (step === 4) return (
    <div className="inv-page">
      <div className="inv-page__header"><div><h1>Deposit Submitted</h1></div></div>
      <Stage4 deposit={submitted} onDone={() => { setStep(0); setSubmitted(null); }} />
    </div>
  );

  // ── Step 0 — Deposit history list ───────────────────────────────────────────
  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div><h1>Deposits</h1><p>Fund your account and track your deposit history</p></div>
        <button className="btn btn-gold" onClick={() => setStep(1)}>
          + New Deposit
        </button>
      </div>

      <div className="inv-card">
        <h3 className="inv-card__title" style={{ marginBottom: '1.25rem' }}>Deposit History</h3>
        {loading ? (
          <div className="inv-loading">Loading deposits…</div>
        ) : deposits.length === 0 ? (
          <div className="inv-empty-state">
            <FiDollarSign size={36} />
            <p>No deposits yet. Make your first deposit to get started.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setStep(1)}>Make a Deposit</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Plan</th><th>Amount</th><th>Method</th><th>Reference</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id}>
                    <td>{d.plan_name || '—'}</td>
                    <td><strong>${parseFloat(d.amount).toLocaleString()}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{d.method || '—'}</td>
                    <td>
                      <code style={{ fontSize: '0.78rem', background: 'var(--gray-100)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                        {(d.reference || '—').slice(0, 20)}
                      </code>
                    </td>
                    <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${statusClass(d.status)}`}>
                        {statusIcon(d.status)} {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}