// LOCATION: src/pages/investor/InvestorAnnouncements.jsx
import { useState, useEffect } from 'react';
import { investorService } from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

const TYPE_META = {
  general:               { icon: '📢', label: 'General',              color: 'info'    },
  profit_update:         { icon: '📈', label: 'Profit Update',        color: 'success' },
  investment_opportunity:{ icon: '💡', label: 'Investment Opportunity',color: 'warning' },
  maintenance:           { icon: '🔧', label: 'Maintenance',          color: 'warning' },
  balance_adjustment:    { icon: '💰', label: 'Balance Adjustment',   color: 'success' },
};

export default function InvestorAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    investorService.getAnnouncements()
      .then(res => setAnnouncements(res.data?.announcements || res.data || []))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? announcements
    : announcements.filter(a => a.type === filter);

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h1>Announcements</h1>
          <p>Platform updates, profit news, and important notices</p>
        </div>
      </div>

      {/* TYPE FILTER TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button onClick={() => setFilter('all')}
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>
          All
        </button>
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-ghost'}`}>
            {meta.icon} {meta.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="inv-loading">Loading announcements…</div>
      ) : filtered.length === 0 ? (
        <div className="inv-card">
          <div className="inv-empty-state">
            <p>No {filter === 'all' ? '' : TYPE_META[filter]?.label} announcements yet.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(a => {
            const meta = TYPE_META[a.type] || TYPE_META.general;
            return (
              <div key={a.id} className="inv-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{a.title}</strong>
                      <span className={`badge badge-${meta.color}`}>{meta.label}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.6 }}>
                      {a.content || a.message}
                    </p>
                    <small style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.5rem', display: 'block' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : ''}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
