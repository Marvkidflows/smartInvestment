import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTrendingUp, FiDollarSign, FiArrowUpCircle, FiClock, FiActivity, FiPlus } from 'react-icons/fi';
import { investorService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import './InvestorDashboard.css';
import AnnouncementPopup from '../../components/AnnouncementPopup';

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="stat-card-inv" style={{ '--accent': color }}>
      <div className="stat-card-inv__icon"><Icon size={20} /></div>
      <div className="stat-card-inv__body">
        <div className="stat-card-inv__label">{label}</div>
        <div className="stat-card-inv__value">{value}</div>
        {sub && <div className="stat-card-inv__sub">{sub}</div>}
      </div>
      {trend && <div className={`stat-card-inv__trend ${trend > 0 ? 'up' : 'down'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card-inv">
      <div className="skeleton" style={{ width:42, height:42, borderRadius:'10px' }} />
      <div style={{ flex:1 }}>
        <div className="skeleton" style={{ width:'60%', height:12, marginBottom:8 }} />
        <div className="skeleton" style={{ width:'40%', height:24 }} />
      </div>
    </div>
  );
}

// ── COUNTDOWN CARD — shows live days-remaining + progress for each investment ──
function CountdownCard({ investment }) {
  const { days_remaining, progress, countdown_status, plan_name, amount, expected_profit, end_date, start_date } = investment;

  const statusConfig = {
    active:        { label: '🟢 Active',        color: '#16a34a' },
    maturing_soon: { label: '🟡 Maturing Soon',  color: '#f59e0b' },
    matured:       { label: '🔵 Matured',        color: '#3b82f6' },
    paid:          { label: '✅ Paid',           color: '#16a34a' },
  };
  const status = statusConfig[countdown_status] || statusConfig.active;
  const progressColor = progress < 50 ? '#16a34a' : progress < 85 ? '#f59e0b' : '#dc2626';

  return (
    <div className="inv-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>{plan_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
            Started {start_date ? new Date(start_date).toLocaleDateString() : '—'}
          </div>
        </div>
        <span className="badge" style={{ background: status.color + '20', color: status.color, fontWeight: 600, fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: 999 }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Invested</div>
          <div style={{ fontWeight: 700 }}>${parseFloat(amount || 0).toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Expected Profit</div>
          <div style={{ fontWeight: 700, color: 'var(--success)' }}>+${parseFloat(expected_profit || 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
        {countdown_status === 'matured' || countdown_status === 'paid' ? (
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: status.color }}>
            {countdown_status === 'paid' ? 'Payout Complete' : 'Investment Matured'}
          </div>
        ) : (
          <>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--navy)' }}>{days_remaining}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Days Remaining</div>
          </>
        )}
      </div>

      <div style={{ height: 8, borderRadius: 8, background: 'var(--gray-100)', overflow: 'hidden', marginBottom: '0.4rem' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: progressColor, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'right' }}>
        {progress}% Completed · Ends {end_date ? new Date(end_date).toLocaleDateString() : '—'}
      </div>
    </div>
  );
}

const SAMPLE_CHART = [
  { month:'Jan', profit:320 }, { month:'Feb', profit:480 }, { month:'Mar', profit:390 },
  { month:'Apr', profit:620 }, { month:'May', profit:540 }, { month:'Jun', profit:780 },
  { month:'Jul', profit:720 }, { month:'Aug', profit:910 }, { month:'Sep', profit:850 },
  { month:'Oct', profit:1050}, { month:'Nov', profit:980 }, { month:'Dec', profit:1200},
];

const PIE_COLORS = ['#1A3A8F', '#C9A84C', '#10B981', '#3B82F6'];

export default function InvestorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    investorService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const investments = data?.active_investments || [];
  const recentDeposits = data?.recent_deposits || [];
  const announcements = data?.announcements || [];

  const pieData = [
    { name: 'Balance',    value: parseFloat(stats.balance || 5000)     },
    { name: 'Profit',     value: parseFloat(stats.total_profit || 1200) },
    { name: 'Invested',   value: parseFloat(stats.total_invested || 8000)},
    { name: 'Withdrawal', value: parseFloat(stats.total_withdrawn || 500) },
  ];

  return (
    <div className="inv-dashboard">
      {/* HERO WELCOME */}
      <div className="inv-welcome">
        <div className="inv-welcome__left">
          <div className="inv-welcome__avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="inv-welcome__greeting">Welcome back,</p>
            <h1 className="inv-welcome__name">{user?.name || 'Investor'}</h1>
            <span className="badge badge-success">● Verified Account</span>
          </div>
        </div>
        <div className="inv-welcome__actions">
          <Link to="/investor/deposits"   className="btn btn-gold"><FiPlus /> Make Deposit</Link>
          <Link to="/investor/investments" className="btn btn-outline">Invest Now</Link>
        </div>
      </div>

    {/* POPUP ANNOUNCEMENTS — urgent notices shown as overlay */}
<AnnouncementPopup />

{/* BANNER ANNOUNCEMENTS — non-popup ones shown inline */}
{announcements.filter(a => !a.is_popup).length > 0 && (
  <div className="inv-announcements">
    {announcements.filter(a => !a.is_popup).slice(0, 3).map(a => {
      const ANN_META = {
        general:               { icon: '📢', color: '#3B82F6' },
        profit_update:         { icon: '📈', color: '#10B981' },
        investment_opportunity:{ icon: '💡', color: '#F59E0B' },
        maintenance:           { icon: '🔧', color: '#F59E0B' },
        balance_adjustment:    { icon: '💰', color: '#10B981' },
      };
      const meta = ANN_META[a.type] || ANN_META.general;
      return (
        <div key={a.id} className="inv-announcement"
          style={{ borderLeft: `3px solid ${meta.color}` }}>
          <span>{meta.icon}</span>
          <div>
            <strong>{a.title}:</strong>{' '}
            <span>{a.message || a.content}</span>
          </div>
        </div>
      );
    })}
    {announcements.filter(a => !a.is_popup).length > 3 && (
      <Link to="/investor/announcements"
        className="inv-announcement"
        style={{ justifyContent:'center', color:'var(--gray-500)', fontSize:'0.82rem' }}>
        View all announcements →
      </Link>
    )}
  </div>
)}
      

      {/* STATS GRID */}
      <div className="inv-stats-grid">
        {loading ? (
          Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={FiDollarSign}    label="Current Balance"       value={`$${parseFloat(stats.balance || 0).toLocaleString()}`}          color="#1A3A8F" trend={2.4} />
            <StatCard icon={FiTrendingUp}    label="Total Invested"        value={`$${parseFloat(stats.total_invested || 0).toLocaleString()}`}    color="#C9A84C" />
            <StatCard icon={FiActivity}      label="Total Profit"          value={`$${parseFloat(stats.total_profit || 0).toLocaleString()}`}      color="#10B981" trend={5.1} />
            <StatCard icon={FiArrowUpCircle} label="Available Withdrawal"  value={`$${parseFloat(stats.withdrawable || 0).toLocaleString()}`}      color="#3B82F6" />
            <StatCard icon={FiClock}         label="Active Plans"          value={stats.active_plans || 0}                                          color="#8B5CF6" sub="Investment plans" />
            <StatCard icon={FiDollarSign}    label="Total Withdrawn"       value={`$${parseFloat(stats.total_withdrawn || 0).toLocaleString()}`}   color="#F59E0B" />
          </>
        )}
      </div>

      {/* CHARTS + PIE */}
      <div className="inv-charts-row">
        <div className="card inv-chart-card">
          <div className="card-header-row">
            <h3>Portfolio Growth</h3>
            <span className="badge badge-success">+14.2% YTD</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data?.chart_data || SAMPLE_CHART}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A3A8F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1A3A8F" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background:'#0F2044', border:'none', borderRadius:'10px', color:'white', fontSize:'0.82rem' }}
                formatter={v => [`$${v}`, 'Profit']}
              />
              <Area type="monotone" dataKey="profit" stroke="#1A3A8F" strokeWidth={2} fill="url(#profitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card inv-pie-card">
          <div className="card-header-row"><h3>Portfolio Distribution</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']} contentStyle={{ borderRadius:'10px', fontSize:'0.82rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {pieData.map((d, i) => (
              <div key={d.name} className="pie-legend-item">
                <span style={{ background: PIE_COLORS[i] }} />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE INVESTMENTS — now using live CountdownCard */}
      <div className="inv-section">
        <div className="inv-section__header">
          <h3>Active Investments</h3>
          <Link to="/investor/investments" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        {investments.length === 0 ? (
          <div className="inv-empty">
            <div>📊</div>
            <p>No active investments yet.</p>
            <Link to="/investor/investments" className="btn btn-primary btn-sm">Browse Plans</Link>
          </div>
        ) : (
          <div className="inv-investments-grid">
            {investments.slice(0, 4).map(inv => (
              <CountdownCard key={inv.id} investment={inv} />
            ))}
          </div>
        )}
      </div>

      

      {/* RECENT DEPOSITS */}
      <div className="inv-section">
        <div className="inv-section__header">
          <h3>Recent Deposits</h3>
          <Link to="/investor/deposits" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        {recentDeposits.length === 0 ? (
          <div className="inv-empty">
            <div>💳</div>
            <p>No deposits yet. <Link to="/investor/deposits">Make your first deposit</Link></p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentDeposits.slice(0, 5).map(d => (
                  <tr key={d.id}>
                    <td><strong>${parseFloat(d.amount).toLocaleString()}</strong></td>
                    <td>{d.method || d.payment_method || '—'}</td>
                    <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${d.status === 'approved' ? 'success' : d.status === 'pending' ? 'warning' : 'danger'}`}>
                        {d.status}
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