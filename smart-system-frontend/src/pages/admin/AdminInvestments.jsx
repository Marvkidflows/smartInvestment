// LOCATION: src/pages/admin/AdminInvestments.jsx
import { useState, useEffect } from 'react';
import { FiClock, FiSearch, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

// ── COUNTDOWN MANAGER MODAL ─────────────────────────────────────────────────
function CountdownManagerModal({ investment, onClose, onUpdated }) {
  const [tab, setTab] = useState('extend'); // extend | reduce | set-date | override
  const [days, setDays] = useState('');
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    adminService.getCountdownLogs(investment.id)
      .then(res => setLogs(res.data.logs || []))
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, [investment.id]);

  const handleSubmit = async () => {
    if ((tab === 'extend' || tab === 'reduce' || tab === 'override') && !days) {
      toast.error('Enter a number of days.');
      return;
    }
    if (tab === 'set-date' && !newDate) {
      toast.error('Pick a date.');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (tab === 'extend')   res = await adminService.extendCountdown(investment.id, { days: parseInt(days), reason });
      if (tab === 'reduce')   res = await adminService.reduceCountdown(investment.id, { days: parseInt(days), reason });
      if (tab === 'set-date') res = await adminService.setCountdownDate(investment.id, { end_date: newDate, reason });
      if (tab === 'override') res = await adminService.overrideCountdown(investment.id, { remaining_days: parseInt(days), reason });

      toast.success(res.data.message);
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update countdown.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
          <h3 style={{ margin: 0 }}>Manage Countdown</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><FiX size={16} /></button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>
          {investment.user?.name} · {investment.plan?.name}<br />
          Current end date: <strong>{investment.end_date}</strong> · {investment.days_remaining} days remaining
        </p>

        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { key: 'extend',   label: 'Extend' },
            { key: 'reduce',   label: 'Reduce' },
            { key: 'set-date', label: 'Set Date' },
            { key: 'override', label: 'Override Days' },
          ].map(t => (
            <button key={t.key}
              className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setTab(t.key); setDays(''); setNewDate(''); }}>
              {t.label}
            </button>
          ))}
        </div>

        {(tab === 'extend' || tab === 'reduce') && (
          <div className="form-group">
            <label className="form-label">Days</label>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              {[3, 7, 14, 30].map(d => (
                <button key={d} type="button" className="btn btn-sm btn-ghost" onClick={() => setDays(d.toString())}>
                  {tab === 'extend' ? '+' : '-'}{d}
                </button>
              ))}
            </div>
            <input type="number" className="form-control" value={days}
              onChange={e => setDays(e.target.value)} placeholder="Custom number of days" />
          </div>
        )}

        {tab === 'set-date' && (
          <div className="form-group">
            <label className="form-label">New End Date</label>
            <input type="date" className="form-control" value={newDate}
              onChange={e => setNewDate(e.target.value)} />
          </div>
        )}

        {tab === 'override' && (
          <div className="form-group">
            <label className="form-label">Set Remaining Days To</label>
            <input type="number" className="form-control" value={days}
              onChange={e => setDays(e.target.value)} placeholder="e.g. 45" />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Reason <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
          <input className="form-control" value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Investor requested extension" />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : 'Apply Change'}
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1rem' }}>
          <strong style={{ fontSize: '0.85rem' }}>History</strong>
          <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: '0.5rem' }}>
            {loadingLogs ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Loading…</p>
            ) : logs.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>No changes made yet.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} style={{ fontSize: '0.78rem', color: 'var(--gray-500)', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <strong>{log.modified_by}</strong> — {log.action.replace('_', ' ')}: {log.previous_end_date} → {log.new_end_date}
                  {log.days_changed != null && <span> ({log.days_changed > 0 ? '+' : ''}{log.days_changed} days)</span>}
                  {log.reason && <div style={{ color: 'var(--gray-400)' }}>Reason: {log.reason}</div>}
                  <div style={{ color: 'var(--gray-300)', fontSize: '0.72rem' }}>{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STATUS BADGE ─────────────────────────────────────────────────────────────
function CountdownBadge({ status }) {
  const config = {
    active:        { label: '🟢 Active',        bg: '#16a34a20', color: '#16a34a' },
    maturing_soon: { label: '🟡 Maturing Soon',  bg: '#f59e0b20', color: '#f59e0b' },
    matured:       { label: '🔵 Matured',        bg: '#3b82f620', color: '#3b82f6' },
    paid:          { label: '✅ Paid',           bg: '#16a34a20', color: '#16a34a' },
  };
  const c = config[status] || config.active;
  return (
    <span className="badge" style={{ background: c.bg, color: c.color, fontWeight: 600, fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: 999 }}>
      {c.label}
    </span>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [managing, setManaging] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    adminService.getInvestments()
      .then(res => setInvestments(res.data?.investments || []))
      .catch(() => toast.error('Failed to load investments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = investments.filter(inv => {
    const matchesSearch = !search ||
      inv.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      inv.plan?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this investment as completed and credit profit to the investor?')) return;
    try {
      await adminService.completeInvestment(id);
      toast.success('Investment completed. Profit credited.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete investment.');
    }
  };

  return (
    <div className="adm-dashboard">
      <div className="adm-page-header">
        <div>
          <h1>Investments</h1>
          <p>Manage investor investments and countdown timers</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="auth-input-wrap" style={{ flex: 1, minWidth: 220 }}>
            <FiSearch className="auth-input-icon" size={15} />
            <input className="form-control auth-input" placeholder="Search by investor name, email, or plan…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="adm-empty"><p>Loading investments…</p></div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty"><FiClock size={28} /><p>No investments found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Expected Profit</th>
                  <th>End Date</th>
                  <th>Countdown</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{inv.user?.email}</div>
                    </td>
                    <td>{inv.plan?.name}</td>
                    <td><strong>${inv.amount.toLocaleString()}</strong></td>
                    <td style={{ color: 'var(--success)' }}>+${inv.expected_profit.toLocaleString()}</td>
                    <td>{inv.end_date}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{inv.days_remaining}d</div>
                      <CountdownBadge status={inv.countdown_status} />
                    </td>
                    <td>
                      <span className={`badge badge-${inv.status === 'active' ? 'success' : 'info'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setManaging(inv)}>
                          <FiSettings size={14} /> Countdown
                        </button>
                        {inv.status === 'active' && inv.countdown_status !== 'paid' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleComplete(inv.id)}>
                            <FiCheck size={14} /> Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {managing && (
        <CountdownManagerModal
          investment={managing}
          onClose={() => setManaging(null)}
          onUpdated={fetchAll}
        />
      )}
    </div>
  );
}