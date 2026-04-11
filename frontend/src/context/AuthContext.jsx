import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function readSession() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    token,
    userId: localStorage.getItem('userId'),
    userType: localStorage.getItem('userType'),
    email: localStorage.getItem('userEmail'),
    displayName: localStorage.getItem('userDisplayName'),
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readSession());

  const refreshSession = useCallback(() => {
    setUser(readSession());
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (
        e.key === 'token' ||
        e.key === 'userId' ||
        e.key === 'userType' ||
        e.key === 'userEmail' ||
        e.key === 'userDisplayName' ||
        e.key === null
      ) {
        setUser(readSession());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(
    (payload) => {
      if (payload && typeof payload === 'object') {
        if (payload.token != null) localStorage.setItem('token', payload.token);
        if (payload.user_id != null) localStorage.setItem('userId', String(payload.user_id));
        const ut = payload.user_type ?? payload.userType;
        if (ut) localStorage.setItem('userType', ut);
        if (payload.email) localStorage.setItem('userEmail', payload.email);
        if (payload.display_name != null) localStorage.setItem('userDisplayName', String(payload.display_name));
      }
      setUser(readSession());
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      login,
      logout,
      refreshSession,
    }),
    [user, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
