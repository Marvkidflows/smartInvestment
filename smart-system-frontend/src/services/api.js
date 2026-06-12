import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept':            'application/json',
    'Content-Type':      'application/json',
    'X-Requested-With':  'XMLHttpRequest',
  },
});

// ─── REQUEST INTERCEPTOR — attach XSRF token ─────────────────────────────────
api.interceptors.request.use(config => {
  const raw = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='));
  if (raw) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(raw.split('=').slice(1).join('='));
  }
  return config;
});

// ─── RESPONSE INTERCEPTOR — redirect on 401 ──────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const onAuth = ['/login', '/register'].some(p => window.location.pathname.startsWith(p));
      if (!onAuth) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────
export const authService = {
  getCsrf:        ()     => api.get('/sanctum/csrf-cookie'),
  login:          (data) => api.post('/login', data),
  logout:         ()     => api.post('/logout'),
  getUser:        ()     => api.get('/api/user'),
  registerStage1: (data) => api.post('/register/stage1', data),
  registerStage2: (data) => api.post('/register/stage2', data),
  registerStage3: (data) => api.post('/register/stage3', data),
  registerStage4: (data) => api.post('/register/stage4', data),
};

// ─── INVESTOR SERVICE ─────────────────────────────────────────────────────────
export const investorService = {
  // Dashboard
  getDashboard: () =>
    api.get('/investor-investment/dashboard'),

  // Profile
  getProfile:    ()     => api.get('/investor-investment/investor/profile'),
  updateProfile: (data) => api.put('/investor-investment/investor/profile', data),

  // Investments
  getInvestments:  ()       => api.get('/investor-investment/investor/investments'),
  getPlans:        ()       => api.get('/investor-investment/investor/investments/plans'),
  storeInvestment: (data)   => api.post('/investor-investment/investor/investments', data),
  showInvestment:  (id)     => api.get(`/investor-investment/investor/investments/${id}`),

  // Deposits
  getDeposits:  ()     => api.get('/investor-investment/investor/deposits'),
  storeDeposit: (data) => api.post('/investor-investment/investor/deposits', data),
  showDeposit:  (id)   => api.get(`/investor-investment/investor/deposits/${id}`),

  // Withdrawals
  getWithdrawals:  ()     => api.get('/investor-investment/investor/withdrawals'),
  storeWithdrawal: (data) => api.post('/investor-investment/investor/withdrawals', data),

  // Messages — investor ↔ admin private thread
  // GET  → { thread: [{id, body, from, subject, time_ago}], unread_count }
  getMessages: () =>
    api.get('/investor-investment/messages'),

  // POST → { message, data: {id, body, from, created_at, time_ago} }
  // Body: { subject?: string, body: string }
  storeMessage: (data) =>
    api.post('/investor-investment/messages', data),

  // GET single message (Blade fallback)
  showMessage: (id) =>
    api.get(`/investor-investment/messages/${id}`),

  // Notifications
  getNotifications:     ()   => api.get('/investor-investment/notifications'),
  markNotificationRead: (id) => api.post(`/investor-investment/notifications/${id}/read`),
  deleteNotification:   (id) => api.delete(`/investor-investment/notifications/${id}`),

  // Announcements — investor views all active
  getAnnouncements: () =>
    api.get('/investor-investment/announcements'),

  // Referrals
  getReferrals: () => api.get('/investor-investment/investor/referrals'),
};

// ─── ADMIN SERVICE ────────────────────────────────────────────────────────────
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),

  // Users
  getUsers:     ()           => api.get('/admin/users'),
  showUser:     (id)         => api.get(`/admin/users/${id}`),
  updateUser:   (id, data)   => api.put(`/admin/users/${id}`, data),
  suspendUser:  (id)         => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id)         => api.post(`/admin/users/${id}/activate`),

  // Investments
  getInvestments:     ()   => api.get('/admin/investments'),
  showInvestment:     (id) => api.get(`/admin/investments/${id}`),
  completeInvestment: (id) => api.post(`/admin/investments/${id}/complete`),

  // Investment Plans
  getPlans:    ()           => api.get('/admin/investment-plans'),
  storePlan:   (data)       => api.post('/admin/investment-plans', data),
  updatePlan:  (id, data)   => api.put(`/admin/investment-plans/${id}`, data),
  deletePlan:  (id)         => api.delete(`/admin/investment-plans/${id}`),

  // Deposits
  getDeposits:    ()   => api.get('/admin/deposits'),
  showDeposit:    (id) => api.get(`/admin/deposits/${id}`),
  approveDeposit: (id) => api.post(`/admin/deposits/${id}/approve`),
  rejectDeposit:  (id) => api.post(`/admin/deposits/${id}/reject`),

  // Withdrawals
  getWithdrawals:    ()   => api.get('/admin/withdrawals'),
  approveWithdrawal: (id) => api.post(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal:  (id) => api.post(`/admin/withdrawals/${id}/reject`),

  // Messages — admin sees all investors, sends to specific investor
  // GET /admin/messages
  // Returns: { investors: [{investor, last_message, unread_count}], total_unread }
  getMessages: () =>
    api.get('/admin/messages'),

  // GET /admin/messages/{investor_id}
  // Returns: { investor: {...}, thread: [{id, body, from, subject, time_ago}] }
  showMessage: (investorId) =>
    api.get(`/admin/messages/${investorId}`),

  // POST /admin/messages/{investor_id}/send
  // Body: { subject?: string, body: string }
  // Returns: { message, data: {id, body, from, created_at, time_ago} }
  sendMessageToInvestor: (investorId, data) =>
    api.post(`/admin/messages/${investorId}/send`, data),

  // DELETE /admin/messages/{message_id}
  deleteMessage: (messageId) =>
    api.delete(`/admin/messages/${messageId}`),

  // Announcements
  getAnnouncements:   ()           => api.get('/admin/announcements'),
  storeAnnouncement:  (data)       => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data)   => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id)         => api.delete(`/admin/announcements/${id}`),
};
