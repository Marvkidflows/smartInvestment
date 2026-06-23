// LOCATION: src/pages/admin/AdminSectors.jsx
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

function SectorModal({ sector, onClose, onSaved }) {
  const isEdit = !!sector;
  const [form, setForm] = useState({
    name: sector?.name || '',
    description: sector?.description || '',
    icon: sector?.icon || '',
    status: sector?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const res = isEdit
        ? await adminService.updateSector(sector.id, form)
        : await adminService.createSector(form);
      toast.success(isEdit ? 'Sector updated.' : 'Sector created.');
      onSaved(res.data?.sector);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save sector.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Sector' : 'New Sector'}</h3>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Name</label>
          <input className="form-control" placeholder="e.g. Sports Investment"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Icon <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(emoji, optional)</span></label>
          <input className="form-control" placeholder="⚽" maxLength={4}
            value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="adm-modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Sector'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ sectorId, category, onClose, onSaved }) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
    status: category?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const res = isEdit
        ? await adminService.updateSectorCategory(category.id, form)
        : await adminService.createSectorCategory(sectorId, form);
      toast.success(isEdit ? 'Category updated.' : 'Category created.');
      onSaved(res.data?.category);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Category' : 'New Category'}</h3>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Name</label>
          <input className="form-control" placeholder="e.g. FIFA World Cup"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={2}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="adm-modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSectors() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const [sectorModal, setSectorModal] = useState(null);  // null | {} (new) | sector (edit)
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(null); // { sectorId, category | null }

  const fetchSectors = () => {
    adminService.getSectors()
      .then(res => setSectors(res.data?.sectors || []))
      .catch(() => toast.error('Failed to load sectors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSectors(); }, []);

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const openNewSector = () => { setSectorModal(null); setShowSectorModal(true); };
  const openEditSector = (s) => { setSectorModal(s); setShowSectorModal(true); };

  const handleSectorSaved = () => fetchSectors();
  const handleCategorySaved = () => fetchSectors();

  const toggleSectorStatus = async (sector) => {
    try {
      if (sector.status === 'active') {
        await adminService.deactivateSector(sector.id);
        toast.success('Sector deactivated.');
      } else {
        await adminService.activateSector(sector.id);
        toast.success('Sector activated.');
      }
      fetchSectors();
    } catch { toast.error('Failed to update status.'); }
  };

  const deleteSector = async (sector) => {
    if (!window.confirm(`Delete sector "${sector.name}"? This also removes its categories.`)) return;
    try {
      await adminService.deleteSector(sector.id);
      toast.success('Sector deleted.');
      fetchSectors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete sector.');
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      if (category.status === 'active') {
        await adminService.deactivateSectorCategory(category.id);
        toast.success('Category deactivated.');
      } else {
        await adminService.activateSectorCategory(category.id);
        toast.success('Category activated.');
      }
      fetchSectors();
    } catch { toast.error('Failed to update status.'); }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await adminService.deleteSectorCategory(category.id);
      toast.success('Category deleted.');
      fetchSectors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Investment Sectors</h1>
          <p>Manage sectors and their categories — these power the investment plan picker</p>
        </div>
        <button className="btn btn-gold" onClick={openNewSector}>
          <FiPlus /> New Sector
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
      ) : sectors.length === 0 ? (
        <div className="adm-card"><div className="adm-empty"><p>No sectors yet. Create your first one.</p></div></div>
      ) : (
        sectors.map(sector => (
          <div className="adm-card" key={sector.id} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                onClick={() => toggleExpand(sector.id)}>
                {expanded[sector.id] ? <FiChevronDown /> : <FiChevronRight />}
                <span style={{ fontSize: '1.3rem' }}>{sector.icon}</span>
                <strong style={{ fontSize: '1rem' }}>{sector.name}</strong>
                <span className={`badge badge-${sector.status === 'active' ? 'success' : 'warning'}`}>{sector.status}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                  {sector.categories?.length || 0} categories
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEditSector(sector)}><FiEdit2 size={13} /></button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleSectorStatus(sector)}>
                  {sector.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteSector(sector)}><FiTrash2 size={13} /></button>
              </div>
            </div>

            {expanded[sector.id] && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                {sector.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>{sector.description}</p>
                )}
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Category</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {(sector.categories || []).map(cat => (
                        <tr key={cat.id}>
                          <td>{cat.name}</td>
                          <td><span className={`badge badge-${cat.status === 'active' ? 'success' : 'warning'}`}>{cat.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button className="btn btn-ghost btn-sm"
                                onClick={() => setCategoryModal({ sectorId: sector.id, category: cat })}>Edit</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => toggleCategoryStatus(cat)}>
                                {cat.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(cat)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem' }}
                  onClick={() => setCategoryModal({ sectorId: sector.id, category: null })}>
                  <FiPlus size={13} /> Add Category
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {showSectorModal && (
        <SectorModal
          sector={sectorModal}
          onClose={() => setShowSectorModal(false)}
          onSaved={handleSectorSaved}
        />
      )}

      {categoryModal && (
        <CategoryModal
          sectorId={categoryModal.sectorId}
          category={categoryModal.category}
          onClose={() => setCategoryModal(null)}
          onSaved={handleCategorySaved}
        />
      )}
    </div>
  );
}
