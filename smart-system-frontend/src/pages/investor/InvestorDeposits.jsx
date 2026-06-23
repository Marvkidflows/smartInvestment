import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiCheck, FiClock, FiX, FiUpload, FiSend, FiCopy } from 'react-icons/fi';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

function DepositInstructions({ result, onDone }) {
  const { deposit, agent } = result;

  const copyReference = () => {
    navigator.clipboard.writeText(deposit.reference);
    toast.success('Reference copied!');
  };

  return (
    <div className="inv-card dep-form">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📨</div>
        <h3 style={{ color: 'var(--navy)', marginBottom: '0.4rem' }}>Deposit Request Created</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
          Contact the agent below to confirm your payment.
        </p>
      </div>

      <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy)' }}>{deposit.plan_name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy)' }}>${parseFloat(deposit.amount).toLocaleString()}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
            Reference Number
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <code style={{ fontSize: '0.95rem', fontWeight: 700, background: 'white', border: '1px solid var(--gray-200)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', flex: 1 }}>
              {deposit.reference}
            </code>
            <button className="btn btn-ghost btn-sm" onClick={copyReference}><FiCopy size={14} /></button>
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, var(--royal), var(--royal-light))', borderRadius: 'var(--radius-md)', padding: '1.25rem', color: 'white', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginBottom: '0.4rem' }}>TELEGRAM PAYMENT AGENT</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>{agent.name}</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>@{agent.username}</div>
        <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: '1rem' }}>
          Contact {agent.name} on Telegram and quote your reference number above to confirm your payment.
        </p>
        <a href={agent.link} target="_blank" rel="noopener noreferrer" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
          <FiSend size={15} /> Message {agent.name} on Telegram
        </a>
      </div>

      <div className="inv-announcement" style={{ marginBottom: '1.5rem' }}>
        ⏳ Your deposit is <strong>pending</strong>. Your balance will update once the admin confirms your payment.
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onDone}>
        Done
      </button>
    </div>
  );
}

export default function InvestorDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_method: '', investment_plan_id: '' });
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchDeposits = () => {
    investorService.getDeposits()
      .then(res => setDeposits(res.data?.deposits || res.data || []))
      .catch(() => toast.error('Failed to load deposits'))
      .finally(() => setLoading(false));
  };

  const fetchPlans = () => {
    investorService.getPlans()
      .then(res => setPlans(res.data?.plans || res.data || []))
      .catch(() => {});
  };

  useEffect(() => { fetchDeposits(); fetchPlans(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('amount', form.amount);
      fd.append('payment_method', form.payment_method);
      fd.append('investment_plan_id', form.investment_plan_id);
      if (screenshot) fd.append('screenshot', screenshot);

      const res = await investorService.storeDeposit(fd);
      setResult(res.data);
      setShowForm(false);
      setForm({ amount: '', payment_method: '', investment_plan_id: '' });
      setScreenshot(null);
      fetchDeposits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (s) => s === 'approved' ? <FiCheck /> : s === 'pending' ? <FiClock /> : s === 'hold' ? <FiClock /> : <FiX />;
  const statusClass = (s) => s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'hold' ? 'info' : 'danger';

  if (result) {
    return (
      <div className="inv-page">
        <div className="inv-page__header">
          <div><h1>Deposits</h1><p>Fund your account and track your deposit history</p></div>
        </div>
        <DepositInstructions result={result} onDone={() => setResult(null)} />
      </div>
    );
  }

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h1>Deposits</h1>
          <p>Fund your account and track your deposit history</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowForm(v => !v)}>
          <FiPlus /> New Deposit
        </button>
      </div>

      {showForm && (
        <div className="inv-card dep-form">
          <h3 className="inv-card__title" style={{ marginBottom:'1.5rem' }}>New Deposit Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Investment Plan</label>
              <select className="form-control" required value={form.investment_plan_id}
                onChange={e => setForm(f => ({ ...f, investment_plan_id: e.target.value }))}>
                <option value="">Select a plan…</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.profit_percentage}% ROI (${parseFloat(p.min_amount).toLocaleString()}–${p.max_amount ? parseFloat(p.max_amount).toLocaleString() : '∞'})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (USD)</label>
              <div className="auth-input-wrap">
                <FiDollarSign className="auth-input-icon" size={15} />
                <input type="number" className="form-control auth-input" placeholder="1000.00" required min="50"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-control" required value={form.payment_method}
                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                <option value="">Select method…</option>
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="usdt">USDT (TRC20)</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Payment Screenshot <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional, recommended)</span>
              </label>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1.5rem',
                cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.85rem',
              }}>
                <FiUpload size={16} />
                {screenshot ? screenshot.name : 'Click to upload payment proof'}
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => setScreenshot(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Submit Deposit'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inv-card">
        <h3 className="inv-card__title" style={{ marginBottom:'1.25rem' }}>Deposit History</h3>
        {loading ? (
          <div className="inv-loading">Loading deposits…</div>
        ) : deposits.length === 0 ? (
          <div className="inv-empty-state">
            <FiDollarSign size={36} />
            <p>No deposits yet. Make your first deposit to get started.</p>
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
                    <td style={{ textTransform:'capitalize' }}>{d.method || '—'}</td>
                    <td><code style={{ fontSize:'0.78rem', background:'var(--gray-100)', padding:'0.1rem 0.4rem', borderRadius:4 }}>{(d.reference || '—').slice(0,20)}</code></td>
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
