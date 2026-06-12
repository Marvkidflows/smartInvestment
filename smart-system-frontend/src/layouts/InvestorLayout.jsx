import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import {
  FiGrid, FiTrendingUp, FiDollarSign, FiArrowUpCircle,
  FiMessageSquare, FiUser, FiBell, FiGift, FiLogOut,
  FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';
import './InvestorLayout.css';

const NAV_ITEMS = [
  { to: '/investor/dashboard',     icon: FiGrid,          label: 'Dashboard'     },
  { to: '/investor/investments',   icon: FiTrendingUp,    label: 'Investments'   },
  { to: '/investor/deposits',      icon: FiDollarSign,    label: 'Deposits'      },
  { to: '/investor/withdrawals',   icon: FiArrowUpCircle, label: 'Withdrawals'   },
  { to: '/investor/messages',      icon: FiMessageSquare, label: 'Messages'      },
  { to: '/investor/notifications', icon: FiBell,          label: 'Notifications' },
  { to: '/investor/referrals',     icon: FiGift,          label: 'Referrals'     },
  { to: '/investor/profile',       icon: FiUser,          label: 'Profile'       },
];

export default function InvestorLayout() {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showBellDrop, setShowBellDrop]   = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [msgUnread, setMsgUnread]         = useState(0);
  const { user, logout } = useAuthStore();

  // ── Fetch counts on mount ─────────────────────────────────────────────────
  useEffect(() => {
    // Unread notifications
    api.get('/investor-investment/notifications')
      .then(res => setNotifications(res.data?.notifications || []))
      .catch(() => {});

    // Announcements for bell dropdown
    api.get('/investor-investment/announcements')
      .then(res => setAnnouncements(res.data?.announcements || []))
      .catch(() => {});

    // Unread messages from admin
    api.get('/investor-investment/messages')
      .then(res => setMsgUnread(res.data?.unread_count || 0))
      .catch(() => {});
  }, []);

  const unreadNotifs  = notifications.filter(n => !n.read_at).length;
  const totalBellBadge = unreadNotifs + announcements.length + msgUnread;

  return (
    <div className="investor-layout">

      {/* ── SIDEBAR ── */}
      <aside className={`inv-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="inv-sidebar__header">
          <Link to="/" className="inv-logo">
            <span className="inv-logo__icon">◆</span>
            <span>Smart<b>System</b></span>
          </Link>
          <button className="inv-close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX size={18} />
          </button>
        </div>

        <div className="inv-sidebar__user">
          <div className="inv-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="inv-user-info">
            <span className="inv-user-name">{user?.name || 'Investor'}</span>
            <span className="inv-user-role">Investor Account</span>
          </div>
        </div>

        <nav className="inv-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `inv-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>

              {/* Badge on Notifications nav item */}
              {label === 'Notifications' && totalBellBadge > 0 && (
                <span className="inv-nav-badge">{totalBellBadge > 99 ? '99+' : totalBellBadge}</span>
              )}

              {/* Badge on Messages nav item */}
              {label === 'Messages' && msgUnread > 0 && (
                <span className="inv-nav-badge">{msgUnread}</span>
              )}

              <FiChevronRight size={14} className="inv-nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="inv-sidebar__footer">
          <button className="inv-logout-btn" onClick={logout}>
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="inv-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="inv-main">
        <header className="inv-topbar">
          <button className="inv-menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>

          <div className="inv-topbar__title">Investor Portal</div>

          <div className="inv-topbar__right">

            {/* Messages icon with unread badge */}
            <NavLink to="/investor/messages" className="inv-topbar-icon" style={{ position: 'relative' }}>
              <FiMessageSquare size={20} />
              {msgUnread > 0 && (
                <span className="inv-topbar-badge">{msgUnread}</span>
              )}
            </NavLink>

            {/* Bell icon with dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="inv-topbar-icon"
                onClick={() => setShowBellDrop(v => !v)}
                style={{ border: 'none', cursor: 'pointer', position: 'relative' }}
              >
                <FiBell size={20} />
                {totalBellBadge > 0 && (
                  <span className="inv-topbar-badge">
                    {totalBellBadge > 99 ? '99+' : totalBellBadge}
                  </span>
                )}
              </button>

              {/* ── BELL DROPDOWN ── */}
              {showBellDrop && (
                <>
                  {/* click outside to close */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 299 }}
                    onClick={() => setShowBellDrop(false)}
                  />

                  <div className="inv-bell-drop">
                    {/* Header */}
                    <div className="inv-bell-drop__header">
                      <span>Notifications</span>
                      <NavLink
                        to="/investor/notifications"
                        className="inv-bell-drop__viewall"
                        onClick={() => setShowBellDrop(false)}
                      >
                        View all
                      </NavLink>
                    </div>

                    <div className="inv-bell-drop__list">

                      {/* ── ANNOUNCEMENTS (from admin) ── */}
                      {announcements.length > 0 && (
                        <div className="inv-bell-drop__section-label">📢 Announcements</div>
                      )}
                      {announcements.slice(0, 3).map(a => (
                        <div key={`ann-${a.id}`} className="inv-bell-drop__item inv-bell-drop__item--ann">
                          <div className="inv-bell-drop__item-icon" style={{ background: 'rgba(26,58,143,0.1)', color: 'var(--royal)' }}>
                            📢
                          </div>
                          <div className="inv-bell-drop__item-body">
                            <div className="inv-bell-drop__item-title">{a.title}</div>
                            <div className="inv-bell-drop__item-msg">
                              {(a.content || '').slice(0, 65)}{(a.content || '').length > 65 ? '…' : ''}
                            </div>
                            <div className="inv-bell-drop__item-time">{a.time_ago ?? a.created_at}</div>
                          </div>
                          <span className="inv-bell-drop__new-tag">New</span>
                        </div>
                      ))}

                      {/* ── UNREAD NOTIFICATIONS ── */}
                      {unreadNotifs > 0 && (
                        <div className="inv-bell-drop__section-label">🔔 Activity</div>
                      )}
                      {notifications.filter(n => !n.read_at).slice(0, 4).map(n => (
                        <div key={n.id} className="inv-bell-drop__item inv-bell-drop__item--unread">
                          <div className="inv-bell-drop__item-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                            🔔
                          </div>
                          <div className="inv-bell-drop__item-body">
                            <div className="inv-bell-drop__item-title">
                              {n.title ?? n.data?.title ?? 'Notification'}
                            </div>
                            <div className="inv-bell-drop__item-msg">
                              {(n.message ?? n.data?.message ?? '').slice(0, 65)}
                            </div>
                            <div className="inv-bell-drop__item-time">{n.created_at}</div>
                          </div>
                          <div className="inv-bell-drop__unread-dot" />
                        </div>
                      ))}

                      {/* ── UNREAD MESSAGES FROM ADMIN ── */}
                      {msgUnread > 0 && (
                        <NavLink
                          to="/investor/messages"
                          className="inv-bell-drop__item inv-bell-drop__item--msg"
                          onClick={() => setShowBellDrop(false)}
                        >
                          <div className="inv-bell-drop__item-icon" style={{ background: 'var(--gold-glow)', color: 'var(--gold)' }}>
                            💬
                          </div>
                          <div className="inv-bell-drop__item-body">
                            <div className="inv-bell-drop__item-title">New message from Support</div>
                            <div className="inv-bell-drop__item-msg">
                              You have {msgUnread} unread {msgUnread === 1 ? 'message' : 'messages'} from admin
                            </div>
                          </div>
                          <span className="inv-bell-drop__new-tag" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                            {msgUnread}
                          </span>
                        </NavLink>
                      )}

                      {/* ── EMPTY STATE ── */}
                      {announcements.length === 0 && unreadNotifs === 0 && msgUnread === 0 && (
                        <div className="inv-bell-drop__empty">
                          <FiBell size={28} />
                          <p>You're all caught up!</p>
                          <small>No new notifications</small>
                        </div>
                      )}
                    </div>

                    {/* Footer link */}
                    <NavLink
                      to="/investor/notifications"
                      className="inv-bell-drop__footer"
                      onClick={() => setShowBellDrop(false)}
                    >
                      See all notifications & announcements →
                    </NavLink>
                  </div>
                </>
              )}
            </div>

            {/* Profile avatar */}
            <NavLink to="/investor/profile" className="inv-topbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </NavLink>
          </div>
        </header>

        <div className="inv-content page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
