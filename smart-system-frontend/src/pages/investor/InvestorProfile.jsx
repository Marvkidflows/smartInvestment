// LOCATION: src/pages/investor/InvestorProfile.jsx
import { useState, useEffect } from 'react';
import {
  FiSave, FiShield, FiUpload, FiCheckCircle,
  FiClock, FiXCircle, FiAlertCircle, FiUser
} from 'react-icons/fi';
import { investorService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import './InvestorPages.css';

const KYC_STATUS = {
  not_submitted: { label: 'Not Submitted',  color: 'warning', icon: FiAlertCircle },
  pending:       { label: 'Pending Review', color: 'info',    icon: FiClock       },
  approved:      { label: 'Verified',       color: 'success', icon: FiCheckCircle },
  rejected:      { label: 'Rejected',       color: 'danger',  icon: FiXCircle     },
};

// ── KYC UPLOAD SECTION ────────────────────────────────────────────────────────
function KycSection({ profile, onSubmitted }) {
  const status = profile?.kyc_status || 'not_submitted';
  const meta   = KYC_STATUS[status] || KYC_STATUS.not_submitted;
  const StatusIcon = meta.icon;

  const [idType,      setIdType]      = useState(profile?.id_type || 'national_id');
  const [idNumber,    setIdNumber]    = useState(profile?.id_number || '');
  const [idDocument,  setIdDocument]  = useState(null);
  const [selfie,      setSelfie]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  // Show the upload form whenever the investor can/should resubmit
  const canSubmit = status === 'not_submitted' || status === 'rejected';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idNumber.trim())  { toast.error('Enter your ID number.');              return; }
    if (!idDocument)       { toast.error('Upload a photo of your government ID.'); return; }
    if (!selfie)           { toast.error('Upload a selfie holding your ID.');   return; }

    const fd = new FormData();
    fd.append('id_type',     idType);
    fd.append('id_number',   idNumber);
    fd.append('id_document', idDocument);
    fd.append('selfie',      selfie);

    setSubmitting(true);
    try {
      await investorService.submitKyc(fd);
      toast.success('Documents submitted! Your profile is under review.');
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inv-card">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
        <h3 className="inv-card__title" style={{ marginBottom:0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <FiShield /> Identity Verification (KYC)
        </h3>
        <span className={`badge badge-${meta.color}`} style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem' }}>
          <StatusIcon size={12} /> {meta.label}
        </span>
      </div>

      {/* Status banners */}
      {status === 'approved' && (
        <div className="inv-announcement" style={{ borderColor:'var(--success)', marginBottom:'1rem' }}>
          ✅ Your identity has been verified. You have full access to all platform features.
        </div>
      )}

      {status === 'pending' && (
        <div className="inv-announcement" style={{ marginBottom:'1rem' }}>
          🕐 Your documents are under review. This usually takes 1–2 business days.
        </div>
      )}

      {status === 'rejected' && profile?.kyc_rejection_reason && (
        <div className="auth-error" style={{ display:'flex', gap:'0.6rem', marginBottom:'1.25rem' }}>
          <FiAlertCircle size={16} style={{ flexShrink:0, marginTop:2 }} />
          <span><strong>Rejected:</strong> {profile.kyc_rejection_reason}. Please correct and resubmit.</span>
        </div>
      )}

      {/* Required info reminder */}
      {canSubmit && (
        <div style={{ marginBottom:'1.25rem', padding:'0.85rem 1rem', background:'var(--gray-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--gray-200)', fontSize:'0.82rem', color:'var(--gray-600)' }}>
          <strong>Accepted IDs:</strong> National ID · Passport · Driver's License
          <br />
          <strong>You will need:</strong> A clear photo of your ID document + a selfie holding it
        </div>
      )}

      {/* Upload form */}
      {canSubmit && (
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">ID Type</label>
              <select className="form-control" value={idType} onChange={e => setIdType(e.target.value)}>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ID Number</label>
              <input className="form-control" placeholder="e.g. A1234567890"
                value={idNumber} onChange={e => setIdNumber(e.target.value)} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Government ID Photo</label>
              <div style={{ border:'2px dashed var(--gray-300)', borderRadius:'var(--radius-md)', padding:'1.25rem', textAlign:'center', cursor:'pointer', position:'relative' }}
                onClick={() => document.getElementById('kyc-doc-input').click()}>
                <input id="kyc-doc-input" type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => setIdDocument(e.target.files?.[0] || null)} />
                <FiUpload size={22} style={{ color:'var(--gray-400)', marginBottom:'0.4rem' }} />
                <div style={{ fontSize:'0.78rem', color:'var(--gray-500)' }}>
                  {idDocument ? <span style={{ color:'var(--success)' }}>✓ {idDocument.name}</span> : 'Click to upload'}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>JPG, PNG — max 5MB</div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Selfie (holding your ID)</label>
              <div style={{ border:'2px dashed var(--gray-300)', borderRadius:'var(--radius-md)', padding:'1.25rem', textAlign:'center', cursor:'pointer', position:'relative' }}
                onClick={() => document.getElementById('kyc-selfie-input').click()}>
                <input id="kyc-selfie-input" type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => setSelfie(e.target.files?.[0] || null)} />
                <FiUser size={22} style={{ color:'var(--gray-400)', marginBottom:'0.4rem' }} />
                <div style={{ fontSize:'0.78rem', color:'var(--gray-500)' }}>
                  {selfie ? <span style={{ color:'var(--success)' }}>✓ {selfie.name}</span> : 'Click to upload'}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>JPG, PNG — max 5MB</div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop:'0.5rem' }}>
            {submitting
              ? <><span className="spinner" style={{ borderTopColor:'white' }} /> Submitting…</>
              : <><FiUpload /> {status === 'rejected' ? 'Resubmit Documents' : 'Submit for Verification'}</>}
          </button>
        </form>
      )}
    </div>
  );
}

