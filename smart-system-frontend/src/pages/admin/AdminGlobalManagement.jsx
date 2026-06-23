// LOCATION: src/pages/admin/AdminGlobalManagement.jsx
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiClock, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

// ── PROFIT RATE ADJUSTMENT CARD ─────────────────────────────────────────────
function ProfitAdjustmentCard({ sectors, plans, onApplied }) {
  const [scope, setScope] = useState('global');
  const [sectorId, setSectorId] = useState('');
  const [planId, setPlanId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [percentageChange, setPercentageChange] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (scope === 'users' && allUsers.length === 0) {
      adminService.getUsers().then(res => setAllUsers(res.data?.users || [])).catch(() => {});
    }
  }, [scope]);

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const toggleUser = (id) => {
    setSelectedUserIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  };

  const scopeLabel = () => {
    if (scope === 'global') return 'every active investment on the platform';
    if (scope === 'sector') return `every active investment in the selected sector`;
    if (scope === 'plan') return `every active investment in the selected plan`;
    if (scope === 'users') return `${selectedUserIds.length} selected investor(s)' active investments`;
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pct = parseFloat(percentageChange);
    if (isNaN(pct) || pct === 0) { toast.error('Enter a non-zero percentage change.'); return; }
    if (!reason.trim()) { toast.error('A reason is required for the audit log.'); return; }
    if (scope === 'sector' && !sectorId) { toast.error('Select a sector.'); return; }
    if (scope === 'plan' && !planId) { toast.error('Select a plan.'); return; }
    if (scope === 'users' && selectedUserIds.length === 0) { toast.error('Select at least one investor.'); return; }

    const confirmed = window.confirm(
      `This will ${pct > 0 ? 'increase' : 'decrease'} the profit rate by ${Math.abs(pct)}% on ${scopeLabel()}. This action is logged and cannot be undone automatically. Continue?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const payload = {
        scope,
        percentage_change: pct,
        reason: reason.trim(),
        ...(scope === 'sector' ? { sector_id: sectorId } : {}),
        ...(scope === 'plan' ? { investment_plan_id: planId } : {}),
        ...(scope === 'users' ? { user_ids: selectedUserIds } : {}),
      };
      const res = await adminService.adjustProfit(payload);
      toast.success(res.data?.message || 'Profit rate adjusted.');
      setPercentageChange('');
      setReason('');
      setSelectedUserIds([]);
      onApplied();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust profit rate.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-card">
      <h3 className="adm-card__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiTrendingUp /> Global Profit Rate Adjustment
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Changes the return rate on currently active investments and recalculates expected profit automatically.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Scope</label>
          <select className="form-control" value={scope} onChange={e => setScope(e.target.value)}>
            <option value="global">Global — all active investments</option>
            <option value="sector">By Sector</option>
            <option value="plan">By Investment Plan</option>
            <option value="users">Specific Investors</option>
          </select>
        </div>

        {scope === 'sector' && (
          <div className="form-group">
            <label className="form-label">Sector</label>
            <select className="form-control" value={sectorId} onChange={e => setSectorId(e.target.value)}>
              <option value="">Select a sector…</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        )}

        {scope === 'plan' && (
          <div className="form-group">
            <label className="form-label">Investment Plan</label>
            <select className="form-control" value={planId} onChange={e => setPlanId(e.target.value)}>
              <option value="">Select a plan…</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {scope === 'users' && (
          <div className="form-group">
            <label className="form-label">Investors ({selectedUserIds.length} selected)</label>
            <div className="adm-search" style={{ marginBottom: '0.5rem' }}>
              <FiSearch size={14} />
              <input placeholder="Search by name or email…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
              {filteredUsers.map(u => (
                <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)' }}>
                  <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                  {u.name} <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>({u.email})</span>
                </label>
              ))}
              {filteredUsers.length === 0 && (
                <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: 'var(--gray-400)' }}>No investors found.</div>
              )}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Percentage Change</label>
          <input type="number" step="0.01" className="form-control" placeholder="e.g. 5 or -3"
            value={percentageChange} onChange={e => setPercentageChange(e.target.value)} />
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
            Positive adds percentage points (e.g. 10% → 15%), negative subtracts.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea className="form-control" rows={2} placeholder="e.g. Q3 market growth adjustment"
            value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Apply Adjustment'}
        </button>
      </form>
    </div>
  );
}

// ── MASS BALANCE OPERATIONS CARD ────────────────────────────────────────────
function BulkBalanceCard({ sectors }) {
  const [scope, setScope] = useState('all');
  const [sectorId, setSectorId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [type, setType] = useState('add');
  const [amountType, setAmountType] = useState('fixed');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (scope === 'selected' && allUsers.length === 0) {
      adminService.getUsers().then(res => setAllUsers(res.data?.users || [])).catch(() => {});
    }
  }, [scope]);

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const toggleUser = (id) => {
    setSelectedUserIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount.'); return; }
    if (!reason.trim()) { toast.error('A reason is required for the audit log.'); return; }
    if (scope === 'sector' && !sectorId) { toast.error('Select a sector.'); return; }
    if (scope === 'selected' && selectedUserIds.length === 0) { toast.error('Select at least one investor.'); return; }

    const target = scope === 'all' ? 'ALL investors' : scope === 'sector' ? 'all investors in the selected sector' : `${selectedUserIds.length} selected investor(s)`;
    const amountDesc = amountType === 'percentage' ? `${amt}% of their balance` : `$${amt.toLocaleString()}`;
    const confirmed = window.confirm(
      `This will ${type === 'add' ? 'credit' : 'deduct'} ${amountDesc} ${type === 'add' ? 'to' : 'from'} ${target}. This action is logged. Continue?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const payload = {
        scope, type, amount_type: amountType, amount: amt, reason: reason.trim(),
        ...(scope === 'sector' ? { sector_id: sectorId } : {}),
        ...(scope === 'selected' ? { user_ids: selectedUserIds } : {}),
      };
      const res = await adminService.bulkBalance(payload);
      toast.success(res.data?.message || 'Balance operation applied.');
      setAmount('');
      setReason('');
      setSelectedUserIds([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply balance operation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-card">
      <h3 className="adm-card__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiDollarSign /> Mass Balance Operations
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
        Credit or deduct many investors at once — bonuses, rewards, or service charges.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Scope</label>
          <select className="form-control" value={scope} onChange={e => setScope(e.target.value)}>
            <option value="all">All Investors</option>
            <option value="sector">By Sector (active investors only)</option>
            <option value="selected">Selected Investors</option>
          </select>
        </div>

        {scope === 'sector' && (
          <div className="form-group">
            <label className="form-label">Sector</label>
            <select className="form-control" value={sectorId} onChange={e => setSectorId(e.target.value)}>
              <option value="">Select a sector…</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        )}

        {scope === 'selected' && (
          <div className="form-group">
            <label className="form-label">Investors ({selectedUserIds.length} selected)</label>
            <div className="adm-search" style={{ marginBottom: '0.5rem' }}>
              <FiSearch size={14} />
              <input placeholder="Search by name or email…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
              {filteredUsers.map(u => (
                <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)' }}>
                  <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                  {u.name} <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>({u.email})</span>
                </label>
              ))}
              {filteredUsers.length === 0 && (
                <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: 'var(--gray-400)' }}>No investors found.</div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Action</label>
            <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
              <option value="add">Credit (Add)</option>
              <option value="deduct">Debit (Deduct)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount Type</label>
            <select className="form-control" value={amountType} onChange={e => setAmountType(e.target.value)}>
              <option value="fixed">Fixed $ amount</option>
              <option value="percentage">% of each balance</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{amountType === 'percentage' ? 'Percentage' : 'Amount ($)'}</label>
          <input type="number" step="0.01" min="0.01" className="form-control"
            placeholder={amountType === 'percentage' ? 'e.g. 5' : 'e.g. 50.00'}
            value={amount} onChange={e => setAmount(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea className="form-control" rows={2} placeholder="e.g. Holiday bonus campaign"
            value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <button type="submit" className={`btn ${type === 'add' ? 'btn-success' : 'btn-danger'}`} disabled={submitting}>
          {submitting ? <span className="spinner" /> : type === 'add' ? 'Apply Credit' : 'Apply Deduction'}
        </button>
      </form>
    </div>
  );
}

// ── HISTORY TABLE ────────────────────────────────────────────────────────────
function ProfitHistoryCard({ refreshKey }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService.getProfitHistory()
      .then(res => setHistory(res.data?.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="adm-card">
      <h3 className="adm-card__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiClock /> Profit Adjustment History
      </h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-400)' }}>Loading…</div>
      ) : history.length === 0 ? (
        <div className="adm-empty"><p>No profit adjustments have been made yet.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Scope</th><th>Target</th><th>Change</th><th>Affected</th><th>Reason</th><th>Admin</th><th>Date</th></tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td style={{ textTransform: 'capitalize' }}>{h.scope}</td>
                  <td style={{ fontSize: '0.82rem' }}>{h.sector_name || h.plan_name || '—'}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: h.percentage_change > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {h.percentage_change > 0 ? <FiTrendingUp size={13} /> : <FiTrendingDown size={13} />}
                      {h.percentage_change > 0 ? '+' : ''}{h.percentage_change}%
                    </span>
                  </td>
                  <td>{h.affected_count}</td>
                  <td style={{ fontSize: '0.82rem', maxWidth: 220 }}>{h.reason}</td>
                  <td style={{ fontSize: '0.82rem' }}>{h.admin_name}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{new Date(h.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function AdminGlobalManagement() {
  const [sectors, setSectors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    adminService.getSectors().then(res => setSectors(res.data?.sectors || [])).catch(() => {});
    adminService.getPlans().then(res => setPlans(res.data?.plans || [])).catch(() => {});
  }, []);

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Global Profit & Balance Management</h1>
          <p>Apply platform-wide rate changes and mass balance operations</p>
        </div>
      </div>

      <div className="inv-announcement" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <FiAlertTriangle size={16} />
        These actions affect multiple investors at once and are logged permanently. Double-check scope and amounts before applying.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        <ProfitAdjustmentCard sectors={sectors} plans={plans} onApplied={() => setRefreshKey(k => k + 1)} />
        <BulkBalanceCard sectors={sectors} />
      </div>

      <ProfitHistoryCard refreshKey={refreshKey} />
    </div>
  );
}
