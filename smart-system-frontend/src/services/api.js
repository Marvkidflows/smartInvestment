import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR — attach Bearer token ───────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── RESPONSE INTERCEPTOR — redirect on 401 ──────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      const onAuth = ['/login', '/register'].some(p => window.location.pathname.startsWith(p));
      if (!onAuth) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────
export const authService = {
  login:          (data) => api.post('/login', data),
  logout:         ()     => api.post('/logout'),
  getUser:        ()     => api.get('/user'),
  registerStage1: (data) => api.post('/register/stage1', data),
  verifyOtp:      (data) => api.post('/register/verify-otp', data),
  resendOtp:      ()     => api.post('/register/resend-otp'),
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

  
  submitKyc: (formData) =>
    api.post('/investor-investment/investor/profile/kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
 
  // Investments
  getInvestments:  ()       => api.get('/investor-investment/investor/investments'),
  getPlans:        ()       => api.get('/investor-investment/investor/investments/plans'),
  storeInvestment: (data)   => api.post('/investor-investment/investor/investments', data),
  showInvestment:  (id)     => api.get(`/investor-investment/investor/investments/${id}`),

  // Deposits
  getDeposits:  ()     => api.get('/investor-investment/investor/deposits'),
 storeDeposit: (data) =>
  api.post('/investor-investment/investor/deposits', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  showDeposit:  (id)   => api.get(`/investor-investment/investor/deposits/${id}`),

  // Withdrawals
  getWithdrawals:  ()     => api.get('/investor-investment/investor/withdrawals'),
  storeWithdrawal: (data) => api.post('/investor-investment/investor/withdrawals', data),
  getWithdrawalPinStatus: ()     => api.get('/investor-investment/investor/withdrawal-pin/status'),
setWithdrawalPin:       (data) => api.post('/investor-investment/investor/withdrawal-pin', data),

  // Sectors (active, for plan browsing/filtering)
  getActiveSectors: () => api.get('/sectors/active'),

  // Messages — investor ↔ admin private thread
  getMessages: () =>
    api.get('/investor-investment/messages'),

  storeMessage: (data) =>
    api.post('/investor-investment/messages', data),

  showMessage: (id) =>
    api.get(`/investor-investment/messages/${id}`),

  // Notifications
  getNotifications:     ()   => api.get('/investor-investment/notifications'),
  markNotificationRead: (id) => api.post(`/investor-investment/notifications/${id}/read`),
  deleteNotification:   (id) => api.delete(`/investor-investment/notifications/${id}`),

  // Announcements
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
  adjustBalance: (id, data) => api.post(`/admin/users/${id}/balance`, data),

  // Email OTP verification — admin controls
  getVerificationStatus: (id)       => api.get(`/admin/users/${id}/verification-status`),
  resendUserOtp:          (id)       => api.post(`/admin/users/${id}/resend-otp`),
  manualVerifyUser:       (id)       => api.post(`/admin/users/${id}/manual-verify`),

    // Global Profit & Balance Management
  adjustProfit:      (data) => api.post('/admin/global/profit-adjustments', data),
  getProfitHistory:  ()     => api.get('/admin/global/profit-adjustments'),
  bulkBalance:       (data) => api.post('/admin/global/balance-bulk', data),
 
  // Investments
  getInvestments:     ()   => api.get('/admin/investments'),
  showInvestment:     (id) => api.get(`/admin/investments/${id}`),
  completeInvestment: (id) => api.post(`/admin/investments/${id}/complete`),

  // Investment Plans
  getPlans:    ()           => api.get('/admin/investment-plans'),
  storePlan:   (data)       => api.post('/admin/investment-plans', data),
  updatePlan:  (id, data)   => api.put(`/admin/investment-plans/${id}`, data),
  deletePlan:  (id)         => api.delete(`/admin/investment-plans/${id}`),

  // Sectors
  getSectors:        ()           => api.get('/admin/sectors'),
  createSector:      (data)       => api.post('/admin/sectors', data),
  updateSector:      (id, data)   => api.put(`/admin/sectors/${id}`, data),
  deleteSector:      (id)         => api.delete(`/admin/sectors/${id}`),
  activateSector:    (id)         => api.post(`/admin/sectors/${id}/activate`),
  deactivateSector:  (id)         => api.post(`/admin/sectors/${id}/deactivate`),

  // Sector categories
  createSectorCategory:     (sectorId, data) => api.post(`/admin/sectors/${sectorId}/categories`, data),
  updateSectorCategory:     (id, data)       => api.put(`/admin/sector-categories/${id}`, data),
  deleteSectorCategory:     (id)             => api.delete(`/admin/sector-categories/${id}`),
  activateSectorCategory:   (id)             => api.post(`/admin/sector-categories/${id}/activate`),
  deactivateSectorCategory: (id)             => api.post(`/admin/sector-categories/${id}/deactivate`),

  // Deposits
  getDeposits:    ()   => api.get('/admin/deposits'),
  showDeposit:    (id) => api.get(`/admin/deposits/${id}`),
  approveDeposit: (id) => api.post(`/admin/deposits/${id}/approve`),
  rejectDeposit:  (id) => api.post(`/admin/deposits/${id}/reject`),
  holdDeposit:      (id)         => api.post(`/admin/deposits/${id}/hold`),
addDepositNote:   (id, data)   => api.post(`/admin/deposits/${id}/notes`, data),

  // Withdrawals
  getWithdrawals:    ()   => api.get('/admin/withdrawals'),
  showWithdrawal:    (id) => api.get(`/admin/withdrawals/${id}`),
  approveWithdrawal: (id) => api.post(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal:  (id) => api.post(`/admin/withdrawals/${id}/reject`),
holdWithdrawal:      (id)       => api.post(`/admin/withdrawals/${id}/hold`),
addWithdrawalNote:   (id, data) => api.post(`/admin/withdrawals/${id}/notes`, data),

getKycSubmissions: ()       => api.get('/admin/kyc'),
  showKycSubmission: (id)     => api.get(`/admin/kyc/${id}`),
  approveKyc:        (id)     => api.post(`/admin/kyc/${id}/approve`),
  rejectKyc:         (id, data) => api.post(`/admin/kyc/${id}/reject`, data),
 
  // Messages
  getMessages: () =>
    api.get('/admin/messages'),

  showMessage: (investorId) =>
    api.get(`/admin/messages/${investorId}`),

  sendMessageToInvestor: (investorId, data) =>
    api.post(`/admin/messages/${investorId}/send`, data),

  deleteMessage: (messageId) =>
    api.delete(`/admin/messages/${messageId}`),

  // Announcements
  getAnnouncements:   ()           => api.get('/admin/announcements'),
  storeAnnouncement:  (data)       => api.post('/admin/announcements', data),
  updateAnnouncement: (id, data)   => api.put(`/admin/announcements/${id}`, data),
  deleteAnnouncement: (id)         => api.delete(`/admin/announcements/${id}`),
};