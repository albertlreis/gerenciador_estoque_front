import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PermissaoRoute = ({ element, permissoes }) => {
  const { hasPermission } = useAuth();
  return hasPermission(permissoes) ? element : <Navigate to="/" replace />;
};

export default PermissaoRoute;
