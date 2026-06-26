import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Layouts
import PublicLayout   from './layouts/PublicLayout';
import InvestorLayout from './layouts/InvestorLayout';
import AdminLayout    from './layouts/AdminLayout';

// Public Pages
import HomePage       from './pages/public/HomePage';
import AboutPage      from './pages/public/AboutPage';
import PlansPage      from './pages/public/PlansPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import FaqPage        from './pages/public/FaqPage';
import ContactPage    from './pages/public/ContactPage';
import LoginPage      from './pages/public/LoginPage';
import RegisterPage   from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPassword';
import ResetPasswordPage from './pages/public/ResetPassword';

// Investor Pages
import InvestorDashboard    from './pages/investor/InvestorDashboard';
import InvestorInvestments  from './pages/investor/InvestorInvestments';
import InvestorPlans        from './pages/investor/InvestorPlans';
import InvestorSectors      from './pages/investor/InvestorSectors';
import InvestorDeposits     from './pages/investor/InvestorDeposits';
import InvestorWithdrawals  from './pages/investor/InvestorWithdrawals';
import InvestorMessages     from './pages/investor/InvestorMessages';
import InvestorProfile      from './pages/investor/InvestorProfile';
import InvestorNotifications from './pages/investor/InvestorNotifications';
import InvestorReferrals    from './pages/investor/InvestorReferrals';
import InvestorAnnouncements from './pages/investor/InvestorAnnouncements';

// Admin Pages
import AdminDashboard        from './pages/admin/AdminDashboard';
import AdminUsers            from './pages/admin/AdminUsers';
import AdminUserDetail       from './pages/admin/AdminUserDetail';
import AdminInvestments      from './pages/admin/AdminInvestments';
import AdminDeposits         from './pages/admin/AdminDeposits';
import AdminWithdrawals      from './pages/admin/AdminWithdrawals';
import AdminMessages         from './pages/admin/AdminMessages';
import AdminAnnouncements    from './pages/admin/AdminAnnouncements';
import AdminAnalytics        from './pages/admin/AdminAnalytics';
import AdminPlans            from './pages/admin/AdminPlans';
import AdminSectors          from './pages/admin/AdminSectors';
import AdminGlobalManagement from './pages/admin/AdminGlobalManagement';
import AdminKyc              from './pages/admin/AdminKyc';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function isAdminUser(user)    { return user?.role === 'admin' || user?.is_admin === true; }

function getDashboardPath(user) {
  return isAdminUser(user) ? '/admin/dashboard' : '/investor/dashboard';
}

// ─── ROUTE GUARDS ─────────────────────────────────────────────────────────────
function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }
  return children;
}

function InvestorRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (isAdminUser(user)) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/investor/dashboard" replace />;
  return children;
}

// ─── FULL-SCREEN LOADING SPLASH ───────────────────────────────────────────────
function AuthLoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', gap: '1.25rem', zIndex: 9999,
    }}>
      <span style={{ fontSize: '2rem' }}>◆</span>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(255,255,255,0.15)',
        borderTop: '3px solid #f59e0b',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { hydrated, initializeAuth } = useAuthStore();

  // On mount, validate the stored token before rendering any routes.
  // This prevents a flash of /login on reload for already-authenticated users.
  useEffect(() => {
    initializeAuth();
  }, []);

  // Block all route rendering until the token check is complete.
  if (!hydrated) {
    return <AuthLoadingScreen />;
  }

  return (
    <Routes>
      {/* ── PUBLIC ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"             element={<HomePage />} />
        <Route path="/about"        element={<AboutPage />} />
        <Route path="/plans"        element={<PlansPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq"          element={<FaqPage />} />
        <Route path="/contact"      element={<ContactPage />} />
      </Route>

      {/* ── AUTH ── */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
     <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ── INVESTOR ── */}
      <Route path="/investor" element={<InvestorRoute><InvestorLayout /></InvestorRoute>}>
        <Route index                    element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"         element={<InvestorDashboard />} />
        <Route path="investments"       element={<InvestorInvestments />} />
        <Route path="investments/plans" element={<InvestorPlans />} />
        <Route path="sectors"           element={<InvestorSectors />} />
        <Route path="deposits"          element={<InvestorDeposits />} />
        <Route path="withdrawals"       element={<InvestorWithdrawals />} />
        <Route path="messages"          element={<InvestorMessages />} />
        <Route path="profile"           element={<InvestorProfile />} />
        <Route path="notifications"     element={<InvestorNotifications />} />
        <Route path="referrals"         element={<InvestorReferrals />} />
        <Route path="announcements"     element={<InvestorAnnouncements />} />
      </Route>

      {/* ── ADMIN ── */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<AdminDashboard />} />
        <Route path="users"         element={<AdminUsers />} />
        <Route path="users/:id"     element={<AdminUserDetail />} />
        <Route path="investments"   element={<AdminInvestments />} />
        <Route path="deposits"      element={<AdminDeposits />} />
        <Route path="withdrawals"   element={<AdminWithdrawals />} />
        <Route path="messages"      element={<AdminMessages />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="analytics"     element={<AdminAnalytics />} />
        <Route path="plans"         element={<AdminPlans />} />
        <Route path="sectors"       element={<AdminSectors />} />
        <Route path="global"        element={<AdminGlobalManagement />} />
        <Route path="kyc"           element={<AdminKyc />} />
      </Route>

      {/* ── CATCH-ALL ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}