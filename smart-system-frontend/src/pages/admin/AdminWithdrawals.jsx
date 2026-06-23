// LOCATION: src/pages/admin/AdminWithdrawals.jsx
import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

function NoteModal({ withdrawal, onClose, onSave }) {
  const [note, setNote] = useState(withdrawal.admin_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await adminService.addWithdrawalNote(withdrawal.id, { admin_notes: note });
      toast.success('Note saved.');
      onSave(withdrawal.id, note);
      onClose();
    } catch { toast.error('Failed to save note.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h3>Admin Note — Withdrawal #{withdrawal.id}</h3>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <textarea className="form-control" rows={4} style={{ resize: 'vertical' }}
            placeholder="Add an internal note about this withdrawal…"
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

function DetailModal({ withdrawal, onClose }) {
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.showWithdrawal(withdrawal.id)
      .then(res => setFull(res.data?.withdrawal || res.data))
      .catch(() => toast.error('Failed to load withdrawal details.'))
      .finally(() => setLoading(false));
  }, [withdrawal.id]);

  const ad = full?.account_details || {};

  const KYC_COLOR = { approved: 'success', pending: 'info', rejected: 'danger', not_submitted: 'warning' };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <h3>Withdrawal Details — #{withdrawal.id}</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
              {[
                ['Investor', full?.user?.name || '—'],
                ['Email', full?.user?.email || '—'],
                ['Amount', `$${parseFloat(full?.amount || 0).toLocaleString()}`],
                ['Available Balance', `$${parseFloat(full?.user?.balance || 0).toLocaleString()}`],
                ['Method', full?.method || '—'],
                ['Status', full?.status],
                ['Date Submitted', full?.created_at ? new Date(full.created_at).toLocaleDateString() : '—'],
                ...(ad.wallet_address ? [['Wallet Address', ad.wallet_address]] : []),
                ...(ad.bank_name ? [
                  ['Bank Name', ad.bank_name],
                  ['Account Number', ad.account_number || '—'],
                  ['Account Name', ad.account_name || '—'],
                ] : []),
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{l}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-800)', wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Verification Status */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Verification Status</div>
              <span className={`badge badge-${KYC_COLOR[full?.user?.verification_status] || 'warning'}`} style={{ textTransform: 'capitalize' }}>
                {full?.user?.verification_status?.replace(/_/g, ' ') || 'Not Submitted'}
              </span>
            </div>

            {/* Active Plans */}
            {full?.active_plans?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Plans</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {full.active_plans.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0.6rem', background: 'var(--gray-50)', borderRadius: 6 }}>
                      <span>{p.plan_name}</span>
                      <span>${parseFloat(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Withdrawals */}
            {full?.previous_withdrawals?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Previous Withdrawals</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {full.previous_withdrawals.map(w => (
                    <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '0.4rem 0.6rem', background: 'var(--gray-50)', borderRadius: 6 }}>
                      <span>${parseFloat(w.amount).toLocaleString()} · {w.method}</span>
                      <span className={`badge badge-${w.status === 'approved' ? 'success' : w.status === 'pending' ? 'warning' : 'danger'}`}>{w.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {full?.admin_notes && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Admin Notes</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>{full.admin_notes}</div>
              </div>
            )}
          </>
        )}

        <div className="adm-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteModal, setNoteModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminService.getWithdrawals()
      .then(res => setWithdrawals(res.data?.withdrawals || res.data || []))
      .catch(() => toast.error('Failed to load withdrawals'))
      .finally(() => setLoading(false));
  }, []);

  const update = (id, changes) =>
    setWithdrawals(w => w.map(x => x.id === id ? { ...x, ...changes } : x));

  const approve = async (id) => {
    try {
      await adminService.approveWithdrawal(id);
      update(id, { status: 'approved' });
      toast.success('Withdrawal approved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reject = async (id) => {
    try {
      await adminService.rejectWithdrawal(id);
      update(id, { status: 'rejected' });
      toast.success('Withdrawal rejected.');
    } catch { toast.error('Failed'); }
  };

  const hold = async (id) => {
    try {
      await adminService.holdWithdrawal(id);
      update(id, { status: 'hold' });
      toast.success('Withdrawal placed on hold.');
    } catch { toast.error('Failed'); }
  };

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter);

  const counts = {
    all: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
    hold: withdrawals.filter(w => w.status === 'hold').length,
  };

  const statusColor = (s) =>
    s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'hold' ? 'info' : 'danger';

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Withdrawal Approvals</h1>
          <p>Review, approve, hold, or reject investor withdrawal requests</p>
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
          {filter === 'all' ? 'All Withdrawals' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Withdrawals`}
        </h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty"><p>No {filter === 'all' ? '' : filter} withdrawals found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Investor</th><th>Amount</th><th>Method</th>
                  <th>Date</th><th>Status</th><th>Notes</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id}>
                    <td>
                      <strong>{w.user?.name || '—'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{w.user?.email}</div>
                    </td>
                    <td><strong>${parseFloat(w.amount).toLocaleString()}</strong></td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{w.method || '—'}</span>
                      <button className="btn btn-ghost btn-sm" style={{ marginLeft: '0.4rem', fontSize: '0.72rem' }}
                        onClick={() => setDetailModal(w)}>
                        Details
                      </button>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge badge-${statusColor(w.status)}`}>{w.status}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setNoteModal(w)}
                        style={{ fontSize: '0.75rem' }} title={w.admin_notes || 'Add note'}>
                        {w.admin_notes ? '📝 Edit' : '+ Note'}
                      </button>
                    </td>
                    <td>
                      {(w.status === 'pending' || w.status === 'hold') && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-success btn-sm" onClick={() => approve(w.id)}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => reject(w.id)}>Reject</button>
                          {w.status === 'pending' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => hold(w.id)}>Hold</button>
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
          withdrawal={noteModal}
          onClose={() => setNoteModal(null)}
          onSave={(id, note) => update(id, { admin_notes: note })}
        />
      )}

      {detailModal && (
        <DetailModal withdrawal={detailModal} onClose={() => setDetailModal(null)} />
      )}
    </div>
  );
}
