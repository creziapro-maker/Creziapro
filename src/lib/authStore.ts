import { create } from 'zustand';
interface AuthState {
  isAuthenticated: boolean;
  isVerifying: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isVerifying: true, // Start in verifying state on app load
  login: async (email, password) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        return false;
      }
      const result = await response.json();
      if (result.success) {
        set({ isAuthenticated: true, isVerifying: false });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },
  logout: async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      set({ isAuthenticated: false, isVerifying: false });
    }
  },
  verifyAuth: async () => {
    set({ isVerifying: true });
    try {
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false });
        }
      } else {
        set({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      set({ isAuthenticated: false });
    } finally {
      set({ isVerifying: false });
    }
  },
}));