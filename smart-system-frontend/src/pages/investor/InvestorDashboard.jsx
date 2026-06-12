import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTrendingUp, FiDollarSign, FiArrowUpCircle, FiClock, FiActivity, FiPlus } from 'react-icons/fi';
import { investorService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import './InvestorDashboard.css';

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

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div className="inv-announcements">
          {announcements.slice(0, 1).map(a => (
            <div key={a.id} className="inv-announcement">
              <span>📢</span>
              <strong>{a.title}:</strong> {a.message || a.content}
            </div>
          ))}
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

      {/* ACTIVE INVESTMENTS */}
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
              <div key={inv.id} className="inv-invest-card">
                <div className="inv-invest-card__top">
                  <div>
                    <h4>{inv.plan?.name || inv.plan_name || 'Investment Plan'}</h4>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div className="inv-invest-card__profit">+{inv.profit_percent || inv.roi || 0}%</div>
                </div>
                <div className="inv-invest-card__amount">${parseFloat(inv.amount || 0).toLocaleString()}</div>
                <div className="inv-invest-progress">
                  <div className="inv-invest-progress__bar" style={{ width: `${Math.min((inv.days_passed / inv.total_days) * 100, 100) || 40}%` }} />
                </div>
                <div className="inv-invest-card__meta">
                  <span>Started {inv.start_date || '—'}</span>
                  <span>{inv.days_remaining || '—'} days left</span>
                </div>
              </div>
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
