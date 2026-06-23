// LOCATION: src/pages/admin/AdminKyc.jsx
import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiEye } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const STATUS_META = {
  not_submitted: { label: 'Not Submitted', color: 'warning' },
  pending:       { label: 'Pending Review', color: 'info'    },
  approved:      { label: 'Verified',       color: 'success' },
  rejected:      { label: 'Rejected',       color: 'danger'  },
};

function RejectModal({ user, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState('reject'); // 'reject' | 'resubmit'
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { toast.error('A reason is required.'); return; }
    setSaving(true);
    try {
      await adminService.rejectKyc(user.id, { reason: reason.trim() });
      toast.success(mode === 'resubmit' ? 'Resubmission requested.' : 'Verification rejected.');
      onDone(user.id, 'rejected');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h3>{mode === 'resubmit' ? 'Request Resubmission' : 'Reject Verification'} — {user.name}</h3>

        <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
          <button className={`btn btn-sm ${mode === 'reject' ? 'btn-danger' : 'btn-ghost'}`}
            onClick={() => setMode('reject')}>Reject</button>
          <button className={`btn btn-sm ${mode === 'resubmit' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('resubmit')}>Request Resubmission</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {mode === 'resubmit' ? 'Instructions for investor' : 'Rejection reason'}
            </label>
            <textarea className="form-control" rows={3} required
              placeholder={mode === 'resubmit'
                ? 'e.g. The ID document was blurry, please resubmit a clearer photo.'
                : 'e.g. ID document does not match provided details.'}
              value={reason} onChange={e => setReason(e.target.value)}
              style={{ resize: 'vertical' }} />
          </div>
          <div className="adm-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className={`btn ${mode === 'reject' ? 'btn-danger' : 'btn-primary'}`} disabled={saving}>
              {saving ? <span className="spinner" /> : mode === 'resubmit' ? 'Send Request' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ userId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.showKycSubmission(userId)
      .then(res => setDetail(res.data?.submission || res.data))
      .catch(() => toast.error('Failed to load submission details.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
      </div>
    </div>
  );

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <h3>KYC Submission — {detail?.name}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
          {[
            ['Full Name', detail?.name],
            ['Email', detail?.email],
            ['Phone', detail?.phone || '—'],
            ['Country', detail?.country || '—'],
            ['Date of Birth', detail?.date_of_birth || '—'],
            ['Address', detail?.address || '—'],
            ['ID Type', detail?.id_type?.replace(/_/g, ' ') || '—'],
            ['ID Number', detail?.id_number || '—'],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{l}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-800)', textTransform: 'capitalize' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Document images */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Government ID</div>
            {detail?.id_document_url ? (
              <a href={detail.id_document_url} target="_blank" rel="noopener noreferrer">
                <img src={detail.id_document_url} alt="ID Document"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', objectFit: 'cover', maxHeight: 180 }} />
              </a>
            ) : <div style={{ padding: '2rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--gray-400)' }}>No document</div>}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Selfie with ID</div>
            {detail?.selfie_url ? (
              <a href={detail.selfie_url} target="_blank" rel="noopener noreferrer">
                <img src={detail.selfie_url} alt="Selfie"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', objectFit: 'cover', maxHeight: 180 }} />
              </a>
            ) : <div style={{ padding: '2rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--gray-400)' }}>No selfie</div>}
          </div>
        </div>

        {detail?.kyc_rejection_reason && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Previous Rejection Reason</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>{detail.kyc_rejection_reason}</div>
          </div>
        )}

        <div className="adm-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminKyc() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [detailUserId, setDetailUserId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);

  const fetchSubmissions = () => {
    adminService.getKycSubmissions()
      .then(res => setSubmissions(res.data?.submissions || []))
      .catch(() => toast.error('Failed to load KYC submissions.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const update = (id, changes) =>
    setSubmissions(s => s.map(x => x.id === id ? { ...x, ...changes } : x));

  const approve = async (user) => {
    if (!window.confirm(`Approve KYC for ${user.name}?`)) return;
    try {
      await adminService.approveKyc(user.id);
      update(user.id, { kyc_status: 'approved' });
      toast.success(`${user.name} verified.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.kyc_status === filter);

  const counts = {
    all:     submissions.length,
    pending: submissions.filter(s => s.kyc_status === 'pending').length,
    approved:submissions.filter(s => s.kyc_status === 'approved').length,
    rejected:submissions.filter(s => s.kyc_status === 'rejected').length,
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>KYC Verification</h1>
          <p>Review and approve investor identity submissions</p>
        </div>
        {counts.pending > 0 && (
          <span className="badge badge-warning" style={{ fontSize: '0.88rem', padding: '0.4rem 1rem' }}>
            {counts.pending} Pending
          </span>
        )}
      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}>
            {f} {counts[f] > 0 && <span style={{ marginLeft: '0.3rem', opacity: 0.7 }}>({counts[f]})</span>}
          </button>
        ))}
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">
          {filter === 'all' ? 'All Submissions' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Submissions`}
        </h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty"><p>No {filter === 'all' ? '' : filter} KYC submissions.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Investor</th><th>ID Type</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{s.email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                      {s.id_type?.replace(/_/g, ' ') || '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_META[s.kyc_status]?.color || 'warning'}`}>
                        {STATUS_META[s.kyc_status]?.label || s.kyc_status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetailUserId(s.id)}>
                          <FiEye size={13} /> View
                        </button>
                        {s.kyc_status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => approve(s)}>
                              <FiCheckCircle size={13} /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(s)}>
                              <FiXCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                        {s.kyc_status === 'approved' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setRejectModal(s)}>
                            Revoke
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

      {detailUserId && (
        <DetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />
      )}

      {rejectModal && (
        <RejectModal
          user={rejectModal}
          onClose={() => setRejectModal(null)}
          onDone={(id, status) => update(id, { kyc_status: status })}
        />
      )}
    </div>
  );
}
