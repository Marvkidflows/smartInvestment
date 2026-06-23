// LOCATION: src/pages/investor/InvestorSectors.jsx
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

export default function InvestorSectors() {
  const [sectors, setSectors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = "all categories in this sector"

  const [investingPlanId, setInvestingPlanId] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      investorService.getActiveSectors(),
      investorService.getPlans(),
    ])
      .then(([sectorsRes, plansRes]) => {
        setSectors(sectorsRes.data?.sectors || []);
        setPlans(plansRes.data?.plans || []);
      })
      .catch(() => toast.error('Failed to load sectors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openInvestForm = (plan) => {
    setInvestingPlanId(plan.id);
    setInvestAmount(plan.min_amount || '');
  };
  const closeInvestForm = () => { setInvestingPlanId(null); setInvestAmount(''); };

  const confirmInvest = async (plan) => {
    const amt = parseFloat(investAmount);
    if (!amt || amt < plan.min_amount) {
      toast.error(`Minimum investment for this plan is $${parseFloat(plan.min_amount).toLocaleString()}`);
      return;
    }
    if (plan.max_amount && amt > plan.max_amount) {
      toast.error(`Maximum investment for this plan is $${parseFloat(plan.max_amount).toLocaleString()}`);
      return;
    }
    setSubmitting(true);
    try {
      await investorService.storeInvestment({ plan_id: plan.id, amount: amt });
      toast.success('Investment created!');
      closeInvestForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create investment.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── STEP 3: Plans within the selected sector/category ──────────────────
  if (selectedSector) {
    const categoryIds = selectedCategory
      ? [selectedCategory.id]
      : (selectedSector.categories || selectedSector.active_categories || []).map(c => c.id);

    const visiblePlans = plans.filter(p => categoryIds.includes(p.sector_category_id));

    return (
      <div className="inv-page">
        <div className="inv-page__header">
          <div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: '0.75rem' }}
              onClick={() => { setSelectedSector(null); setSelectedCategory(null); }}>
              <FiArrowLeft size={14} /> All Sectors
            </button>
            <h1>{selectedSector.icon} {selectedSector.name}</h1>
            <p>{selectedSector.description || 'Choose a category to view available plans'}</p>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button onClick={() => setSelectedCategory(null)}
            className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-ghost'}`}>
            All Categories
          </button>
          {(selectedSector.categories || selectedSector.active_categories || []).map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory?.id === cat.id ? 'btn-primary' : 'btn-ghost'}`}>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="inv-card">
          {visiblePlans.length === 0 ? (
            <div className="inv-empty-state">
              <FiTrendingUp size={36} />
              <p>No plans available in this {selectedCategory ? 'category' : 'sector'} yet.</p>
            </div>
          ) : (
            <div className="plans-grid-inv">
              {visiblePlans.map(plan => (
                <div key={plan.id} className={`plan-inv-card ${plan.is_featured ? 'plan-inv-featured' : ''}`}>
                  {plan.is_featured && <div className="plan-inv-badge">Popular</div>}
                  <h4>{plan.name}</h4>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>
                    {plan.sector_category_name}
                  </div>
                  <p className="plan-inv-sub">{plan.description || 'Professional investment plan'}</p>
                  <div className="plan-inv-roi">
                    <span>{plan.roi_percent || plan.profit_percent || 0}%</span>
                    <small>return</small>
                  </div>
                  <div className="plan-inv-details">
                    <div><label>Min. Investment</label><span>${parseFloat(plan.min_amount || 0).toLocaleString()}</span></div>
                    <div><label>Duration</label><span>{plan.duration_days || '—'} days</span></div>
                  </div>

                  {investingPlanId === plan.id ? (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                      <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Amount (USD)</label>
                        <input type="number" className="form-control" autoFocus
                          min={plan.min_amount} max={plan.max_amount || undefined}
                          value={investAmount} onChange={e => setInvestAmount(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={closeInvestForm} disabled={submitting}>Cancel</button>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => confirmInvest(plan)} disabled={submitting}>
                          {submitting ? <span className="spinner" /> : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className={`btn ${plan.is_featured ? 'btn-gold' : 'btn-primary'} btn-sm`}
                      style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                      onClick={() => openInvestForm(plan)}>
                      Invest Now <FiArrowRight size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 1: Sector selection ─────────────────────────────────────────────
  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h1>Investment Sectors</h1>
          <p>Choose a sector to explore available investment opportunities</p>
        </div>
      </div>

      {loading ? (
        <div className="inv-loading">Loading sectors…</div>
      ) : sectors.length === 0 ? (
        <div className="inv-card"><div className="inv-empty-state"><p>No sectors available yet.</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {sectors.map(sector => {
            const cats = sector.categories || sector.active_categories || [];
            return (
              <div key={sector.id} className="inv-card"
                style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem 1.5rem' }}
                onClick={() => setSelectedSector(sector)}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{sector.icon}</div>
                <h3 style={{ marginBottom: '0.4rem' }}>{sector.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                  {sector.description || `${cats.length} categories available`}
                </p>
                <span className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Explore <FiArrowRight size={14} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
