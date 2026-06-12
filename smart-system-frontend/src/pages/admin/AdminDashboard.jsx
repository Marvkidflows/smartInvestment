import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line
} from 'recharts';
import { FiUsers, FiTrendingUp, FiDollarSign, FiArrowUpCircle, FiClock, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

function StatCard({ icon: Icon, label, value, sub, color, trend, gradient }) {
  return (
    <div className="adm-stat-card" style={{ '--gradient': gradient || `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}>
      <div className="adm-stat-card__icon"><Icon size={22} /></div>
      <div className="adm-stat-card__body">
        <div className="adm-stat-card__label">{label}</div>
        <div className="adm-stat-card__value">{value}</div>
        {sub && <div className="adm-stat-card__sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`adm-stat-card__trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

const SAMPLE_MONTHLY = [
  { month:'Jan', revenue:12000, deposits:18000, withdrawals:5000 },
  { month:'Feb', revenue:15000, deposits:22000, withdrawals:7000 },
  { month:'Mar', revenue:11000, deposits:16000, withdrawals:6000 },
  { month:'Apr', revenue:19000, deposits:28000, withdrawals:9000 },
  { month:'May', revenue:17000, deposits:24000, withdrawals:8000 },
  { month:'Jun', revenue:23000, deposits:32000, withdrawals:11000 },
  { month:'Jul', revenue:21000, deposits:30000, withdrawals:10000 },
  { month:'Aug', revenue:28000, deposits:38000, withdrawals:14000 },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const pendingWithdrawals = data?.pending_withdrawals || [];
  const recentInvestors = data?.recent_investors || data?.recent_users || [];
  const chartData = data?.chart_data || SAMPLE_MONTHLY;

  const STAT_CARDS = [
    { icon: FiUsers,         label: 'Total Investors',      value: stats.total_investors     || 0,     color: '#1A3A8F', gradient:'linear-gradient(135deg,#1A3A8F,#2552C4)', trend: 4.2 },
    { icon: FiActivity,      label: 'Active Investors',     value: stats.active_investors    || 0,     color: '#10B981', gradient:'linear-gradient(135deg,#059669,#10B981)', trend: 2.1 },
    { icon: FiTrendingUp,    label: 'Total Investments',    value: `$${parseFloat(stats.total_investments || 0).toLocaleString()}`, color: '#C9A84C', gradient:'linear-gradient(135deg,#B45309,#C9A84C)' },
    { icon: FiDollarSign,    label: 'Total Deposits',       value: `$${parseFloat(stats.total_deposits || 0).toLocaleString()}`,   color: '#3B82F6', gradient:'linear-gradient(135deg,#1D4ED8,#3B82F6)', trend: 8.5 },
    { icon: FiArrowUpCircle, label: 'Total Withdrawals',    value: `$${parseFloat(stats.total_withdrawals || 0).toLocaleString()}`,color: '#8B5CF6', gradient:'linear-gradient(135deg,#6D28D9,#8B5CF6)' },
    { icon: FiClock,         label: 'Pending Withdrawals',  value: stats.pending_withdrawals || 0,     color: '#F59E0B', gradient:'linear-gradient(135deg,#D97706,#F59E0B)' },
    { icon: FiCheckCircle,   label: 'Company Revenue',      value: `$${parseFloat(stats.company_revenue || 0).toLocaleString()}`,  color: '#10B981', gradient:'linear-gradient(135deg,#065F46,#10B981)', trend: 12.3 },
    { icon: FiActivity,      label: 'Monthly Profit',       value: `$${parseFloat(stats.monthly_profit || 0).toLocaleString()}`,   color: '#EF4444', gradient:'linear-gradient(135deg,#991B1B,#EF4444)', trend: -2.1 },
  ];

  return (
    <div className="adm-dashboard">
      {/* PAGE HEADER */}
      <div className="adm-page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Complete overview of your investment platform</p>
        </div>
        <div className="adm-header-actions">
          <Link to="/admin/withdrawals"  className="btn btn-warning-outline btn-sm">Pending Approvals</Link>
          <Link to="/admin/analytics"    className="btn btn-primary btn-sm">View Analytics</Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="adm-stats-grid">
        {loading
          ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="adm-stat-card" style={{ '--gradient': 'linear-gradient(135deg,#334155,#475569)' }}>
                <div className="skeleton" style={{ width:44,height:44,borderRadius:'10px' }} />
                <div style={{ flex:1 }}>
                  <div className="skeleton" style={{ width:'55%',height:10,marginBottom:8 }} />
                  <div className="skeleton" style={{ width:'40%',height:22 }} />
                </div>
              </div>
            ))
          : STAT_CARDS.map(c => <StatCard key={c.label} {...c} />)
        }
      </div>

      {/* CHARTS ROW */}
      <div className="adm-charts-row">
        <div className="card adm-chart-card">
          <div className="adm-chart-header">
            <h3>Revenue vs Deposits vs Withdrawals</h3>
            <span className="badge badge-gold">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background:'#0F2044', border:'none', borderRadius:'10px', color:'white', fontSize:'0.8rem' }} formatter={v=>[`$${v.toLocaleString()}`, '']} />
              <Bar dataKey="revenue"     fill="#1A3A8F" radius={[4,4,0,0]} />
              <Bar dataKey="deposits"    fill="#10B981" radius={[4,4,0,0]} />
              <Bar dataKey="withdrawals" fill="#F59E0B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="adm-chart-legend">
            <span><i style={{ background:'#1A3A8F' }} /> Revenue</span>
            <span><i style={{ background:'#10B981' }} /> Deposits</span>
            <span><i style={{ background:'#F59E0B' }} /> Withdrawals</span>
          </div>
        </div>

        <div className="card adm-mini-chart-card">
          <div className="adm-chart-header"><h3>Growth Trend</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#0F2044', border:'none', borderRadius:'10px', color:'white', fontSize:'0.8rem' }} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="adm-bottom-row">
        {/* PENDING WITHDRAWALS */}
        <div className="card">
          <div className="adm-section-header">
            <h3>Pending Withdrawals</h3>
            <Link to="/admin/withdrawals" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {pendingWithdrawals.length === 0 ? (
            <div className="adm-empty"><FiCheckCircle size={28} /><p>No pending withdrawals</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Investor</th><th>Amount</th><th>Method</th><th>Actions</th></tr></thead>
                <tbody>
                  {pendingWithdrawals.slice(0,5).map(w => (
                    <tr key={w.id}>
                      <td><strong>{w.user?.name || w.investor_name || '—'}</strong></td>
                      <td>${parseFloat(w.amount).toLocaleString()}</td>
                      <td style={{ textTransform:'capitalize' }}>{w.method || '—'}</td>
                      <td>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button className="btn btn-success btn-sm"
                            onClick={async () => { try { await adminService.approveWithdrawal(w.id); toast.success('Approved!'); setData(d => ({ ...d, pending_withdrawals: d.pending_withdrawals.filter(x => x.id !== w.id) })); } catch { toast.error('Failed'); } }}>
                            Approve
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={async () => { try { await adminService.rejectWithdrawal(w.id); toast.success('Rejected'); setData(d => ({ ...d, pending_withdrawals: d.pending_withdrawals.filter(x => x.id !== w.id) })); } catch { toast.error('Failed'); } }}>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT INVESTORS */}
        <div className="card">
          <div className="adm-section-header">
            <h3>Recent Investors</h3>
            <Link to="/admin/users" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {recentInvestors.length === 0 ? (
            <div className="adm-empty"><FiUsers size={28}/><p>No investors yet</p></div>
          ) : (
            <div className="adm-user-list">
              {recentInvestors.slice(0,6).map(u => (
                <div key={u.id} className="adm-user-row">
                  <div className="adm-user-avatar">{(u.name||'?').charAt(0).toUpperCase()}</div>
                  <div className="adm-user-info">
                    <span>{u.name}</span>
                    <small>{u.email}</small>
                  </div>
                  <span className={`badge badge-${u.status==='active'?'success':'warning'}`}>{u.status || 'active'}</span>
                  <Link to={`/admin/users/${u.id}`} className="btn btn-ghost btn-sm">View</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
