// LOCATION: src/pages/investor/InvestorPlans.jsx
import { useState, useEffect, useMemo } from 'react';
import { FiStar, FiTrendingUp, FiClock, FiDollarSign } from 'react-icons/fi';
import { investorService, authService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

function InvestModal({ plan, balance, onClose, onInvested }) {
  const [amount, setAmount] = useState(plan.min_amount || '');
  const [submitting, setSubmitting] = useState(false);

  const expectedProfit = amount ? (parseFloat(amount) * (plan.profit_percent / 100)).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (amt < plan.min_amount) {
      toast.error(`Minimum investment is $${plan.min_amount.toLocaleString()}`);
      return;
    }
    if (plan.max_amount && amt > plan.max_amount) {
      toast.error(`Maximum investment is $${plan.max_amount.toLocaleString()}`);
      return;
    }
    if (amt > balance) {
      toast.error('Insufficient balance. Make a deposit first.');
      return;
    }
    setSubmitting(true);
    try {
      await investorService.createInvestment({ plan_id: plan.id, amount: amt });
      toast.success('Investment created!');
      onInvested();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create investment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <h3>Invest in {plan.name}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginTop: '0.3rem' }}>
          Available balance: <strong>${balance.toLocaleString()}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Investment Amount (USD)</label>
            <input type="number" className="form-control" required
              min={plan.min_amount} max={plan.max_amount || undefined}
              value={amount} onChange={e => setAmount(e.target.value)} />
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
              Min ${plan.min_amount.toLocaleString()}{plan.max_amount ? ` — Max $${plan.max_amount.toLocaleString()}` : ' — No maximum'}
            </div>
          </div>

          <div className="inv-announcement" style={{ marginBottom: '1.25rem' }}>
            Expected profit over {plan.duration_days} days: <strong>${expectedProfit}</strong>
          </div>

          <div className="adm-modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Confirm Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InvestorPlans() {
  const [plans, setPlans] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState('all');
  const [investPlan, setInvestPlan] = useState(null);

  const fetchPlans = () => {
    investorService.getPlans()
      .then(res => setPlans(res.data?.plans || []))
      .catch(() => toast.error('Failed to load investment plans'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
    authService.getUser().then(res => setBalance(res.data?.balance || 0)).catch(() => {});
  }, []);

  const sectors = useMemo(() => {
    const map = new Map();
    plans.forEach(p => {
      if (p.sector_id && !map.has(p.sector_id)) {
        map.set(p.sector_id, { id: p.sector_id, name: p.sector_name, icon: p.sector_icon });
      }
    });
    return Array.from(map.values());
  }, [plans]);

  const filteredPlans = activeSector === 'all'
    ? plans
    : plans.filter(p => String(p.sector_id) === String(activeSector));

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h1>Investment Plans</h1>
          <p>Choose a plan that fits your goals and start growing your portfolio</p>
        </div>
      </div>

      {/* SECTOR FILTER TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
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

      {loading ? (
        <div className="inv-loading">Loading…</div>
      ) : filteredPlans.length === 0 ? (
        <div className="inv-card"><div className="inv-empty-state"><p>No plans available in this sector yet.</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredPlans.map(plan => (
            <div className="inv-card" key={plan.id} style={{ position: 'relative' }}>
              {plan.is_featured && (
                <span className="badge badge-warning" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  <FiStar size={11} /> Featured
                </span>
              )}
              {plan.sector_category_name && (
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: '0.4rem' }}>
                  {plan.sector_icon} {plan.sector_name} · {plan.sector_category_name}
                </div>
              )}
              <h3 style={{ marginBottom: '0.4rem' }}>{plan.name}</h3>
              {plan.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>{plan.description}</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <FiTrendingUp size={14} style={{ color: 'var(--success)' }} />
                  <strong style={{ color: 'var(--success)' }}>+{plan.profit_percent}%</strong> return
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <FiClock size={14} style={{ color: 'var(--gray-400)' }} />
                  {plan.duration_days} days
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <FiDollarSign size={14} style={{ color: 'var(--gray-400)' }} />
                  ${plan.min_amount.toLocaleString()}{plan.max_amount ? ` – $${plan.max_amount.toLocaleString()}` : '+'}
                </div>
              </div>

              <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => setInvestPlan(plan)}>
                Invest Now
              </button>
            </div>
          ))}
        </div>
      )}

      {investPlan && (
        <InvestModal
          plan={investPlan}
          balance={balance}
          onClose={() => setInvestPlan(null)}
          onInvested={fetchPlans}
        />
      )}
    </div>
  );
}
