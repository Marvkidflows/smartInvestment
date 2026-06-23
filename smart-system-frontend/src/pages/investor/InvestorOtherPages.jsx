// ── PROFILE ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { FiUser, FiSave, FiBell, FiGift, FiCopy } from 'react-icons/fi';
import { investorService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import './InvestorPages.css';

// export function InvestorProfile() {
//   const { user } = useAuthStore();
//   const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', city:'', country:'' });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     investorService.getProfile()
//       .then(res => {
//         const p = res.data?.user || res.data?.profile || res.data || {};
//         setForm({ name: p.name||'', email: p.email||'', phone: p.phone||'', address: p.address||'', city: p.city||'', country: p.country||'' });
//       })
//       .catch(() => {
//         if (user) setForm({ name: user.name||'', email: user.email||'', phone:'', address:'', city:'', country:'' });
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       await investorService.updateProfile(form);
//       toast.success('Profile updated successfully!');
//     } catch {
//       toast.error('Failed to update profile');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <div className="inv-loading">Loading profile…</div>;

//   return (
//     <div className="inv-page">
//       <div className="inv-page__header">
//         <div><h1>My Profile</h1><p>Manage your personal information and preferences</p></div>
//       </div>

//       <div className="profile-grid">
//         {/* AVATAR CARD */}
//         <div className="inv-card profile-avatar-card">
//           <div className="profile-big-avatar">
//             {(form.name || user?.name || 'U').charAt(0).toUpperCase()}
//           </div>
//           <h3>{form.name || user?.name || 'Investor'}</h3>
//           <p>{form.email || user?.email}</p>
//           <span className="badge badge-success">● Verified</span>
//           <div style={{ marginTop:'1.5rem', padding:'1rem', background:'var(--gray-50)', borderRadius:'var(--radius-md)', textAlign:'left' }}>
//             <div style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginBottom:'0.35rem' }}>Account ID</div>
//             <div style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'var(--navy)', fontWeight:600 }}>
//               #{user?.id || '000001'}
//             </div>
//           </div>
//         </div>

//         {/* FORM */}
//         <div className="inv-card">
//           <h3 className="inv-card__title" style={{ marginBottom:'1.5rem' }}>Personal Information</h3>
//           <form onSubmit={handleSave}>
//             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
//               <div className="form-group">
//                 <label className="form-label">Full Name</label>
//                 <input className="form-control" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Email Address</label>
//                 <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))} />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Phone Number</label>
//                 <input className="form-control" value={form.phone} onChange={e => setForm(f => ({...f, phone:e.target.value}))} />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Country</label>
//                 <input className="form-control" value={form.country} onChange={e => setForm(f => ({...f, country:e.target.value}))} />
//               </div>
//               <div className="form-group" style={{ gridColumn:'1/-1' }}>
//                 <label className="form-label">Address</label>
//                 <input className="form-control" value={form.address} onChange={e => setForm(f => ({...f, address:e.target.value}))} />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">City</label>
//                 <input className="form-control" value={form.city} onChange={e => setForm(f => ({...f, city:e.target.value}))} />
//               </div>
//             </div>
//             <button type="submit" className="btn btn-primary" disabled={saving}>
//               {saving ? <span className="spinner" /> : <><FiSave /> Save Changes</>}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export function InvestorNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    investorService.getNotifications()
      .then(res => setNotifs(res.data?.notifications || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await investorService.markNotificationRead(id);
      setNotifs(n => n.map(x => x.id === id ? { ...x, read_at: new Date() } : x));
    } catch {}
  };

  const iconForType = (type) => {
    if (type?.includes('deposit'))    return '💳';
    if (type?.includes('withdrawal')) return '💸';
    if (type?.includes('investment')) return '📈';
    if (type?.includes('message'))    return '💬';
    return '🔔';
  };

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div><h1>Notifications</h1><p>Stay updated on your account activity</p></div>
        {notifs.some(n => !n.read_at) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setNotifs(n => n.map(x => ({ ...x, read_at: new Date() })))}>
            Mark all read
          </button>
        )}
      </div>

      <div className="inv-card">
        {loading ? <div className="inv-loading">Loading…</div> :
          notifs.length === 0 ? (
            <div className="inv-empty-state"><FiBell size={36}/><p>No notifications yet</p></div>
          ) : (
            <div className="notif-list">
              {notifs.map(n => (
                <div key={n.id} className={`notif-item ${!n.read_at ? 'unread' : ''}`} onClick={() => !n.read_at && markRead(n.id)} style={{ cursor: !n.read_at ? 'pointer' : 'default' }}>
                  <div className="notif-icon">{iconForType(n.type)}</div>
                  <div className="notif-body">
                    <div className="notif-title">{n.data?.title || n.title || 'Notification'}</div>
                    <div className="notif-msg">{n.data?.message || n.message || ''}</div>
                  </div>
                  <div className="notif-time">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── REFERRALS ─────────────────────────────────────────────────────────────────
export function InvestorReferrals() {
  const { user } = useAuthStore();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const referralCode = user?.referral_code || `REF${user?.id || '000000'}`;
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  useEffect(() => {
    investorService.getReferrals()
      .then(res => setReferrals(res.data?.referrals || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div><h1>Referrals</h1><p>Invite friends and earn referral bonuses</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <div className="inv-card">
          <h3 className="inv-card__title" style={{ marginBottom:'1.25rem' }}>Your Referral Code</h3>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginBottom:'1.25rem' }}>
            <div style={{ flex:1, background:'var(--gray-50)', border:'1.5px dashed var(--gray-200)', borderRadius:'var(--radius-md)', padding:'0.85rem 1.2rem', fontFamily:'monospace', fontSize:'1.1rem', fontWeight:700, color:'var(--navy)' }}>
              {referralCode}
            </div>
            <button className="btn btn-gold" onClick={() => copy(referralCode)}><FiCopy /> Copy</button>
          </div>
          <p style={{ fontSize:'0.85rem', color:'var(--gray-500)', marginBottom:'1rem' }}>Share this link with friends:</p>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <input className="form-control" readOnly value={referralLink} style={{ fontSize:'0.78rem' }} />
            <button className="btn btn-outline" onClick={() => copy(referralLink)}><FiCopy /></button>
          </div>
        </div>

        <div className="inv-card">
          <h3 className="inv-card__title" style={{ marginBottom:'1.25rem' }}>Referral Stats</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {[
              { label:'Total Referrals', value: referrals.length },
              { label:'Active Referrals', value: referrals.filter(r => r.status === 'active').length },
              { label:'Total Bonus Earned', value: `$${referrals.reduce((s, r) => s + parseFloat(r.bonus || 0), 0).toFixed(2)}` },
              { label:'Pending Bonus', value: '$0.00' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:'1rem', textAlign:'center' }}>
                <div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--navy)' }}>{s.value}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="inv-card">
        <h3 className="inv-card__title" style={{ marginBottom:'1.25rem' }}>Referred Investors</h3>
        {loading ? <div className="inv-loading">Loading…</div> :
          referrals.length === 0 ? (
            <div className="inv-empty-state"><FiGift size={36}/><p>No referrals yet. Share your code to earn bonuses!</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Investor</th><th>Date Joined</th><th>Status</th><th>Bonus</th></tr></thead>
                <tbody>
                  {referrals.map(r => (
                    <tr key={r.id}>
                      <td>{r.referred?.name || r.name || '—'}</td>
                      <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge badge-${r.status==='active'?'success':'warning'}`}>{r.status || 'pending'}</span></td>
                      <td><strong>${parseFloat(r.bonus || 0).toLocaleString()}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}
