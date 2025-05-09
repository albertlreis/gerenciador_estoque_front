import React, { createContext, useContext, useEffect, useState } from 'react';
import { isTokenValid } from '../helper';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Carrega o usuário do localStorage (se válido)
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && isTokenValid()) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (permissoes) => {
    if (!user?.permissoes) return false;
    const list = Array.isArray(permissoes) ? permissoes : [permissoes];
    return list.some((p) => user.permissoes.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
