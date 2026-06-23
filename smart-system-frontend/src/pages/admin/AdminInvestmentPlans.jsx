// LOCATION: src/pages/admin/AdminInvestmentPlans.jsx
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const emptyForm = {
  name: '', description: '', sector_category_id: '',
  min_amount: '', max_amount: '', profit_percent: '', duration_days: '',
  is_featured: false, status: 'active',
};

function PlanModal({ plan, sectors, onClose, onSaved }) {
  const isEdit = !!plan;
  const [form, setForm] = useState(plan ? {
    name: plan.name || '',
    description: plan.description || '',
    sector_category_id: plan.sector_category_id || '',
    min_amount: plan.min_amount ?? '',
    max_amount: plan.max_amount ?? '',
    profit_percent: plan.profit_percent ?? '',
    duration_days: plan.duration_days ?? '',
    is_featured: !!plan.is_featured,
    status: plan.status || 'active',
  } : emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.min_amount || !form.profit_percent || !form.duration_days) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, sector_category_id: form.sector_category_id || null };
      const res = isEdit
        ? await adminService.updateInvestmentPlan(plan.id, payload)
        : await adminService.createInvestmentPlan(payload);
      toast.success(isEdit ? 'Plan updated.' : 'Plan created.');
      onSaved(res.data?.plan);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit Investment Plan' : 'New Investment Plan'}</h3>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Plan Name</label>
          <input className="form-control" placeholder="e.g. Growth Plan"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Sector / Category <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
          <select className="form-control" value={form.sector_category_id}
            onChange={e => setForm(f => ({ ...f, sector_category_id: e.target.value }))}>
            <option value="">— None —</option>
            {sectors.map(sector => (
              <optgroup key={sector.id} label={`${sector.icon || ''} ${sector.name}`}>
                {(sector.categories || []).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={2}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Min Amount (USD)</label>
            <input type="number" className="form-control" placeholder="500"
              value={form.min_amount} onChange={e => setForm(f => ({ ...f, min_amount: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Amount <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
            <input type="number" className="form-control" placeholder="No limit"
              value={form.max_amount} onChange={e => setForm(f => ({ ...f, max_amount: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Profit % (total over duration)</label>
            <input type="number" className="form-control" placeholder="15"
              value={form.profit_percent} onChange={e => setForm(f => ({ ...f, profit_percent: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Duration (days)</label>
            <input type="number" className="form-control" placeholder="30"
              value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_featured}
              onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
            Featured plan
          </label>

          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <select className="form-control" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInvestmentPlans() {
  const [plans, setPlans] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPlan, setModalPlan] = useState(undefined); // undefined = closed, null = new, {} = edit

  const fetchAll = () => {
    setLoading(true);
    Promise.all([adminService.getInvestmentPlans(), adminService.getSectors()])
      .then(([plansRes, sectorsRes]) => {
        setPlans(plansRes.data?.plans || []);
        setSectors(sectorsRes.data?.sectors || []);
      })
      .catch(() => toast.error('Failed to load investment plans'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const togglePlanStatus = async (plan) => {
    try {
      await adminService.updateInvestmentPlan(plan.id, { status: plan.status === 'active' ? 'inactive' : 'active' });
      toast.success(plan.status === 'active' ? 'Plan deactivated.' : 'Plan activated.');
      fetchAll();
    } catch { toast.error('Failed to update status.'); }
  };

  const deletePlan = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    try {
      await adminService.deleteInvestmentPlan(plan.id);
      toast.success('Plan deleted.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Investment Plans</h1>
          <p>Create and manage the investment opportunities investors can choose from</p>
        </div>
        <button className="btn btn-gold" onClick={() => setModalPlan(null)}>
          <FiPlus /> New Plan
        </button>
      </div>

      <div className="adm-card">
        <h3 className="adm-card__title">All Plans</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : plans.length === 0 ? (
          <div className="adm-empty"><p>No investment plans yet. Create your first one.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th><th>Sector</th><th>Range</th><th>Profit</th>
                  <th>Duration</th><th>Active Investments</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.is_featured && <FiStar size={12} style={{ marginLeft: '0.35rem', color: 'var(--warning)' }} title="Featured" />}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {p.sector_category_name ? `${p.sector_name} → ${p.sector_category_name}` : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      ${parseFloat(p.min_amount).toLocaleString()}{p.max_amount ? ` – $${parseFloat(p.max_amount).toLocaleString()}` : '+'}
                    </td>
                    <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>+{p.profit_percent}%</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{p.duration_days} days</td>
                    <td>{p.investment_accounts_count}</td>
                    <td><span className={`badge badge-${p.status === 'active' ? 'success' : 'warning'}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModalPlan(p)}><FiEdit2 size={13} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => togglePlanStatus(p)}>
                          {p.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletePlan(p)}><FiTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalPlan !== undefined && (
        <PlanModal
          plan={modalPlan}
          sectors={sectors}
          onClose={() => setModalPlan(undefined)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
