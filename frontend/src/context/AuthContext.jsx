import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token
  const [error, setError]     = useState(null);

  // ── Validate stored token on mount ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    API.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);

      // Fetch user profile
      const profile = await API.get('/auth/me');
      setUser(profile.data);
      return profile.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    setError(null);
    try {
      await API.post('/auth/register', { username, email, password });
      // Auto-login after registration
      return await login({ email, password });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  }, [login]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  // ── Clear error ─────────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
