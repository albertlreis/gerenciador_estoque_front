import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid } from '../helper/isTokenValid';
import apiEstoque from '../services/apiEstoque';

const AuthContext = createContext();

/**
 * Provedor global de autenticação.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && isTokenValid()) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);

        apiEstoque.defaults.headers.common['X-Permissoes'] = JSON.stringify(parsed.permissoes || []);
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setIsLoadingUser(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    apiEstoque.defaults.headers.common['X-Permissoes'] = JSON.stringify(userData.permissoes || []);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoadingUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acesso ao contexto de autenticação.
 */
export const useAuth = () => useContext(AuthContext);