// ── MAIN PROFILE PAGE ─────────────────────────────────────────────────────────
export default function InvestorProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: '',
    address: '', city: '', state: '', date_of_birth: '',
  });

  const fetchProfile = () => {
    investorService.getProfile()
      .then(res => {
        const p = res.data?.user || res.data?.profile || res.data || {};
        setProfile(p);
        setForm({
          name:          p.name         || '',
          email:         p.email        || '',
          phone:         p.phone        || '',
          country:       p.country      || '',
          address:       p.address      || '',
          city:          p.city         || '',
          state:         p.state        || '',
          date_of_birth: p.date_of_birth
            ? new Date(p.date_of_birth).toISOString().split('T')[0]
            : '',
        });
      })
      .catch(() => {
        if (user) setForm(f => ({ ...f, name: user.name || '', email: user.email || '' }));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await investorService.updateProfile(form);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="inv-loading">Loading profile…</div>;

  const status    = profile?.kyc_status || 'not_submitted';
  const meta      = KYC_STATUS[status]  || KYC_STATUS.not_submitted;
  const StatusIcon = meta.icon;

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div><h1>My Profile</h1><p>Manage your personal information and verification</p></div>
      </div>

      <div className="profile-grid">
        {/* ── AVATAR CARD ── */}
        <div className="inv-card profile-avatar-card">
          <div className="profile-big-avatar">
            {(form.name || user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <h3>{form.name || user?.name || 'Investor'}</h3>
          <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>{form.email || user?.email}</p>

          <span className={`badge badge-${meta.color}`} style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem' }}>
            <StatusIcon size={12} /> {meta.label}
          </span>

          <div style={{ marginTop:'1.5rem', padding:'1rem', background:'var(--gray-50)', borderRadius:'var(--radius-md)', textAlign:'left' }}>
            <div style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginBottom:'0.35rem' }}>Account ID</div>
            <div style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'var(--navy)', fontWeight:600 }}>
              SSI-{new Date().getFullYear()}-{String(user?.id || 0).padStart(8, '0')}
            </div>
          </div>
        </div>

        {/* ── PERSONAL INFO FORM ── */}
        <div className="inv-card">
          <h3 className="inv-card__title" style={{ marginBottom:'1.5rem' }}>Personal Information</h3>
          <form onSubmit={handleSave}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm(f => ({...f, name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={form.email}
                  onChange={e => setForm(f => ({...f, email:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" value={form.phone}
                  onChange={e => setForm(f => ({...f, phone:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={form.date_of_birth}
                  onChange={e => setForm(f => ({...f, date_of_birth:e.target.value}))} />
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm(f => ({...f, address:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.city}
                  onChange={e => setForm(f => ({...f, city:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input className="form-control" value={form.state}
                  onChange={e => setForm(f => ({...f, state:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-control" value={form.country}
                  onChange={e => setForm(f => ({...f, country:e.target.value}))} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop:'0.5rem' }}>
              {saving ? <span className="spinner" /> : <><FiSave /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>

      {/* ── KYC SECTION — full width ── */}
      <KycSection profile={profile} onSubmitted={fetchProfile} />
    </div>
  );
}
