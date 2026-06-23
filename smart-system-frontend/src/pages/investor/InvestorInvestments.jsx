import { useState, useEffect } from 'react';
import { FiTrendingUp, FiCheckCircle, FiClock, FiArrowRight } from 'react-icons/fi';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

export default function InvestorInvestments() {
  const [tab, setTab] = useState('active');
  const [investments, setInvestments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState('all');

  // Inline "Invest Now" form state
  const [investingPlanId, setInvestingPlanId] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      investorService.getInvestments(),
      investorService.getPlans(),
    ])
      .then(([invRes, planRes]) => {
        setInvestments(invRes.data?.investments || invRes.data || []);
        setPlans(planRes.data?.plans || planRes.data || []);
      })
      .catch(() => toast.error('Failed to load investments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = investments.filter(i =>
    tab === 'active' ? i.status === 'active' : i.status !== 'active'
  );

  // Unique sectors derived from the plans themselves
  const sectors = [];
  const seenSectorIds = new Set();
  plans.forEach(p => {
    if (p.sector_id && !seenSectorIds.has(p.sector_id)) {
      seenSectorIds.add(p.sector_id);
      sectors.push({ id: p.sector_id, name: p.sector_name, icon: p.sector_icon });
    }
  });

  const visiblePlans = activeSector === 'all'
    ? plans
    : plans.filter(p => String(p.sector_id) === String(activeSector));

  const openInvestForm = (plan) => {
    setInvestingPlanId(plan.id);
    setInvestAmount(plan.min_amount || '');
  };

  const closeInvestForm = () => {
    setInvestingPlanId(null);
    setInvestAmount('');
  };

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
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create investment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h1>My Investments</h1>
          <p>Manage your active investment plans and explore new opportunities</p>
        </div>
      </div>

      {/* AVAILABLE PLANS */}
      <div className="inv-card">
        <h3 className="inv-card__title">Available Investment Plans</h3>

        {/* SECTOR FILTER TABS */}
        {sectors.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.75rem 0 1.25rem' }}>
            <button onClick={() => setActiveSector('all')}
              className={`btn btn-sm ${activeSector === 'all' ? 'btn-primary' : 'btn-ghost'}`}>
              All Sectors
            </button>
            {sectors.map(s => (
              <button key={s.id} onClick={() => setActiveSector(s.id)}
                className={`btn btn-sm ${String(activeSector) === String(s.id) ? 'btn-primary' : 'btn-ghost'}`}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="inv-loading">Loading plans…</div>
        ) : visiblePlans.length === 0 ? (
          <p className="inv-empty-text">No plans available right now.</p>
        ) : (
          <div className="plans-grid-inv">
            {visiblePlans.map(plan => (
              <div key={plan.id} className={`plan-inv-card ${plan.is_featured ? 'plan-inv-featured' : ''}`}>
                {plan.is_featured && <div className="plan-inv-badge">Popular</div>}
                <h4>{plan.name}</h4>
                {plan.sector_category_name && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: '0.3rem' }}>
                    {plan.sector_icon} {plan.sector_name} · {plan.sector_category_name}
                  </div>
                )}
                <p className="plan-inv-sub">{plan.description || 'Professional investment plan'}</p>
                <div className="plan-inv-roi">
                  <span>{plan.roi_percent || plan.profit_percent || 0}%</span>
                  <small>return</small>
                </div>
                <div className="plan-inv-details">
                  <div><label>Min. Investment</label><span>${parseFloat(plan.min_amount || 0).toLocaleString()}</span></div>
                  <div><label>Duration</label><span>{plan.duration_days || plan.duration || '—'} days</span></div>
                </div>

                {investingPlanId === plan.id ? (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                    <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Amount (USD)</label>
                      <input
                        type="number" className="form-control" autoFocus
                        min={plan.min_amount} max={plan.max_amount || undefined}
                        value={investAmount}
                        onChange={e => setInvestAmount(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}
                        onClick={closeInvestForm} disabled={submitting}>
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                        onClick={() => confirmInvest(plan)} disabled={submitting}>
                        {submitting ? <span className="spinner" /> : 'Confirm'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={`btn ${plan.is_featured ? 'btn-gold' : 'btn-primary'} btn-sm`}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    onClick={() => openInvestForm(plan)}
                  >
                    Invest Now <FiArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MY INVESTMENTS */}
      <div className="inv-card">
        <div className="inv-card__header">
          <h3 className="inv-card__title">My Investments</h3>
          <div className="inv-tabs">
            <button className={`inv-tab ${tab==='active'?'active':''}`} onClick={()=>setTab('active')}>Active</button>
            <button className={`inv-tab ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>History</button>
          </div>
        </div>

        {loading ? (
          <div className="inv-loading">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="inv-empty-state">
            <FiTrendingUp size={40} />
            <p>No {tab} investments yet</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th><th>Amount</th><th>Return</th>
                  <th>Start Date</th><th>End Date</th><th>Progress</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td><strong>{inv.plan?.name || inv.plan_name || '—'}</strong></td>
                    <td>${parseFloat(inv.amount || 0).toLocaleString()}</td>
                    <td><span style={{ color:'var(--success)', fontWeight:700 }}>+{inv.profit_percent || inv.roi || 0}%</span></td>
                    <td>{inv.start_date ? new Date(inv.start_date).toLocaleDateString() : '—'}</td>
                    <td>{inv.end_date   ? new Date(inv.end_date).toLocaleDateString()   : '—'}</td>
                    <td style={{ minWidth:120 }}>
                      <div className="mini-progress">
                        <div className="mini-progress__bar" style={{ width:`${Math.min((inv.days_passed/inv.total_days)*100,100)||30}%` }} />
                      </div>
                      <small style={{ color:'var(--gray-400)', fontSize:'0.72rem' }}>{inv.days_remaining || '—'} days left</small>
                    </td>
                    <td>
                      <span className={`badge badge-${inv.status==='active'?'success':inv.status==='completed'?'info':'warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
