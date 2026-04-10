import { createContext, useContext, useState, useEffect } from 'react';
import { canCallApi, getDrfToken, setBackendConfig, clearStoredJwtTokens } from '../services/productsApi';

const AuthContext = createContext();

const ADMIN_SESSION_KEY = 'goldymart_admin_session';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = getDrfToken();

    if (canCallApi() && token && typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (raw) {
        try {
          const s = JSON.parse(raw);
          if (s?.username) {
            setIsAuthenticated(true);
            setAdmin({ username: s.username, name: s.name || s.username });
            return;
          }
        } catch {
          /* fall through */
        }
      }
    }

    const session = localStorage.getItem('goldymart_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.isLoggedIn) {
          setIsAuthenticated(true);
          setAdmin(sessionData.admin);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  /** Legacy local admin (only when no API URL). */
  const login = (username, password) => {
    if (canCallApi()) {
      return {
        success: false,
        error: 'Use your Django superuser login — the app uses the API for admin access.',
      };
    }
    const raw = localStorage.getItem('goldymart_admin');
    if (!raw) {
      return { success: false, error: 'Invalid username or password' };
    }
    let storedAdmin;
    try {
      storedAdmin = JSON.parse(raw);
    } catch {
      return { success: false, error: 'Invalid username or password' };
    }
    if (!storedAdmin?.username || storedAdmin.password == null) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (username === storedAdmin.username && password === storedAdmin.password) {
      const sessionData = {
        isLoggedIn: true,
        admin: { username: storedAdmin.username, name: storedAdmin.name },
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('goldymart_session', JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setAdmin(sessionData.admin);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  /** After successful JWT obtain (Django superuser). */
  const loginWithBackend = (username, displayName) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({ username, name: displayName || username })
      );
    }
    setIsAuthenticated(true);
    setAdmin({ username, name: displayName || username });
    return { success: true };
  };

  const logout = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
    localStorage.removeItem('goldymart_session');
    clearStoredJwtTokens();
    if (import.meta.env.VITE_API_URL) {
      setBackendConfig(undefined, null, null);
    }
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const updateAdminCredentials = (newUsername, newPassword, newName) => {
    const updatedAdmin = {
      username: newUsername,
      password: newPassword,
      name: newName,
    };
    localStorage.setItem('goldymart_admin', JSON.stringify(updatedAdmin));

    try {
      const session = localStorage.getItem('goldymart_session');
      if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.isLoggedIn) {
          const next = {
            isLoggedIn: true,
            admin: { username: newUsername, name: newName || 'Administrator' },
            loginTime: new Date().toISOString(),
          };
          localStorage.setItem('goldymart_session', JSON.stringify(next));
          setAdmin(next.admin);
        }
      }
      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (raw) {
          const j = JSON.parse(raw);
          sessionStorage.setItem(
            ADMIN_SESSION_KEY,
            JSON.stringify({
              username: newUsername,
              name: newName || j.name || newUsername,
            })
          );
          setAdmin({ username: newUsername, name: newName || j.name || newUsername });
        }
      }
    } catch {
      /* ignore */
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        admin,
        login,
        loginWithBackend,
        logout,
        updateAdminCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
