// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { FiArrowLeft, FiUserCheck, FiUserX, FiPlus, FiMinus, FiLock, FiUnlock, FiRotateCcw, FiClock } from 'react-icons/fi';
// import { adminService } from '../../services/api';
// import toast from 'react-hot-toast';
// import './AdminPages.css';

// // ── USER DETAIL ───────────────────────────────────────────────────────────────
// const ADJUSTMENT_LABELS = {
//   add:      { label: 'Added',     color: 'success' },
//   deduct:   { label: 'Deducted',  color: 'danger'  },
//   freeze:   { label: 'Frozen',    color: 'warning' },
//   unfreeze: { label: 'Unfrozen',  color: 'info'    },
//   reset:    { label: 'Reset',     color: 'danger'  },
// };

// function BalanceActionModal({ type, currentBalance, onClose, onSubmit, submitting }) {
//   const [amount, setAmount] = useState('');
//   const [reason, setReason] = useState('');

//   const needsAmount = type === 'add' || type === 'deduct';

//   const COPY = {
//     add:      { title: 'Add to Balance',      cta: 'Add Funds',       icon: FiPlus,      color: 'var(--success)' },
//     deduct:   { title: 'Deduct from Balance', cta: 'Deduct Funds',    icon: FiMinus,     color: 'var(--danger)'  },
//     freeze:   { title: 'Freeze Account',      cta: 'Freeze Account',  icon: FiLock,      color: 'var(--warning)' },
//     unfreeze: { title: 'Unfreeze Account',    cta: 'Unfreeze Account',icon: FiUnlock,    color: 'var(--info)'    },
//     reset:    { title: 'Reset Balance to $0', cta: 'Reset Balance',   icon: FiRotateCcw, color: 'var(--danger)'  },
//   }[type];

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (needsAmount && (!amount || parseFloat(amount) <= 0)) {
//       toast.error('Enter a valid amount.');
//       return;
//     }
//     if (!reason.trim()) {
//       toast.error('A reason is required for the audit log.');
//       return;
//     }
//     onSubmit({ type, amount: needsAmount ? parseFloat(amount) : undefined, reason: reason.trim() });
//   };

//   return (
//     <div className="adm-modal-overlay" onClick={onClose}>
//       <div className="adm-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
//           <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${COPY.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COPY.color, flexShrink: 0 }}>
//             <COPY.icon size={19} />
//           </div>
//           <div>
//             <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 0 }}>{COPY.title}</h3>
//             <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Current balance: ${parseFloat(currentBalance || 0).toLocaleString()}</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit}>
//           {needsAmount && (
//             <div className="form-group">
//               <label className="form-label">Amount ($)</label>
//               <input
//                 type="number" min="0.01" step="0.01" className="form-control" required autoFocus
//                 placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
//               />
//             </div>
//           )}
//           <div className="form-group">
//             <label className="form-label">Reason</label>
//             <textarea
//               className="form-control" rows={3} required autoFocus={!needsAmount}
//               placeholder={
//                 type === 'add' ? 'e.g. Manual profit credit for Q2 performance' :
//                 type === 'deduct' ? 'e.g. Service charge deduction' :
//                 type === 'freeze' ? 'e.g. Suspicious activity under review' :
//                 type === 'unfreeze' ? 'e.g. Review complete, account cleared' :
//                 'e.g. Account reset per investor request'
//               }
//               value={reason} onChange={e => setReason(e.target.value)}
//               style={{ resize: 'vertical' }}
//             />
//             <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.3rem' }}>
//               This note is permanently recorded in the audit log.
//             </div>
//           </div>
//           <div className="adm-modal-footer">
//             <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
//               Cancel
//             </button>
//             <button type="submit" className="btn btn-primary" disabled={submitting}>
//               {submitting ? <span className="spinner" /> : COPY.cta}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export function AdminUserDetail() {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeModal, setActiveModal] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   const fetchUser = () => {
//     adminService.showUser(id)
//       .then(res => setData(res.data))
//       .catch(() => toast.error('Failed to load investor'))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => { fetchUser(); }, [id]);

//   const handleBalanceAction = async (payload) => {
//     setSubmitting(true);
//     try {
//       const res = await adminService.adjustBalance(id, payload);
//       toast.success(res.data?.message || 'Balance updated.');
//       setActiveModal(null);
//       fetchUser();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to apply adjustment.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}>Loading…</div>;
//   if (!data?.user) return <div style={{ textAlign:'center', padding:'3rem', color:'var(--danger)' }}>Investor not found</div>;

//   const { user, investments = [], balance_history = [] } = data;
//   const isFrozen = user.status === 'frozen';

//   return (
//     <div className="adm-page">
//       <div className="adm-page-header">
//         <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
//           <Link to="/admin/users" className="btn btn-ghost btn-sm"><FiArrowLeft /> Back</Link>
//           <div><h1>{user.name}</h1><p>Investor Profile</p></div>
//         </div>
//       </div>

//       <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.5rem', alignItems:'start' }}>
//         <div className="adm-card" style={{ textAlign:'center' }}>
//           <div className="profile-big-avatar" style={{ margin:'0 auto 1rem' }}>
//             {(user.name||'?').charAt(0).toUpperCase()}
//           </div>
//           <h3>{user.name}</h3>
//           <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>{user.email}</p>
//           <span className={`badge badge-${isFrozen ? 'warning' : user.status==='active' ? 'success' : 'danger'}`}>
//             {isFrozen ? 'Frozen' : (user.status || 'active')}
//           </span>
//           <div style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
//             <button className="btn btn-success btn-sm" onClick={async()=>{try{await adminService.activateUser(id);setData(d=>({...d,user:{...d.user,status:'active'}}));toast.success('Activated');}catch{toast.error('Failed');}}}><FiUserCheck/> Activate</button>
//             <button className="btn btn-danger btn-sm"  onClick={async()=>{try{await adminService.suspendUser(id);setData(d=>({...d,user:{...d.user,status:'suspended'}}));toast.success('Suspended');}catch{toast.error('Failed');}}}><FiUserX/>  Suspend</button>
//           </div>
//         </div>

//         <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
//           <div className="adm-card">
//             <h3 className="adm-card__title">Account Information</h3>
//             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
//               {[
//                 ['Full Name', user.name], ['Email', user.email], ['Phone', user.phone||'—'],
//                 ['Country', user.country||'—'], ['Balance', `$${parseFloat(user.balance||0).toLocaleString()}`],
//                 ['Total Invested', `$${parseFloat(user.total_invested||0).toLocaleString()}`],
//                 ['Total Profit', `$${parseFloat(user.total_profit||0).toLocaleString()}`],
//                 ['Member Since', user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'],
//               ].map(([l,v]) => (
//                 <div key={l}>
//                   <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginBottom:'0.25rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
//                   <div style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--gray-800)' }}>{v}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="adm-card">
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
//               <h3 className="adm-card__title" style={{ marginBottom: 0 }}>Balance Management</h3>
//               <span style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--navy)' }}>
//                 ${parseFloat(user.balance||0).toLocaleString()}
//               </span>
//             </div>
//             <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'0.6rem' }}>
//               <button className="btn btn-success btn-sm" onClick={() => setActiveModal('add')}>
//                 <FiPlus size={14} /> Add
//               </button>
//               <button className="btn btn-danger btn-sm" onClick={() => setActiveModal('deduct')}>
//                 <FiMinus size={14} /> Deduct
//               </button>
//               {isFrozen ? (
//                 <button className="btn btn-warning-outline btn-sm" onClick={() => setActiveModal('unfreeze')}>
//                   <FiUnlock size={14} /> Unfreeze
//                 </button>
//               ) : (
//                 <button className="btn btn-warning-outline btn-sm" onClick={() => setActiveModal('freeze')}>
//                   <FiLock size={14} /> Freeze
//                 </button>
//               )}
//               <button className="btn btn-ghost btn-sm" onClick={() => setActiveModal('reset')}>
//                 <FiRotateCcw size={14} /> Reset
//               </button>
//             </div>

//             <div style={{ marginTop:'1.5rem' }}>
//               <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
//                 <FiClock size={14} style={{ color:'var(--gray-400)' }} />
//                 <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
//                   Adjustment History
//                 </span>
//               </div>
//               {balance_history.length === 0 ? (
//                 <div style={{ fontSize:'0.85rem', color:'var(--gray-400)', padding:'1rem 0' }}>
//                   No adjustments have been made to this account yet.
//                 </div>
//               ) : (
//                 <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
//                   {balance_history.map(h => (
//                     <div key={h.id} style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.75rem', background:'var(--gray-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--gray-200)' }}>
//                       <span className={`badge badge-${ADJUSTMENT_LABELS[h.type]?.color || 'info'}`} style={{ flexShrink:0 }}>
//                         {ADJUSTMENT_LABELS[h.type]?.label || h.type}
//                       </span>
//                       <div style={{ flex:1, minWidth:0 }}>
//                         <div style={{ fontSize:'0.85rem', color:'var(--gray-700)' }}>{h.reason}</div>
//                         <div style={{ fontSize:'0.74rem', color:'var(--gray-400)', marginTop:'0.2rem' }}>
//                           {(h.type === 'add' || h.type === 'deduct') && `$${parseFloat(h.amount).toLocaleString()} · `}
//                           ${parseFloat(h.balance_before).toLocaleString()} → ${parseFloat(h.balance_after).toLocaleString()}
//                           {' · '}{h.admin_name}{' · '}{new Date(h.created_at).toLocaleString()}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {investments.length > 0 && (
//             <div className="adm-card">
//               <h3 className="adm-card__title">Investment Portfolio</h3>
//               <div className="table-wrap">
//                 <table>
//                   <thead><tr><th>Plan</th><th>Amount</th><th>ROI</th><th>Status</th></tr></thead>
//                   <tbody>
//                     {investments.map(i => (
//                       <tr key={i.id}>
//                         <td>{i.plan_name||'—'}</td>
//                         <td>${parseFloat(i.amount||0).toLocaleString()}</td>
//                         <td style={{color:'var(--success)',fontWeight:700}}>+{i.profit_percent||0}%</td>
//                         <td><span className={`badge badge-${i.status==='active'?'success':'info'}`}>{i.status}</span></td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {activeModal && (
//         <BalanceActionModal
//           type={activeModal}
//           currentBalance={user.balance}
//           onClose={() => setActiveModal(null)}
//           onSubmit={handleBalanceAction}
//           submitting={submitting}
//         />
//       )}
//     </div>
//   );
// }

// // // ── DEPOSITS ──────────────────────────────────────────────────────────────────
// // export function AdminDeposits() {
// //   const [deposits, setDeposits] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     adminService.getDeposits()
// //       .then(res => setDeposits(res.data?.deposits || res.data || []))
// //       .catch(() => toast.error('Failed'))
// //       .finally(() => setLoading(false));
// //   }, []);

// //   const approve = async (id) => {
// //     try { await adminService.approveDeposit(id); setDeposits(d => d.map(x => x.id===id ? {...x, status:'approved'} : x)); toast.success('Deposit approved!'); }
// //     catch { toast.error('Failed'); }
// //   };
// //   const reject = async (id) => {
// //     try { await adminService.rejectDeposit(id); setDeposits(d => d.map(x => x.id===id ? {...x, status:'rejected'} : x)); toast.success('Deposit rejected'); }
// //     catch { toast.error('Failed'); }
// //   };

// //   return (
// //     <div className="adm-page">
// //       <div className="adm-page-header"><div><h1>Deposit Management</h1><p>Review and approve investor deposits</p></div></div>
// //       <div className="adm-card">
// //         <h3 className="adm-card__title">All Deposits</h3>
// //         {loading ? <div style={{ textAlign:'center',padding:'2rem',color:'var(--gray-400)' }}>Loading…</div> : (
// //           <div className="table-wrap">
// //             <table>
// //               <thead><tr><th>Investor</th><th>Amount</th><th>Method</th><th>Reference</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
// //               <tbody>
// //                 {deposits.map(d => (
// //                   <tr key={d.id}>
// //                     <td><strong>{d.user?.name || '—'}</strong></td>
// //                     <td><strong>${parseFloat(d.amount).toLocaleString()}</strong></td>
// //                     <td style={{textTransform:'capitalize'}}>{d.payment_method||d.method||'—'}</td>
// //                     <td><code style={{fontSize:'0.75rem',background:'var(--gray-100)',padding:'0.1rem 0.4rem',borderRadius:4}}>{(d.reference||'—').slice(0,16)}</code></td>
// //                     <td style={{fontSize:'0.82rem'}}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
// //                     <td><span className={`badge badge-${d.status==='approved'?'success':d.status==='pending'?'warning':'danger'}`}>{d.status}</span></td>
// //                     <td>
// //                       {d.status === 'pending' && (
// //                         <div style={{display:'flex',gap:'0.4rem'}}>
// //                           <button className="btn btn-success btn-sm" onClick={() => approve(d.id)}>Approve</button>
// //                           <button className="btn btn-danger btn-sm"  onClick={() => reject(d.id)}>Reject</button>
// //                         </div>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // ── WITHDRAWALS ───────────────────────────────────────────────────────────────
// // export function AdminWithdrawals() {
// //   const [withdrawals, setWithdrawals] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     adminService.getWithdrawals()
// //       .then(res => setWithdrawals(res.data?.withdrawals || res.data || []))
// //       .catch(() => toast.error('Failed'))
// //       .finally(() => setLoading(false));
// //   }, []);

// //   const approve = async (id) => {
// //     try { await adminService.approveWithdrawal(id); setWithdrawals(w => w.map(x => x.id===id ? {...x,status:'approved'} : x)); toast.success('Approved!'); }
// //     catch { toast.error('Failed'); }
// //   };
// //   const reject = async (id) => {
// //     try { await adminService.rejectWithdrawal(id); setWithdrawals(w => w.map(x => x.id===id ? {...x,status:'rejected'} : x)); toast.success('Rejected'); }
// //     catch { toast.error('Failed'); }
// //   };

// //   const pending = withdrawals.filter(w => w.status === 'pending');

// //   return (
// //     <div className="adm-page">
// //       <div className="adm-page-header">
// //         <div><h1>Withdrawal Approvals</h1><p>Approve or reject withdrawal requests</p></div>
// //         {pending.length > 0 && <span className="badge badge-warning" style={{fontSize:'0.88rem',padding:'0.4rem 1rem'}}>{pending.length} Pending</span>}
// //       </div>
// //       <div className="adm-card">
// //         <h3 className="adm-card__title">All Withdrawals</h3>
// //         {loading ? <div style={{textAlign:'center',padding:'2rem',color:'var(--gray-400)'}}>Loading…</div> : (
// //           <div className="table-wrap">
// //             <table>
// //               <thead><tr><th>Investor</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
// //               <tbody>
// //                 {withdrawals.map(w => (
// //                   <tr key={w.id}>
// //                     <td><strong>{w.user?.name || '—'}</strong></td>
// //                     <td><strong>${parseFloat(w.amount).toLocaleString()}</strong></td>
// //                     <td style={{textTransform:'capitalize'}}>{w.method||w.withdrawal_method||'—'}</td>
// //                     <td style={{fontSize:'0.82rem'}}>{w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}</td>
// //                     <td><span className={`badge badge-${w.status==='approved'?'success':w.status==='pending'?'warning':'danger'}`}>{w.status}</span></td>
// //                     <td>
// //                       {w.status === 'pending' && (
// //                         <div style={{display:'flex',gap:'0.4rem'}}>
// //                           <button className="btn btn-success btn-sm" onClick={() => approve(w.id)}>Approve</button>
// //                           <button className="btn btn-danger btn-sm"  onClick={() => reject(w.id)}>Reject</button>
// //                         </div>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // ── INVESTMENTS ───────────────────────────────────────────────────────────────
// // export function AdminInvestments() {
// //   const [investments, setInvestments] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     adminService.getInvestments()
// //       .then(res => setInvestments(res.data?.investments || res.data || []))
// //       .catch(() => toast.error('Failed'))
// //       .finally(() => setLoading(false));
// //   }, []);

// //   return (
// //     <div className="adm-page">
// //       <div className="adm-page-header"><div><h1>Investment Management</h1><p>Monitor all active investment accounts</p></div></div>
// //       <div className="adm-card">
// //         <h3 className="adm-card__title">All Investments</h3>
// //         {loading ? <div style={{textAlign:'center',padding:'2rem',color:'var(--gray-400)'}}>Loading…</div> : (
// //           <div className="table-wrap">
// //             <table>
// //               <thead><tr><th>Investor</th><th>Plan</th><th>Amount</th><th>ROI</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
// //               <tbody>
// //                 {investments.map(inv => (
// //                   <tr key={inv.id}>
// //                     <td><strong>{inv.user?.name||'—'}</strong></td>
// //                     <td>{inv.plan?.name||'—'}</td>
// //                     <td><strong>${parseFloat(inv.amount||0).toLocaleString()}</strong></td>
// //                     <td><span style={{color:'var(--success)',fontWeight:700}}>+{inv.profit_percent||0}%</span></td>
// //                     <td style={{fontSize:'0.82rem'}}>{inv.start_date ? new Date(inv.start_date).toLocaleDateString() : '—'}</td>
// //                     <td style={{fontSize:'0.82rem'}}>{inv.end_date ? new Date(inv.end_date).toLocaleDateString() : '—'}</td>
// //                     <td><span className={`badge badge-${inv.status==='active'?'success':inv.status==='completed'?'info':'warning'}`}>{inv.status}</span></td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // ── MESSAGES ──────────────────────────────────────────────────────────────────
// // export function AdminMessages() {
// //   const [messages, setMessages] = useState([]);
// //   const [selected, setSelected] = useState(null);
// //   const [detail, setDetail] = useState(null);
// //   const [reply, setReply] = useState('');
// //   const [loading, setLoading] = useState(true);
// //   const [sending, setSending] = useState(false);

// //   useEffect(() => {
// //     adminService.getMessages()
// //       .then(res => setMessages(res.data?.messages || res.data || []))
// //       .catch(() => toast.error('Failed'))
// //       .finally(() => setLoading(false));
// //   }, []);

// //   const openMsg = async (msg) => {
// //     setSelected(msg.id);
// //     try { const res = await adminService.showMessage(msg.id); setDetail(res.data?.message || res.data); }
// //     catch { toast.error('Failed to load'); }
// //   };

// //   const sendReply = async () => {
// //     if (!reply.trim() || !selected) return;
// //     setSending(true);
// //     try {
// //       await adminService.replyMessage(selected, { message: reply });
// //       toast.success('Reply sent!');
// //       setReply('');
// //       const res = await adminService.showMessage(selected);
// //       setDetail(res.data?.message || res.data);
// //     } catch { toast.error('Failed to send reply'); }
// //     finally { setSending(false); }
// //   };

// //   return (
// //     <div className="adm-page">
// //       <div className="adm-page-header"><div><h1>Message Center</h1><p>Respond to investor support requests</p></div></div>
// //       <div className="msg-layout">
// //         <div className="adm-card msg-inbox">
// //           <h3 className="adm-card__title" style={{marginBottom:'1rem'}}>Inbox ({messages.length})</h3>
// //           {loading ? <div style={{textAlign:'center',padding:'1.5rem',color:'var(--gray-400)'}}>Loading…</div> :
// //             messages.length === 0 ? <div className="adm-empty"><p>No messages</p></div> : (
// //               <div className="msg-list">
// //                 {messages.map(msg => (
// //                   <div key={msg.id} className={`msg-item ${selected===msg.id?'msg-item-selected':''}`} onClick={() => openMsg(msg)}>
// //                     <div className="msg-avatar">{(msg.user?.name||'?').charAt(0).toUpperCase()}</div>
// //                     <div className="msg-item__body">
// //                       <div className="msg-item__top">
// //                         <span className="msg-item__name">{msg.user?.name||'Investor'}</span>
// //                         <span className="msg-item__time">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}</span>
// //                       </div>
// //                       <div className="msg-item__subject">{msg.subject||'No subject'}</div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //           )}
// //         </div>
// //         <div className="adm-card msg-detail">
// //           {detail ? (
// //             <>
// //               <h3>{detail.subject}</h3>
// //               <p style={{fontSize:'0.78rem',color:'var(--gray-400)',marginBottom:'1.5rem'}}>{detail.user?.name} • {detail.created_at ? new Date(detail.created_at).toLocaleString() : ''}</p>
// //               <div className="msg-bubble msg-bubble-in"><small>Investor</small><p>{detail.message||detail.body}</p></div>
// //               {(detail.replies||[]).map((r,i) => (
// //                 <div key={i} className={`msg-bubble ${r.is_admin?'msg-bubble-out':'msg-bubble-in'}`}>
// //                   <small>{r.is_admin?'Support Team':'Investor'}</small><p>{r.message}</p>
// //                 </div>
// //               ))}
// //               <div style={{display:'flex',gap:'0.75rem',marginTop:'1.5rem'}}>
// //                 <textarea className="form-control" rows={3} placeholder="Type your reply…" value={reply} onChange={e => setReply(e.target.value)} style={{resize:'none'}} />
// //                 <button className="btn btn-primary" onClick={sendReply} disabled={sending} style={{flexShrink:0}}>
// //                   {sending ? <span className="spinner"/> : 'Send Reply'}
// //                 </button>
// //               </div>
// //             </>
// //           ) : (
// //             <div className="adm-empty"><p>Select a message to view the conversation</p></div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
// export function AdminAnnouncements() {
//   const [announcements, setAnnouncements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ title:'', content:'', type:'info' });
//   const [saving, setSaving] = useState(false);

//   const fetch = () => {
//     adminService.getAnnouncements()
//       .then(res => setAnnouncements(res.data?.announcements || res.data || []))
//       .catch(() => toast.error('Failed'))
//       .finally(() => setLoading(false));
//   };
//   useEffect(fetch, []);

//   const handleSave = async (e) => {
//     e.preventDefault(); setSaving(true);
//     try {
//       await adminService.storeAnnouncement(form);
//       toast.success('Announcement published!');
//       setShowForm(false); setForm({ title:'', content:'', type:'info' }); fetch();
//     } catch { toast.error('Failed to publish'); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this announcement?')) return;
//     try { await adminService.deleteAnnouncement(id); setAnnouncements(a => a.filter(x => x.id !== id)); toast.success('Deleted'); }
//     catch { toast.error('Failed'); }
//   };

//   return (
//     <div className="adm-page">
//       <div className="adm-page-header">
//         <div><h1>Announcements</h1><p>Post announcements visible to all investors</p></div>
//         <button className="btn btn-gold" onClick={() => setShowForm(v=>!v)}>+ New Announcement</button>
//       </div>
//       {showForm && (
//         <div className="adm-card" style={{maxWidth:600}}>
//           <h3 className="adm-card__title" style={{marginBottom:'1.5rem'}}>New Announcement</h3>
//           <form onSubmit={handleSave}>
//             <div className="form-group"><label className="form-label">Title</label><input className="form-control" required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
//             <div className="form-group"><label className="form-label">Type</label>
//               <select className="form-control" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
//                 <option value="info">Information</option><option value="warning">Warning</option><option value="success">Success</option>
//               </select>
//             </div>
//             <div className="form-group"><label className="form-label">Content</label><textarea className="form-control" rows={4} required value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} style={{resize:'vertical'}} /></div>
//             <div style={{display:'flex',gap:'0.75rem'}}>
//               <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
//               <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<span className="spinner"/>:'Publish'}</button>
//             </div>
//           </form>
//         </div>
//       )}
//       <div className="adm-card">
//         <h3 className="adm-card__title" style={{marginBottom:'1.25rem'}}>Published Announcements</h3>
//         {loading ? <div style={{textAlign:'center',padding:'2rem',color:'var(--gray-400)'}}>Loading…</div> :
//           announcements.length === 0 ? <div className="adm-empty"><p>No announcements yet</p></div> : (
//             <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//               {announcements.map(a => (
//                 <div key={a.id} style={{display:'flex',alignItems:'flex-start',gap:'1rem',padding:'1.25rem',background:'var(--gray-50)',borderRadius:'var(--radius-md)',border:'1px solid var(--gray-200)'}}>
//                   <span className={`badge badge-${a.type==='warning'?'warning':a.type==='success'?'success':'info'}`} style={{flexShrink:0}}>{a.type||'info'}</span>
//                   <div style={{flex:1}}>
//                     <strong style={{fontSize:'0.9rem',color:'var(--navy)'}}>{a.title}</strong>
//                     <p style={{fontSize:'0.85rem',color:'var(--gray-500)',marginTop:'0.3rem'}}>{a.content||a.message}</p>
//                     <small style={{fontSize:'0.75rem',color:'var(--gray-400)'}}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</small>
//                   </div>
//                   <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
//                 </div>
//               ))}
//             </div>
//           )
//         }
//       </div>
//     </div>
//   );
// }

// // // ── PLANS ─────────────────────────────────────────────────────────────────────
// // export function AdminPlans() {
// //   const [plans, setPlans] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showForm, setShowForm] = useState(false);
// //   const [form, setForm] = useState({ name:'', description:'', min_amount:'', max_amount:'', profit_percent:'', duration_days:'', is_featured:false });
// //   const [saving, setSaving] = useState(false);

// //   const fetch = () => {
// //     adminService.getPlans()
// //       .then(res => setPlans(res.data?.plans || res.data || []))
// //       .catch(() => toast.error('Failed'))
// //       .finally(() => setLoading(false));
// //   };
// //   useEffect(fetch, []);

// //   const handleSave = async (e) => {
// //     e.preventDefault(); setSaving(true);
// //     try { await adminService.storePlan(form); toast.success('Plan created!'); setShowForm(false); fetch(); }
// //     catch { toast.error('Failed'); }
// //     finally { setSaving(false); }
// //   };

// //   const handleDelete = async (id) => {
// //     if (!confirm('Delete this plan?')) return;
// //     try { await adminService.deletePlan(id); setPlans(p => p.filter(x => x.id !== id)); toast.success('Plan deleted'); }
// //     catch { toast.error('Failed'); }
// //   };

// //   return (
// //     <div className="adm-page">
// //       <div className="adm-page-header">
// //         <div><h1>Investment Plans</h1><p>Manage available investment plans for investors</p></div>
// //         <button className="btn btn-gold" onClick={() => setShowForm(v=>!v)}>+ New Plan</button>
// //       </div>
// //       {showForm && (
// //         <div className="adm-card" style={{maxWidth:600}}>
// //           <h3 className="adm-card__title" style={{marginBottom:'1.5rem'}}>Create Investment Plan</h3>
// //           <form onSubmit={handleSave}>
// //             <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
// //               <div className="form-group"><label className="form-label">Plan Name</label><input className="form-control" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Starter Plan"/></div>
// //               <div className="form-group"><label className="form-label">Profit % (monthly)</label><input type="number" className="form-control" required value={form.profit_percent} onChange={e=>setForm(f=>({...f,profit_percent:e.target.value}))} placeholder="7"/></div>
// //               <div className="form-group"><label className="form-label">Min Amount ($)</label><input type="number" className="form-control" required value={form.min_amount} onChange={e=>setForm(f=>({...f,min_amount:e.target.value}))} placeholder="1000"/></div>
// //               <div className="form-group"><label className="form-label">Max Amount ($)</label><input type="number" className="form-control" value={form.max_amount} onChange={e=>setForm(f=>({...f,max_amount:e.target.value}))} placeholder="4999"/></div>
// //               <div className="form-group"><label className="form-label">Duration (days)</label><input type="number" className="form-control" required value={form.duration_days} onChange={e=>setForm(f=>({...f,duration_days:e.target.value}))} placeholder="30"/></div>
// //               <div className="form-group" style={{display:'flex',alignItems:'center',gap:'0.75rem',paddingTop:'1.5rem'}}>
// //                 <input type="checkbox" id="featured" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))} style={{width:16,height:16}}/>
// //                 <label htmlFor="featured" style={{fontSize:'0.88rem',fontWeight:600,color:'var(--gray-700)'}}>Featured Plan</label>
// //               </div>
// //             </div>
// //             <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{resize:'vertical'}} /></div>
// //             <div style={{display:'flex',gap:'0.75rem'}}>
// //               <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
// //               <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<span className="spinner"/>:'Create Plan'}</button>
// //             </div>
// //           </form>
// //         </div>
// //       )}
// //       <div className="adm-card">
// //         <h3 className="adm-card__title" style={{marginBottom:'1.25rem'}}>All Investment Plans</h3>
// //         {loading ? <div style={{textAlign:'center',padding:'2rem',color:'var(--gray-400)'}}>Loading…</div> :
// //           plans.length === 0 ? <div className="adm-empty"><p>No plans yet. Create your first plan.</p></div> : (
// //             <div className="table-wrap">
// //               <table>
// //                 <thead><tr><th>Plan Name</th><th>Min Amount</th><th>Max Amount</th><th>ROI</th><th>Duration</th><th>Featured</th><th>Actions</th></tr></thead>
// //                 <tbody>
// //                   {plans.map(p => (
// //                     <tr key={p.id}>
// //                       <td><strong>{p.name}</strong></td>
// //                       <td>${parseFloat(p.min_amount||0).toLocaleString()}</td>
// //                       <td>{p.max_amount ? `$${parseFloat(p.max_amount).toLocaleString()}` : 'No limit'}</td>
// //                       <td><span style={{color:'var(--success)',fontWeight:700}}>{p.profit_percent}%</span></td>
// //                       <td>{p.duration_days} days</td>
// //                       <td>{p.is_featured ? <span className="badge badge-gold">Yes</span> : '—'}</td>
// //                       <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button></td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           )
// //         }
// //       </div>
// //     </div>
// //   );
// // }