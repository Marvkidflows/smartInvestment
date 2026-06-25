import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  FiGrid, FiUsers, FiTrendingUp, FiDollarSign, FiArrowUpCircle,
  FiMessageSquare, FiBell, FiBarChart2, FiList, FiLayers, FiSliders, FiShieldOff, FiLogOut,
  FiMenu, FiX, FiChevronRight, FiShield
} from 'react-icons/fi';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard',     icon: FiGrid,          label: 'Dashboard'      },
  { to: '/admin/users',         icon: FiUsers,         label: 'Investors'      },
  { to: '/admin/investments',   icon: FiTrendingUp,    label: 'Investments'    },
  { to: '/admin/deposits',      icon: FiDollarSign,    label: 'Deposits'       },
  { to: '/admin/withdrawals',   icon: FiArrowUpCircle, label: 'Withdrawals'    },
  { to: '/admin/plans',         icon: FiList,          label: 'Plans'          },
  { to: '/admin/sectors',       icon: FiLayers,        label: 'Sectors'        },
  { to: '/admin/global',        icon: FiSliders,       label: 'Global Mgmt'    },
  { to: '/admin/kyc',           icon: FiShieldOff,     label: 'KYC'            },
  { to: '/admin/messages',      icon: FiMessageSquare, label: 'Messages'       },
  { to: '/admin/announcements', icon: FiBell,          label: 'Announcements'  },
  { to: '/admin/analytics',     icon: FiBarChart2,     label: 'Analytics'      },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <div className="admin-layout">
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="adm-sidebar__header">
          <Link to="/admin/dashboard" className="adm-logo">
            <FiShield size={18} />
            <span>Admin<b>Panel</b></span>
          </Link>
          <button className="adm-close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX size={18} />
          </button>
        </div>

        <div className="adm-sidebar__user">
          <div className="adm-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <span className="adm-user-name">{user?.name || 'Administrator'}</span>
            <span className="adm-user-role">Super Admin</span>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `adm-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={17} />
              <span>{label}</span>
              <FiChevronRight size={13} className="adm-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <button className="adm-logout-btn" onClick={logout}>
            <FiLogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <div className="adm-topbar__badge">
            <span className="adm-live-dot" />
            Control Center
          </div>
          <div className="adm-topbar__right">
            <NavLink to="/admin/messages"      className="adm-topbar-icon"><FiMessageSquare size={19} /></NavLink>
            <NavLink to="/admin/announcements" className="adm-topbar-icon"><FiBell size={19} /></NavLink>
            <div className="adm-topbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="adm-content page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
