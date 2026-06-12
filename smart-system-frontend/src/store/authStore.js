import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/api';

/**
 * Normalise whatever shape Laravel returns into a clean user object.
 * Handles: { user: {...} }, { data: {...} }, or the user object directly.
 */
function extractUser(responseData) {
  if (!responseData) return null;
  // { user: { id, name, role, ... } }
  if (responseData.user && responseData.user.id) return responseData.user;
  // { data: { id, name, role, ... } }
  if (responseData.data && responseData.data.id) return responseData.data;
  // Top-level user object
  if (responseData.id) return responseData;
  return null;
}

/**
 * Determine role from user object.
 * Supports: user.role === 'admin', user.is_admin === true, user.roles array.
 */
function resolveRole(user) {
  if (!user) return null;
  if (user.role) return user.role;
  if (user.is_admin === true) return 'admin';
  if (Array.isArray(user.roles)) {
    return user.roles.includes('admin') ? 'admin' : 'investor';
  }
  return 'investor'; // default
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
          // 1. Get CSRF cookie from Laravel
          await authService.getCsrf();

          // 2. Submit credentials
          const response = await authService.login(credentials);
          const raw = response.data;

          // 3. Normalise user
          let user = extractUser(raw);

          // 4. If Laravel didn't return user data, fetch it separately
          if (!user) {
            try {
              const userRes = await authService.getUser();
              user = extractUser(userRes.data);
            } catch {
              // /api/user route may not exist — that's ok if login succeeded
            }
          }

          if (!user) {
            // Login endpoint returned 200 but no user — treat as success,
            // user might be embedded differently. Store what we have.
            user = { role: 'investor', ...raw };
          }

          // Ensure role is resolved
          user = { ...user, role: resolveRole(user) };

          set({ user, isAuthenticated: true, loading: false, error: null });
          return { success: true, user };

        } catch (err) {
          const data = err.response?.data;
          // Extract error message — Laravel can return it in different shapes
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
      // Only persist user + auth state, not loading/error
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
