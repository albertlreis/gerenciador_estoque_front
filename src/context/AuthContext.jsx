import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenValid } from '../helper/isTokenValid';
import apiEstoque from '../services/apiEstoque';
import AuthApi from '../api/authApi';

const AuthContext = createContext();

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
        apiEstoque.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
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
    apiEstoque.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    // tenta invalidar no back (rota nova)
    AuthApi.logout().catch(() => {});

    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const permissionsSet = useMemo(() => {
    const list = Array.isArray(user?.permissoes) ? user.permissoes : [];
    return new Set(list);
  }, [user]);

  const has = (permissoes) => {
    if (!permissionsSet.size || !permissoes) return false;
    const lista = Array.isArray(permissoes) ? permissoes : [permissoes];
    return lista.some((p) => !!p && permissionsSet.has(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoadingUser,
        has,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
