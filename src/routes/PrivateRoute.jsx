import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../helper/isTokenValid';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const PrivateRoute = ({ element }) => {
  const { isLoadingUser } = useAuth();

  if (isLoadingUser) return <LoadingScreen />;

  return isTokenValid() ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
