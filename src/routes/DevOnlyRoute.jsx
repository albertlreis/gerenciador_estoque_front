import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';
import isDeveloperUser from '../utils/isDeveloperUser';
import LoadingScreen from '../components/LoadingScreen';

const DevOnlyRoute = ({ element }) => {
  const { user, isLoadingUser } = useAuth();
  const { has } = usePermissions();

  if (isLoadingUser) return <LoadingScreen />;

  const permitido =
    has(PERMISSOES.ESTOQUE.IMPORTAR_PLANILHA_DEV) ||
    isDeveloperUser(user);

  return permitido ? element : <Navigate to="/acesso-negado" replace />;
};

export default DevOnlyRoute;

