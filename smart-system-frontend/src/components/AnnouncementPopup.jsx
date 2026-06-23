// LOCATION: src/components/AnnouncementPopup.jsx
// Drop this component into InvestorLayout.jsx or InvestorDashboard.jsx
// It auto-shows any unread is_popup=true announcements as a dismissible overlay.

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { investorService } from '../services/api';

const TYPE_META = {
  general:               { icon: '📢', color: '#3B82F6' },
  profit_update:         { icon: '📈', color: '#10B981' },
  investment_opportunity:{ icon: '💡', color: '#F59E0B' },
  maintenance:           { icon: '🔧', color: '#F59E0B' },
  balance_adjustment:    { icon: '💰', color: '#10B981' },
};

const STORAGE_KEY = 'ssi_dismissed_announcements';

function getDismissed() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function dismiss(id) {
  const dismissed = getDismissed();
  if (!dismissed.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, id]));
  }
}

export default function AnnouncementPopup() {
  const [queue, setQueue]   = useState([]); // popup announcements not yet dismissed
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    investorService.getAnnouncements()
      .then(res => {
        const all = res.data?.announcements || res.data || [];
        const dismissed = getDismissed();
        const popups = all.filter(a => a.is_popup && !dismissed.includes(a.id));
        if (popups.length > 0) {
          setQueue(popups);
          setCurrent(popups[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    if (!current) return;
    dismiss(current.id);
    const remaining = queue.filter(a => a.id !== current.id);
    setQueue(remaining);
    setCurrent(remaining[0] || null);
  };

  if (!current) return null;

  const meta = TYPE_META[current.type] || TYPE_META.general;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:8000 }}
        onClick={handleClose}
      />

      {/* Popup card */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 8001,
        background: 'white',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: 'min(480px, 90vw)',
        overflow: 'hidden',
      }}>
        {/* Coloured top bar */}
        <div style={{ height: 5, background: meta.color }} />

        <div style={{ padding: '1.75rem' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{meta.icon}</span>
              <div>
                <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:meta.color, marginBottom:'0.2rem' }}>
                  Platform Notice
                </div>
                <h3 style={{ margin:0, fontSize:'1rem', color:'var(--navy, #0f172a)' }}>{current.title}</h3>
              </div>
            </div>
            <button onClick={handleClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)', padding:'0.25rem', flexShrink:0 }}>
              <FiX size={18} />
            </button>
          </div>

          {/* Body */}
          <p style={{ fontSize:'0.88rem', color:'#475569', lineHeight:1.65, margin:'0 0 1.25rem' }}>
            {current.content || current.message}
          </p>

          {/* Footer */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>
              {current.created_at ? new Date(current.created_at).toLocaleDateString() : ''}
            </span>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              {queue.length > 1 && (
                <button className="btn btn-ghost btn-sm" onClick={handleClose}>
                  Next ({queue.length - 1} more)
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={handleClose}>
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
