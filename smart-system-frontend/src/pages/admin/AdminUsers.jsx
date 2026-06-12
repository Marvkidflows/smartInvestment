import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiSearch, FiEye, FiUserCheck, FiUserX } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getUsers()
      .then(res => setUsers(res.data?.users || res.data || []))
      .catch(() => toast.error('Failed to load investors'))
      .finally(() => setLoading(false));
  }, []);

  const handleSuspend = async (id) => {
    try {
      await adminService.suspendUser(id);
      setUsers(u => u.map(x => x.id === id ? { ...x, status: 'suspended' } : x));
      toast.success('Investor suspended');
    } catch { toast.error('Action failed'); }
  };

  const handleActivate = async (id) => {
    try {
      await adminService.activateUser(id);
      setUsers(u => u.map(x => x.id === id ? { ...x, status: 'active' } : x));
      toast.success('Investor activated');
    } catch { toast.error('Action failed'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div><h1>Investor Management</h1><p>Manage all registered investors on the platform</p></div>
      </div>

      <div className="adm-card">
        <div className="adm-card__header">
          <h3 className="adm-card__title" style={{ margin:0 }}>All Investors ({users.length})</h3>
          <div className="adm-search">
            <FiSearch size={15} />
            <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'2rem', color:'var(--gray-400)' }}>Loading investors…</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty"><FiUsers size={36}/><p>No investors found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Investor</th><th>Email</th><th>Balance</th>
                  <th>Account Status</th><th>Last Login</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <div className="adm-user-avatar" style={{ width:34,height:34,fontSize:'0.82rem' }}>
                          {(u.name||'?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--navy)' }}>{u.name}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>#{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:'0.85rem' }}>{u.email}</td>
                    <td><strong>${parseFloat(u.balance || 0).toLocaleString()}</strong></td>
                    <td>
                      <span className={`badge badge-${u.status==='active'?'success':u.status==='suspended'?'danger':'warning'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ fontSize:'0.82rem', color:'var(--gray-400)' }}>
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <Link to={`/admin/users/${u.id}`} className="btn btn-ghost btn-sm"><FiEye size={13}/> View</Link>
                        {u.status !== 'suspended' ? (
                          <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(u.id)}>
                            <FiUserX size={13}/> Suspend
                          </button>
                        ) : (
                          <button className="btn btn-success btn-sm" onClick={() => handleActivate(u.id)}>
                            <FiUserCheck size={13}/> Activate
                          </button>
                        )}
                      </div>
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
