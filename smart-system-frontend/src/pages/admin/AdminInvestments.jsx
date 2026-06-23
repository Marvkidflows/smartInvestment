// LOCATION: src/pages/admin/AdminInvestments.jsx
import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getInvestments()
      .then(res => setInvestments(res.data?.investments || res.data || []))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div><h1>Investment Management</h1><p>Monitor all active investment accounts</p></div>
      </div>
      <div className="adm-card">
        <h3 className="adm-card__title">All Investments</h3>
        {loading ? (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--gray-400)' }}>Loading…</div>
        ) : investments.length === 0 ? (
          <div className="adm-empty"><p>No investments yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Investor</th><th>Plan</th><th>Amount</th><th>ROI</th><th>Start</th><th>End</th><th>Status</th></tr>
              </thead>
              <tbody>
                {investments.map(inv => (
                  <tr key={inv.id}>
                    <td><strong>{inv.user?.name || '—'}</strong></td>
                    <td>{inv.plan?.name || inv.plan_name || '—'}</td>
                    <td><strong>${parseFloat(inv.amount || 0).toLocaleString()}</strong></td>
                    <td><span style={{ color:'var(--success)', fontWeight:700 }}>+{inv.profit_percent || 0}%</span></td>
                    <td style={{ fontSize:'0.82rem' }}>{inv.start_date ? new Date(inv.start_date).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize:'0.82rem' }}>{inv.end_date ? new Date(inv.end_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${inv.status === 'active' ? 'success' : inv.status === 'completed' ? 'info' : 'warning'}`}>
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
