import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePermissions from '../hooks/usePermissions';
import LoadingScreen from "../components/LoadingScreen";

/**
 * Componente de rota protegida por permissões específicas.
 * Redireciona para a Home se o usuário não possuir as permissões exigidas.
 */
const PermissaoRoute = ({ element, permissoes }) => {
  const { isLoadingUser } = useAuth();
  const { has } = usePermissions();

  if (isLoadingUser) return <LoadingScreen />;

  return has(permissoes) ? element : <Navigate to="/acesso-negado" replace />;
};

export default PermissaoRoute;
