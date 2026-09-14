import { useState, useEffect, useCallback } from 'react';
import { getMe, loginAdmin as loginAdminService } from '../services/authApi.js';
import { AuthContext } from './authContextInstance.js';

const TOKEN_STORAGE_KEY = 'portfolio_admin_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify stored token on initial application load
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getMe(storedToken);
        if (isMounted && response.success && response.data?.admin) {
          setAdmin(response.data.admin);
          setToken(storedToken);
        } else {
          throw new Error('Invalid session response');
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          setAdmin(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await loginAdminService({ email, password });
    const { token: receivedToken, admin: receivedAdmin } = response.data;

    localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
    setToken(receivedToken);
    setAdmin(receivedAdmin);

    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const value = {
    token,
    admin,
    loading,
    isAuthenticated: Boolean(token && admin),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
