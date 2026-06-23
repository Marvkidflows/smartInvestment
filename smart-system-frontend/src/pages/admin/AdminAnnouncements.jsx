// LOCATION: src/pages/admin/AdminAnnouncements.jsx
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const TYPES = [
  { value: 'general',           label: 'General Announcement', icon: '📢', color: 'info'    },
  { value: 'profit_update',     label: 'Profit Update',        icon: '📈', color: 'success' },
  { value: 'investment_opportunity', label: 'Investment Opportunity', icon: '💡', color: 'gold' },
  { value: 'maintenance',       label: 'Maintenance Notice',   icon: '🔧', color: 'warning' },
  { value: 'balance_adjustment',label: 'Balance Adjustment',   icon: '💰', color: 'success' },
];

const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.value, t]));

const emptyForm = { title: '', content: '', type: 'general', is_popup: false };

function AnnouncementModal({ announcement, onClose, onSaved }) {
  const isEdit = !!announcement;
  const [form, setForm] = useState(announcement ? {
    title:    announcement.title   || '',
    content:  announcement.content || announcement.message || '',
    type:     announcement.type    || 'general',
    is_popup: !!announcement.is_popup,
  } : emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await adminService.updateAnnouncement(announcement.id, form);
        toast.success('Announcement updated.');
      } else {
        await adminService.storeAnnouncement(form);
        toast.success('Announcement published!');
      }
      onSaved();
      onClose();
    } catch { toast.error('Failed to save announcement.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Announcement' : 'New Announcement'}</h3>
        <form onSubmit={handleSave} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-control" required placeholder="e.g. Q3 Profit Update"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-control" rows={4} required
              placeholder="Announcement body…"
              value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_popup}
              onChange={e => setForm(f => ({ ...f, is_popup: e.target.checked }))} />
            Show as popup notification (urgent announcements only)
          </label>
          <div className="adm-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : isEdit ? 'Update' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {} (new) | announcement (edit)
  const [showModal, setShowModal] = useState(false);

  const fetchAnnouncements = () => {
    adminService.getAnnouncements()
      .then(res => setAnnouncements(res.data?.announcements || res.data || []))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openNew  = () => { setModal(null);         setShowModal(true); };
  const openEdit = (a) => { setModal(a);            setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await adminService.deleteAnnouncement(id);
      setAnnouncements(a => a.filter(x => x.id !== id));
      toast.success('Deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div><h1>Announcements</h1><p>Post announcements visible to all investors on their dashboard and notifications</p></div>
        <button className="btn btn-gold" onClick={openNew}><FiPlus /> New Announcement</button>
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title" style={{ marginBottom: '1.25rem' }}>Published Announcements</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : announcements.length === 0 ? (
          <div className="adm-empty"><p>No announcements yet.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map(a => {
              const meta = TYPE_MAP[a.type] || TYPE_MAP.general;
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'flex-start', gap:'1rem', padding:'1.25rem', background:'var(--gray-50)', borderRadius:'var(--radius-md)', border:'1px solid var(--gray-200)' }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize:'0.9rem', color:'var(--navy)' }}>{a.title}</strong>
                      <span className={`badge badge-${meta.color}`}>{meta.label}</span>
                      {a.is_popup && <span className="badge badge-danger">Popup</span>}
                    </div>
                    <p style={{ fontSize:'0.85rem', color:'var(--gray-500)', margin:0 }}>{a.content || a.message}</p>
                    <small style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}><FiEdit2 size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}><FiTrash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <AnnouncementModal
          announcement={modal}
          onClose={() => setShowModal(false)}
          onSaved={fetchAnnouncements}
        />
      )}
    </div>
  );
}
