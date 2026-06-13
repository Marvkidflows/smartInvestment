import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/api';

/**
 * Normalise whatever shape Laravel returns into a clean user object.
 */
function extractUser(responseData) {
  if (!responseData) return null;
  if (responseData.user && responseData.user.id) return responseData.user;
  if (responseData.data && responseData.data.id) return responseData.data;
  if (responseData.id) return responseData;
  return null;
}

/**
 * Determine role from user object.
 */
function resolveRole(user) {
  if (!user) return null;
  if (user.role) return user.role;
  if (user.is_admin === true) return 'admin';
  if (Array.isArray(user.roles)) {
    return user.roles.includes('admin') ? 'admin' : 'investor';
  }
  return 'investor';
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // ── LOGIN ──────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const raw = response.data;

          // Save the token
          if (raw.token) {
            localStorage.setItem('auth_token', raw.token);
          }

          let user = extractUser(raw);

          if (!user) {
            try {
              const userRes = await authService.getUser();
              user = extractUser(userRes.data);
            } catch {
              // ignore — proceed with whatever we have
            }
          }

          if (!user) {
            user = { role: 'investor', ...raw };
          }

          user = { ...user, role: resolveRole(user) };

          set({ user, isAuthenticated: true, loading: false, error: null });
          return { success: true, user };

        } catch (err) {
          const data = err.response?.data;
          const message =
            data?.message ||
            (data?.errors ? Object.values(data.errors)[0]?.[0] : null) ||
            `Login failed (${err.response?.status || 'network error'})`;

          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      // ── LOGOUT ─────────────────────────────────────────────────────────────
      logout: async () => {
        try { await authService.logout(); } catch (_) {}
        localStorage.removeItem('auth_token');
        set({ user: null, isAuthenticated: false, error: null });
        window.location.href = '/login';
      },

      // ── HELPERS ────────────────────────────────────────────────────────────
      setUser:    (user) => set({ user: user ? { ...user, role: resolveRole(user) } : null, isAuthenticated: !!user }),
      clearError: () => set({ error: null }),
      isAdmin:    () => get().user?.role === 'admin',
      isInvestor: () => ['investor', 'user'].includes(get().user?.role),
    }),
    {
      name: 'ssi-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;