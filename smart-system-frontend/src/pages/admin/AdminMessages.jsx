import './AdminMessages.css';
import { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiSearch, FiUsers, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { adminService } from '../../services/api';

import toast from 'react-hot-toast';

export default function AdminMessages() {
  const [investors, setInvestors]     = useState([]);
  const [selected, setSelected]       = useState(null); // selected investor object
  const [thread, setThread]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [body, setBody]               = useState('');
  const [subject, setSubject]         = useState('');
  const [sending, setSending]         = useState(false);
  const [search, setSearch]           = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const bottomRef                     = useRef(null);

  // ── Fetch investor list ───────────────────────────────────────────────────
  const fetchInvestors = () => {
    adminService.getMessages()
      .then(res => {
        setInvestors(res.data?.investors || []);
        setTotalUnread(res.data?.total_unread || 0);
      })
      .catch(() => toast.error('Failed to load inbox'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInvestors(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread]);

  // ── Open conversation with an investor ───────────────────────────────────
  const openConversation = async (investor) => {
    setSelected(investor);
    setThread([]);
    setBody('');
    setSubject('');
    setThreadLoading(true);
    try {
      // GET /admin/messages/{investor_id}
      const res = await adminService.showMessage(investor.investor.id);
      setThread(res.data?.thread || []);
      // Mark as read locally
      setInvestors(prev => prev.map(i =>
        i.investor.id === investor.investor.id ? { ...i, unread_count: 0 } : i
      ));
      setTotalUnread(prev => Math.max(0, prev - (investor.unread_count || 0)));
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setThreadLoading(false); }
  };

  // ── Admin sends message to investor ──────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim() || !selected) return;
    setSending(true);
    try {
      // POST /admin/messages/{investor_id}/send
      const res = await adminService.sendMessageToInvestor(selected.investor.id, {
        subject: subject || null,
        body,
      });
      const newMsg = res.data?.data;
      if (newMsg) setThread(prev => [...prev, newMsg]);
      setBody('');
      setSubject('');
      // Update last message preview
      setInvestors(prev => prev.map(i =>
        i.investor.id === selected.investor.id
          ? { ...i, last_message: { body: body.slice(0, 80), from: 'admin', created_at: 'Just now' } }
          : i
      ));
      toast.success('Message sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  // ── Filter investors by search ────────────────────────────────────────────
  const filtered = investors.filter(i =>
    !search ||
    i.investor.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.investor.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1>Message Center</h1>
          <p>Send and receive private messages with investors</p>
        </div>
        {totalUnread > 0 && (
          <span className="badge badge-danger" style={{ padding:'0.45rem 1rem', fontSize:'0.85rem' }}>
            {totalUnread} unread
          </span>
        )}
      </div>

      <div className="adm-msg-layout">

        {/* ── LEFT: INVESTOR LIST ───────────────────────────────────────── */}
        <div className="adm-msg-sidebar">
          {/* Search */}
          <div className="adm-msg-search">
            <FiSearch size={14} />
            <input
              placeholder="Search investors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          {loading ? (
            <div className="adm-msg-sidebar-loading">Loading investors…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-msg-sidebar-empty">
              <FiUsers size={28} />
              <p>No investors found</p>
            </div>
          ) : (
            <div className="adm-msg-investor-list">
              {filtered.map((item, i) => (
                <div
                  key={item.investor.id}
                  className={`adm-msg-investor-item ${selected?.investor.id === item.investor.id ? 'active' : ''} ${item.unread_count > 0 ? 'has-unread' : ''}`}
                  onClick={() => openConversation(item)}
                >
                  {/* Avatar */}
                  <div className="adm-msg-investor-item__avatar">
                    {(item.investor.name || '?').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="adm-msg-investor-item__body">
                    <div className="adm-msg-investor-item__top">
                      <span className="adm-msg-investor-item__name">{item.investor.name}</span>
                      {item.last_message && (
                        <span className="adm-msg-investor-item__time">{item.last_message.created_at}</span>
                      )}
                    </div>
                    <div className="adm-msg-investor-item__preview">
                      {item.last_message
                        ? <>{item.last_message.from === 'admin' ? '↗ You: ' : '↙ '}{item.last_message.body}</>
                        : <span style={{ color:'var(--gray-300)', fontStyle:'italic' }}>No messages yet</span>
                      }
                    </div>
                  </div>

                  {/* Unread badge */}
                  {item.unread_count > 0 && (
                    <span className="adm-msg-unread-count">{item.unread_count}</span>
                  )}
                  <FiChevronRight size={13} style={{ color:'var(--gray-300)', flexShrink:0 }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: CONVERSATION ──────────────────────────────────────── */}
        <div className="adm-msg-conversation">
          {selected ? (
            <>
              {/* Conversation header */}
              <div className="adm-msg-convo-header">
                <button
                  className="adm-msg-back-btn"
                  onClick={() => setSelected(null)}
                >
                  <FiArrowLeft size={16} />
                </button>
                <div className="adm-msg-convo-avatar">
                  {selected.investor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="adm-msg-convo-name">{selected.investor.name}</div>
                  <div className="adm-msg-convo-email">{selected.investor.email}</div>
                </div>
                <span
                  className={`badge ${selected.investor.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                  style={{ marginLeft:'auto' }}
                >
                  {selected.investor.status}
                </span>
              </div>

              {/* Thread */}
              <div className="adm-msg-thread">
                {threadLoading ? (
                  <div className="adm-msg-thread-loading">
                    <div className="inv-msg-loading__dot"/><div className="inv-msg-loading__dot"/><div className="inv-msg-loading__dot"/>
                  </div>
                ) : thread.length === 0 ? (
                  <div className="adm-msg-thread-empty">
                    <FiMessageSquare size={36} />
                    <p>No messages yet. Send the first message below.</p>
                  </div>
                ) : (
                  thread.map((msg, i) => (
                    <div key={msg.id ?? i} className={`adm-msg-bubble ${msg.from === 'admin' ? 'adm-bubble-right' : 'adm-bubble-left'}`}>
                      <div className="adm-msg-bubble__name">
                        {msg.from === 'admin' ? '🛡️ You (Admin)' : `👤 ${selected.investor.name}`}
                      </div>
                      {msg.subject && (
                        <div className="adm-msg-bubble__subject">{msg.subject}</div>
                      )}
                      <div className="adm-msg-bubble__text">{msg.body}</div>
                      <div className="adm-msg-bubble__time">{msg.time_ago || msg.created_at}</div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div className="adm-msg-reply-area">
                <div className="adm-msg-reply-area__label">
                  <FiSend size={13} />
                  Sending to: <strong>{selected.investor.name}</strong> (private)
                </div>
                <div className="adm-msg-reply-area__row">
                  <input
                    className="form-control"
                    placeholder="Subject (optional)"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ marginBottom:'0.6rem' }}
                  />
                </div>
                <div className="adm-msg-reply-area__row">
                  <textarea
                    rows={3}
                    placeholder={`Message to ${selected.investor.name}… (Enter to send)`}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                    style={{ resize:'none' }}
                  />
                  <button
                    className="btn btn-primary adm-msg-send-btn"
                    onClick={handleSend}
                    disabled={sending || !body.trim()}
                  >
                    {sending ? <span className="spinner"/> : <FiSend size={15}/>}
                  </button>
                </div>
                <div className="adm-msg-reply-area__hint">
                  Enter to send • Shift+Enter for new line • Only {selected.investor.name} will see this
                </div>
              </div>
            </>
          ) : (
            /* No investor selected */
            <div className="adm-msg-convo-empty">
              <FiMessageSquare size={52} />
              <h3>Select an investor</h3>
              <p>Choose an investor from the list to view their conversation and send them a private message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
