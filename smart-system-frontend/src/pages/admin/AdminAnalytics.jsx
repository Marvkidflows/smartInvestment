import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

const SAMPLE = {
  monthly: [
    { month:'Jan', revenue:12000, deposits:18000, withdrawals:5000, investors:45 },
    { month:'Feb', revenue:15000, deposits:22000, withdrawals:7000, investors:62 },
    { month:'Mar', revenue:11000, deposits:16000, withdrawals:6000, investors:38 },
    { month:'Apr', revenue:19000, deposits:28000, withdrawals:9000, investors:74 },
    { month:'May', revenue:17000, deposits:24000, withdrawals:8000, investors:58 },
    { month:'Jun', revenue:23000, deposits:32000, withdrawals:11000, investors:92 },
    { month:'Jul', revenue:21000, deposits:30000, withdrawals:10000, investors:81 },
    { month:'Aug', revenue:28000, deposits:38000, withdrawals:14000, investors:110 },
    { month:'Sep', revenue:25000, deposits:34000, withdrawals:12000, investors:97 },
    { month:'Oct', revenue:32000, deposits:44000, withdrawals:16000, investors:135 },
    { month:'Nov', revenue:29000, deposits:41000, withdrawals:15000, investors:122 },
    { month:'Dec', revenue:38000, deposits:52000, withdrawals:19000, investors:158 },
  ],
  planDist: [
    { name:'Starter',      value:42, color:'#1A3A8F' },
    { name:'Professional', value:35, color:'#C9A84C' },
    { name:'Elite',        value:23, color:'#10B981' },
  ],
};

const TOOLTIP_STYLE = {
  background: '#0F2044', border: 'none', borderRadius: '10px',
  color: 'white', fontSize: '0.8rem',
};

function ChartCard({ title, badge, children }) {
  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--navy)' }}>{title}</h3>
        {badge && <span className="badge badge-gold">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    adminService.getAnalytics()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const chartData  = data?.monthly_data || SAMPLE.monthly;
  const planDist   = data?.plan_distribution || SAMPLE.planDist;
  const summary    = data?.summary || {};

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Analytics & Insights</h1>
          <p>Comprehensive performance data for your investment platform</p>
        </div>
        <div style={{ display:'flex', gap:'0.35rem', background:'var(--gray-100)', padding:'0.25rem', borderRadius:'var(--radius-md)' }}>
          {['monthly','quarterly','yearly'].map(p => (
            <button key={p} className={`btn btn-sm ${period===p ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform:'capitalize', border:'none' }}
              onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI STRIP */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
        {[
          { label:'Total Revenue', value:`$${((summary.total_revenue||270000)/1000).toFixed(0)}K`, change:'+18.4%', up:true },
          { label:'Avg Monthly Growth', value:'14.2%', change:'+2.1%', up:true },
          { label:'Investor Retention', value:'91.3%', change:'-0.8%', up:false },
          { label:'Withdrawal Ratio', value:'28.6%', change:'-3.2%', up:true },
        ].map(k => (
          <div key={k.label} className="card" style={{ textAlign:'center', padding:'1.5rem 1rem' }}>
            <div style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--navy)', marginBottom:'0.25rem' }}>{k.value}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginBottom:'0.5rem' }}>{k.label}</div>
            <span style={{ fontSize:'0.78rem', fontWeight:700, color: k.up ? 'var(--success)' : 'var(--danger)',
              background: k.up ? 'var(--success-bg)' : 'var(--danger-bg)', padding:'0.2rem 0.6rem', borderRadius:'999px' }}>
              {k.change}
            </span>
          </div>
        ))}
      </div>

      {/* REVENUE + DEPOSITS */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        <ChartCard title="Revenue vs Withdrawals" badge="12 months">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A3A8F" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1A3A8F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="wdG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`$${v.toLocaleString()}`, '']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'0.78rem' }} />
              <Area type="monotone" dataKey="revenue"     name="Revenue"     stroke="#1A3A8F" strokeWidth={2} fill="url(#revG)" />
              <Area type="monotone" dataKey="withdrawals" name="Withdrawals"  stroke="#F59E0B" strokeWidth={2} fill="url(#wdG)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Deposits" badge="12 months">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`$${v.toLocaleString()}`, 'Deposits']} />
              <Bar dataKey="deposits" fill="#10B981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* INVESTOR GROWTH + PLAN DISTRIBUTION */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'1.5rem' }}>
        <ChartCard title="Investor Registration Trend">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[v, 'New Investors']} />
              <Line type="monotone" dataKey="investors" stroke="#C9A84C" strokeWidth={2.5}
                dot={{ r:4, fill:'#C9A84C', strokeWidth:0 }}
                activeDot={{ r:6, fill:'#C9A84C' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={planDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={4} nameKey="name">
                {planDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color || ['#1A3A8F','#C9A84C','#10B981'][i % 3]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {planDist.map((p, i) => (
              <div key={p.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.82rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background: p.color || ['#1A3A8F','#C9A84C','#10B981'][i % 3], flexShrink:0 }} />
                  <span style={{ color:'var(--gray-600)' }}>{p.name}</span>
                </div>
                <strong style={{ color:'var(--navy)' }}>{p.value}%</strong>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* FULL WIDTH PROFIT CHART */}
      <ChartCard title="Deposit vs Withdrawal Comparison" badge="Full Year">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={6} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`$${v.toLocaleString()}`, '']} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'0.78rem' }} />
            <Bar dataKey="deposits"    name="Deposits"    fill="#1A3A8F" radius={[4,4,0,0]} />
            <Bar dataKey="withdrawals" name="Withdrawals" fill="#F59E0B" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
