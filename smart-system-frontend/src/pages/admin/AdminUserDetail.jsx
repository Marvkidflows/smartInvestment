// LOCATION: src/pages/admin/AdminUserDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUserCheck, FiUserX, FiPlus, FiMinus, FiLock, FiUnlock, FiRotateCcw, FiClock } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const ADJUSTMENT_LABELS = {
  add:      { label: 'Added',     color: 'success' },
  deduct:   { label: 'Deducted',  color: 'danger'  },
  freeze:   { label: 'Frozen',    color: 'warning' },
  unfreeze: { label: 'Unfrozen',  color: 'info'    },
  reset:    { label: 'Reset',     color: 'danger'  },
};

function BalanceActionModal({ type, currentBalance, onClose, onSubmit, submitting }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const needsAmount = type === 'add' || type === 'deduct';

  const COPY = {
    add:      { title: 'Add to Balance',      cta: 'Add Funds',       icon: FiPlus,      color: 'var(--success)' },
    deduct:   { title: 'Deduct from Balance', cta: 'Deduct Funds',    icon: FiMinus,     color: 'var(--danger)'  },
    freeze:   { title: 'Freeze Account',      cta: 'Freeze Account',  icon: FiLock,      color: 'var(--warning)' },
    unfreeze: { title: 'Unfreeze Account',    cta: 'Unfreeze Account',icon: FiUnlock,    color: 'var(--info)'    },
    reset:    { title: 'Reset Balance to $0', cta: 'Reset Balance',   icon: FiRotateCcw, color: 'var(--danger)'  },
  }[type];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (needsAmount && (!amount || parseFloat(amount) <= 0)) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (!reason.trim()) {
      toast.error('A reason is required for the audit log.');
      return;
    }
    onSubmit({ type, amount: needsAmount ? parseFloat(amount) : undefined, reason: reason.trim() });
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${COPY.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COPY.color, flexShrink: 0 }}>
            <COPY.icon size={19} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 0 }}>{COPY.title}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Current balance: ${parseFloat(currentBalance || 0).toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {needsAmount && (
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number" min="0.01" step="0.01" className="form-control" required autoFocus
                placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea
              className="form-control" rows={3} required autoFocus={!needsAmount}
              placeholder={
                type === 'add' ? 'e.g. Manual profit credit for Q2 performance' :
                type === 'deduct' ? 'e.g. Service charge deduction' :
                type === 'freeze' ? 'e.g. Suspicious activity under review' :
                type === 'unfreeze' ? 'e.g. Review complete, account cleared' :
                'e.g. Account reset per investor request'
              }
              value={reason} onChange={e => setReason(e.target.value)}
              style={{ resize: 'vertical' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.3rem' }}>
              This note is permanently recorded in the audit log.
            </div>
          </div>
          <div className="adm-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : COPY.cta}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUser = () => {
    adminService.showUser(id)
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load investor'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleBalanceAction = async (payload) => {
    setSubmitting(true);
    try {
      const res = await adminService.adjustBalance(id, payload);
      toast.success(res.data?.message || 'Balance updated.');
      setActiveModal(null);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}>Loading…</div>;
  if (!data?.user) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--danger)' }}>Investor not found</div>;

  const { user, investments = [], balance_history = [] } = data;
  const isFrozen = user.status === 'frozen';

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <Link to="/admin/users" className="btn btn-ghost btn-sm"><FiArrowLeft /> Back</Link>
          <div><h1>{user.name}</h1><p>Investor Profile</p></div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.5rem', alignItems:'start' }}>
        <div className="adm-card" style={{ textAlign:'center' }}>
          <div className="profile-big-avatar" style={{ margin:'0 auto 1rem' }}>
            {(user.name||'?').charAt(0).toUpperCase()}
          </div>
          <h3>{user.name}</h3>
          <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>{user.email}</p>
          <span className={`badge badge-${isFrozen ? 'warning' : user.status==='active' ? 'success' : 'danger'}`}>
            {isFrozen ? 'Frozen' : (user.status || 'active')}
          </span>
          <div style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <button className="btn btn-success btn-sm" onClick={async()=>{try{await adminService.activateUser(id);setData(d=>({...d,user:{...d.user,status:'active'}}));toast.success('Activated');}catch{toast.error('Failed');}}}><FiUserCheck/> Activate</button>
            <button className="btn btn-danger btn-sm"  onClick={async()=>{try{await adminService.suspendUser(id);setData(d=>({...d,user:{...d.user,status:'suspended'}}));toast.success('Suspended');}catch{toast.error('Failed');}}}><FiUserX/>  Suspend</button>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="adm-card">
            <h3 className="adm-card__title">Account Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                ['Full Name', user.name], ['Email', user.email], ['Phone', user.phone||'—'],
                ['Country', user.country||'—'], ['Balance', `$${parseFloat(user.balance||0).toLocaleString()}`],
                ['Total Invested', `$${parseFloat(user.total_invested||0).toLocaleString()}`],
                ['Total Profit', `$${parseFloat(user.total_profit||0).toLocaleString()}`],
                ['Member Since', user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'],
              ].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginBottom:'0.25rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
                  <div style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--gray-800)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <h3 className="adm-card__title" style={{ marginBottom: 0 }}>Balance Management</h3>
              <span style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--navy)' }}>
                ${parseFloat(user.balance||0).toLocaleString()}
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'0.6rem' }}>
              <button className="btn btn-success btn-sm" onClick={() => setActiveModal('add')}>
                <FiPlus size={14} /> Add
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setActiveModal('deduct')}>
                <FiMinus size={14} /> Deduct
              </button>
              {isFrozen ? (
                <button className="btn btn-warning-outline btn-sm" onClick={() => setActiveModal('unfreeze')}>
                  <FiUnlock size={14} /> Unfreeze
                </button>
              ) : (
                <button className="btn btn-warning-outline btn-sm" onClick={() => setActiveModal('freeze')}>
                  <FiLock size={14} /> Freeze
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveModal('reset')}>
                <FiRotateCcw size={14} /> Reset
              </button>
            </div>

            <div style={{ marginTop:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <FiClock size={14} style={{ color:'var(--gray-400)' }} />
                <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Adjustment History
                </span>
              </div>
              {balance_history.length === 0 ? (
                <div style={{ fontSize:'0.85rem', color:'var(--gray-400)', padding:'1rem 0' }}>
                  No adjustments have been made to this account yet.
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {balance_history.map(h => (
                    <div key={h.id} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.75rem', background:'var(--gray-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--gray-200)' }}>
                      <span className={`badge badge-${ADJUSTMENT_LABELS[h.type]?.color || 'info'}`} style={{ flexShrink:0 }}>
                        {ADJUSTMENT_LABELS[h.type]?.label || h.type}
                      </span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.85rem', color:'var(--gray-700)' }}>{h.reason}</div>
                        <div style={{ fontSize:'0.74rem', color:'var(--gray-400)', marginTop:'0.2rem' }}>
                          {(h.type === 'add' || h.type === 'deduct') && `$${parseFloat(h.amount).toLocaleString()} · `}
                          ${parseFloat(h.balance_before).toLocaleString()} → ${parseFloat(h.balance_after).toLocaleString()}
                          {' · '}{h.admin_name}{' · '}{new Date(h.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {investments.length > 0 && (
            <div className="adm-card">
              <h3 className="adm-card__title">Investment Portfolio</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Plan</th><th>Amount</th><th>ROI</th><th>Status</th></tr></thead>
                  <tbody>
                    {investments.map(i => (
                      <tr key={i.id}>
                        <td>{i.plan_name||'—'}</td>
                        <td>${parseFloat(i.amount||0).toLocaleString()}</td>
                        <td style={{color:'var(--success)',fontWeight:700}}>+{i.profit_percent||0}%</td>
                        <td><span className={`badge badge-${i.status==='active'?'success':'info'}`}>{i.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeModal && (
        <BalanceActionModal
          type={activeModal}
          currentBalance={user.balance}
          onClose={() => setActiveModal(null)}
          onSubmit={handleBalanceAction}
          submitting={submitting}
        />
      )}
    </div>
  );
}
