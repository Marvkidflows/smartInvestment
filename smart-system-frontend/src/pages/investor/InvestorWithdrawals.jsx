import { useState, useEffect } from 'react';
import { FiArrowUpCircle, FiPlus } from 'react-icons/fi';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

export default function InvestorWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', method: '', wallet_address: '', bank_name: '', account_number: '', account_name: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchWithdrawals = () => {
    investorService.getWithdrawals()
      .then(res => setWithdrawals(res.data?.withdrawals || res.data || []))
      .catch(() => toast.error('Failed to load withdrawals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await investorService.storeWithdrawal(form);
      toast.success('Withdrawal request submitted! Pending admin approval.');
      setShowForm(false);
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const isCrypto = form.method && ['bitcoin','ethereum','usdt'].includes(form.method);

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h1>Withdrawals</h1>
          <p>Request withdrawals and track their processing status</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowForm(v => !v)}>
          <FiPlus /> Request Withdrawal
        </button>
      </div>

      {showForm && (
        <div className="inv-card dep-form">
          <h3 className="inv-card__title" style={{ marginBottom:'1.5rem' }}>Withdrawal Request</h3>
          <div className="inv-announcement" style={{ marginBottom:'1.5rem' }}>
            ℹ️ Withdrawals are processed within 24–48 hours after admin approval.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Amount (USD)</label>
              <input type="number" className="form-control" placeholder="500.00" required min="50"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Withdrawal Method</label>
              <select className="form-control" required value={form.method}
                onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                <option value="">Select method…</option>
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="usdt">USDT (TRC20)</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {isCrypto ? (
              <div className="form-group">
                <label className="form-label">Wallet Address</label>
                <input className="form-control" placeholder="Your crypto wallet address" required
                  value={form.wallet_address} onChange={e => setForm(f => ({ ...f, wallet_address: e.target.value }))} />
              </div>
            ) : form.method === 'bank_transfer' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input className="form-control" placeholder="e.g. Chase Bank" required
                    value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input className="form-control" placeholder="0123456789" required
                    value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Name</label>
                  <input className="form-control" placeholder="John Doe" required
                    value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} />
                </div>
              </>
            ) : null}

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inv-card">
        <h3 className="inv-card__title" style={{ marginBottom:'1.25rem' }}>Withdrawal History</h3>
        {loading ? (
          <div className="inv-loading">Loading…</div>
        ) : withdrawals.length === 0 ? (
          <div className="inv-empty-state">
            <FiArrowUpCircle size={36} />
            <p>No withdrawals requested yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Amount</th><th>Method</th><th>Date Requested</th><th>Status</th></tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id}>
                    <td><strong>${parseFloat(w.amount).toLocaleString()}</strong></td>
                    <td style={{ textTransform:'capitalize' }}>{w.method || w.withdrawal_method || '—'}</td>
                    <td>{w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${w.status==='approved'?'success':w.status==='pending'?'warning':'danger'}`}>
                        {w.status}
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
