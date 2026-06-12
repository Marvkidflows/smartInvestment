import { Routes, Route, Navigate } from 'react-router-dom';
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

// Investor Pages
import InvestorDashboard    from './pages/investor/InvestorDashboard';
import InvestorInvestments  from './pages/investor/InvestorInvestments';
import InvestorDeposits     from './pages/investor/InvestorDeposits';
import InvestorWithdrawals  from './pages/investor/InvestorWithdrawals';
import InvestorMessages     from './pages/investor/InvestorMessages';
import InvestorProfile      from './pages/investor/InvestorProfile';
import InvestorNotifications from './pages/investor/InvestorNotifications';
import InvestorReferrals    from './pages/investor/InvestorReferrals';

// Admin Pages
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminUsers         from './pages/admin/AdminUsers';
import AdminUserDetail    from './pages/admin/AdminUserDetail';
import AdminInvestments   from './pages/admin/AdminInvestments';
import AdminDeposits      from './pages/admin/AdminDeposits';
import AdminWithdrawals   from './pages/admin/AdminWithdrawals';
import AdminMessages      from './pages/admin/AdminMessages';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnalytics     from './pages/admin/AdminAnalytics';
import AdminPlans         from './pages/admin/AdminPlans';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function isAdminUser(user)    { return user?.role === 'admin' || user?.is_admin === true; }
function isInvestorUser(user) { return !isAdminUser(user); } // everyone non-admin

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

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
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

      {/* ── INVESTOR ── */}
      <Route path="/investor" element={<InvestorRoute><InvestorLayout /></InvestorRoute>}>
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<InvestorDashboard />} />
        <Route path="investments"   element={<InvestorInvestments />} />
        <Route path="deposits"      element={<InvestorDeposits />} />
        <Route path="withdrawals"   element={<InvestorWithdrawals />} />
        <Route path="messages"      element={<InvestorMessages />} />
        <Route path="profile"       element={<InvestorProfile />} />
        <Route path="notifications" element={<InvestorNotifications />} />
        <Route path="referrals"     element={<InvestorReferrals />} />
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
      </Route>

      {/* ── CATCH-ALL ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
