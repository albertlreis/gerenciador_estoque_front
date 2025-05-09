import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../helper';

const PrivateRoute = ({ element }) => {
  return isTokenValid() ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
