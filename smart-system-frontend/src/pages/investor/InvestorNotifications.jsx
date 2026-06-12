import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { investorService } from '../../services/api';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './InvestorPages.css';

const TYPE_ICON = {
  info:       'ℹ️',
  success:    '✅',
  warning:    '⚠️',
  danger:     '🚨',
  deposit:    '💳',
  withdrawal: '💸',
  investment: '📈',
  message:    '💬',
  announcement: '📢',
};

const TYPE_COLOR = {
  info:       'var(--info)',
  success:    'var(--success)',
  warning:    'var(--warning)',
  danger:     'var(--danger)',
  deposit:    'var(--success)',
  withdrawal: 'var(--warning)',
  investment: 'var(--royal)',
  message:    'var(--gold)',
  announcement: 'var(--royal)',
};

export default function InvestorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState('all'); // all | announcements | activity

  useEffect(() => {
    Promise.all([
      investorService.getNotifications().catch(() => ({ data: { notifications: [] } })),
      api.get('/investor-investment/announcements').catch(() => ({ data: { announcements: [] } })),
    ]).then(([notifRes, annoRes]) => {
      setNotifications(notifRes.data?.notifications || []);
      setAnnouncements(annoRes.data?.announcements || []);
    }).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await investorService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.get('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const deleteNotif = async (id) => {
    try {
      await investorService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  // Merge announcements into a notification-like format
  const announcementNotifs = announcements.map(a => ({
    id:          `ann-${a.id}`,
    type:        'announcement',
    title:       a.title,
    message:     a.content ?? a.message ?? '',
    read_at:     true, // announcements are always "read"
    created_at:  a.created_at,
    time_ago:    a.time_ago,
    is_announcement: true,
    ann_type:    a.type ?? 'info',
  }));

  // Combined feed sorted by date
  const combined = [
    ...notifications.map(n => ({ ...n, is_announcement: false })),
    ...announcementNotifs,
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filtered =
    tab === 'all'           ? combined :
    tab === 'announcements' ? combined.filter(n => n.is_announcement) :
    combined.filter(n => !n.is_announcement);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h1>
            Notifications
            {unreadCount > 0 && (
              <span className="notif-page-badge">{unreadCount}</span>
            )}
          </h1>
          <p>Your activity updates and platform announcements</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
            <FiCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="inv-card" style={{ padding: '0' }}>
        <div className="notif-tabs">
          {[
            { key:'all',           label:`All (${combined.length})`           },
            { key:'announcements', label:`📢 Announcements (${announcements.length})` },
            { key:'activity',      label:`Activity (${notifications.length})`  },
          ].map(t => (
            <button
              key={t.key}
              className={`notif-tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        {loading ? (
          <div className="inv-loading" style={{ padding:'2rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="inv-empty-state" style={{ padding:'3rem' }}>
            <FiBell size={36} />
            <p>No {tab === 'all' ? '' : tab} yet</p>
          </div>
        ) : (
          <div className="notif-list-page">
            {filtered.map((n, i) => {
              const typeKey  = n.is_announcement ? (n.ann_type ?? 'info') : (n.type?.split('\\').pop()?.toLowerCase().replace('notification','') ?? 'info');
              const icon     = n.is_announcement ? '📢' : (TYPE_ICON[typeKey] ?? '🔔');
              const color    = n.is_announcement ? TYPE_COLOR[n.ann_type ?? 'info'] : (TYPE_COLOR[typeKey] ?? 'var(--info)');
              const isUnread = !n.read_at && !n.is_announcement;

              return (
                <div
                  key={n.id}
                  className={`notif-item-page ${isUnread ? 'unread' : ''}`}
                  onClick={() => isUnread && markRead(n.id)}
                  style={{ cursor: isUnread ? 'pointer' : 'default' }}
                >
                  {/* Icon */}
                  <div className="notif-item-page__icon" style={{ background: `${color}18`, color }}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="notif-item-page__body">
                    <div className="notif-item-page__top">
                      <span className="notif-item-page__title">{n.title ?? n.data?.title ?? 'Notification'}</span>
                      {n.is_announcement && (
                        <span className="badge badge-info" style={{ fontSize:'0.65rem', padding:'0.15rem 0.5rem' }}>
                          Announcement
                        </span>
                      )}
                      {isUnread && <span className="notif-unread-dot" />}
                    </div>
                    <div className="notif-item-page__msg">
                      {n.message ?? n.data?.message ?? ''}
                    </div>
                    <div className="notif-item-page__time">
                      {n.time_ago ?? n.created_at}
                    </div>
                  </div>

                  {/* Delete (only non-announcement) */}
                  {!n.is_announcement && (
                    <button
                      className="notif-delete-btn"
                      onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
