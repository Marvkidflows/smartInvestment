import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

export default function InvestorDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_method: '', reference: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDeposits = () => {
    investorService.getDeposits()
      .then(res => setDeposits(res.data?.deposits || res.data || []))
      .catch(() => toast.error('Failed to load deposits'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await investorService.storeDeposit(form);
      toast.success('Deposit request submitted!');
      setShowForm(false);
      setForm({ amount: '', payment_method: '', reference: '' });
      fetchDeposits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (s) => s === 'approved' ? <FiCheck /> : s === 'pending' ? <FiClock /> : <FiX />;
  const statusClass = (s) => s === 'approved' ? 'success' : s === 'pending' ? 'warning' : 'danger';

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

      {/* DEPOSIT FORM */}
      {showForm && (
        <div className="inv-card dep-form">
          <h3 className="inv-card__title" style={{ marginBottom:'1.5rem' }}>New Deposit Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Amount (USD)</label>
              <div className="auth-input-wrap">
                <FiDollarSign className="auth-input-icon" size={15} />
                <input type="number" className="form-control auth-input" placeholder="1000.00" required min="100"
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
              <label className="form-label">Transaction Reference / Hash</label>
              <input className="form-control" placeholder="e.g. 0x1a2b3c…" required
                value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
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

      {/* DEPOSIT HISTORY */}
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
                <tr><th>Amount</th><th>Method</th><th>Reference</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id}>
                    <td><strong>${parseFloat(d.amount).toLocaleString()}</strong></td>
                    <td style={{ textTransform:'capitalize' }}>{d.payment_method || d.method || '—'}</td>
                    <td><code style={{ fontSize:'0.78rem', background:'var(--gray-100)', padding:'0.1rem 0.4rem', borderRadius:4 }}>{(d.reference || d.transaction_reference || '—').slice(0,20)}</code></td>
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
