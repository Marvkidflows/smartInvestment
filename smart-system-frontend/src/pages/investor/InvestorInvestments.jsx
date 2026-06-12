import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiCheckCircle, FiClock, FiArrowRight } from 'react-icons/fi';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

export default function InvestorInvestments() {
  const [tab, setTab] = useState('active');
  const [investments, setInvestments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const filtered = investments.filter(i =>
    tab === 'active' ? i.status === 'active' : i.status !== 'active'
  );

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
        {loading ? (
          <div className="inv-loading">Loading plans…</div>
        ) : plans.length === 0 ? (
          <p className="inv-empty-text">No plans available right now.</p>
        ) : (
          <div className="plans-grid-inv">
            {plans.map(plan => (
              <div key={plan.id} className={`plan-inv-card ${plan.is_featured ? 'plan-inv-featured' : ''}`}>
                {plan.is_featured && <div className="plan-inv-badge">Popular</div>}
                <h4>{plan.name}</h4>
                <p className="plan-inv-sub">{plan.description || 'Professional investment plan'}</p>
                <div className="plan-inv-roi">
                  <span>{plan.roi_percent || plan.profit_percent || 0}%</span>
                  <small>monthly return</small>
                </div>
                <div className="plan-inv-details">
                  <div><label>Min. Investment</label><span>${parseFloat(plan.min_amount || 0).toLocaleString()}</span></div>
                  <div><label>Duration</label><span>{plan.duration_days || plan.duration || '—'} days</span></div>
                </div>
                <Link to={`/investor/investments?plan=${plan.id}`} className={`btn ${plan.is_featured ? 'btn-gold' : 'btn-primary'} btn-sm`} style={{ width:'100%', justifyContent:'center', marginTop:'1rem' }}>
                  Invest Now <FiArrowRight size={14} />
                </Link>
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
