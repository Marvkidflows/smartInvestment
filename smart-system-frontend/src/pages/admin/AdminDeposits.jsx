// LOCATION: src/pages/admin/AdminDeposits.jsx
import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function NoteModal({ deposit, onClose, onSave }) {
  const [note, setNote] = useState(deposit.admin_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await adminService.addDepositNote(deposit.id, { admin_notes: note });
      toast.success('Note saved.');
      onSave(deposit.id, note);
      onClose();
    } catch { toast.error('Failed to save note.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h3>Admin Note — Deposit #{deposit.id}</h3>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <textarea className="form-control" rows={4} style={{ resize: 'vertical' }}
            placeholder="Add an internal note about this deposit…"
            value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <div className="adm-modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScreenshotModal({ path, onClose }) {
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div style={{ maxWidth: 600, width: '100%' }} onClick={e => e.stopPropagation()}>
        <img src={`${API_BASE}/storage/${path}`} alt="Payment proof"
          style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }} />
        <button className="btn btn-ghost" style={{ marginTop: '1rem', width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteModal, setNoteModal] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminService.getDeposits()
      .then(res => setDeposits(res.data?.deposits || res.data || []))
      .catch(() => toast.error('Failed to load deposits'))
      .finally(() => setLoading(false));
  }, []);

  const update = (id, changes) =>
    setDeposits(d => d.map(x => x.id === id ? { ...x, ...changes } : x));

  const approve = async (id) => {
    try {
      await adminService.approveDeposit(id);
      update(id, { status: 'approved' });
      toast.success('Deposit approved — balance credited!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reject = async (id) => {
    try {
      await adminService.rejectDeposit(id);
      update(id, { status: 'rejected' });
      toast.success('Deposit rejected.');
    } catch { toast.error('Failed'); }
  };

  const hold = async (id) => {
    try {
      await adminService.holdDeposit(id);
      update(id, { status: 'hold' });
      toast.success('Deposit placed on hold.');
    } catch { toast.error('Failed'); }
  };

  const filtered = filter === 'all' ? deposits : deposits.filter(d => d.status === filter);

  const counts = {
    all: deposits.length,
    pending: deposits.filter(d => d.status === 'pending').length,
    approved: deposits.filter(d => d.status === 'approved').length,
    rejected: deposits.filter(d => d.status === 'rejected').length,
    hold: deposits.filter(d => d.status === 'hold').length,
  };

  const statusColor = (s) =>
    s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'hold' ? 'info' : 'danger';

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Deposit Management</h1>
          <p>Review, approve, hold, or reject investor deposit requests</p>
        </div>
        {counts.pending > 0 && (
          <span className="badge badge-warning" style={{ fontSize: '0.88rem', padding: '0.4rem 1rem' }}>
            {counts.pending} Pending
          </span>
        )}
      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'hold', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}>
            {f} {counts[f] > 0 && <span style={{ marginLeft: '0.3rem', opacity: 0.7 }}>({counts[f]})</span>}
          </button>
        ))}
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">
          {filter === 'all' ? 'All Deposits' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Deposits`}
        </h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty"><p>No {filter === 'all' ? '' : filter} deposits found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Investor</th><th>Plan</th><th>Amount</th><th>Method</th>
                  <th>Reference</th><th>Proof</th><th>Date</th><th>Status</th><th>Notes</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.user?.name || '—'}</strong><div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{d.user?.email}</div></td>
                    <td style={{ fontSize: '0.82rem' }}>{d.plan_name || '—'}</td>
                    <td><strong>${parseFloat(d.amount).toLocaleString()}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{d.method || d.payment_method || '—'}</td>
                    <td>
                      <code style={{ fontSize: '0.75rem', background: 'var(--gray-100)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                        {(d.reference || '—').slice(0, 18)}
                      </code>
                    </td>
                    <td>
                      {d.screenshot_path ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setScreenshot(d.screenshot_path)}>
                          View
                        </button>
                      ) : <span style={{ color: 'var(--gray-300)', fontSize: '0.8rem' }}>None</span>}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge badge-${statusColor(d.status)}`}>{d.status}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setNoteModal(d)}
                        style={{ fontSize: '0.75rem' }} title={d.admin_notes || 'Add note'}>
                        {d.admin_notes ? '📝 Edit' : '+ Note'}
                      </button>
                    </td>
                    <td>
                      {(d.status === 'pending' || d.status === 'hold') && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-success btn-sm" onClick={() => approve(d.id)}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => reject(d.id)}>Reject</button>
                          {d.status === 'pending' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => hold(d.id)}>Hold</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {noteModal && (
        <NoteModal
          deposit={noteModal}
          onClose={() => setNoteModal(null)}
          onSave={(id, note) => update(id, { admin_notes: note })}
        />
      )}

      {screenshot && (
        <ScreenshotModal path={screenshot} onClose={() => setScreenshot(null)} />
      )}
    </div>
  );
}
