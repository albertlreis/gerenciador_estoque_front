import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import getHomeProfile from './getHomeProfile';
import AdminHome from './homes/AdminHome';
import FinanceiroHome from './homes/FinanceiroHome';
import EstoquistaHome from './homes/EstoquistaHome';
import VendedorHome from './homes/VendedorHome';

export default function DashboardHome() {
  const { user } = useAuth();
  const profile = getHomeProfile(user);

  if (profile === 'admin') {
    return <AdminHome />;
  }

  if (profile === 'financeiro') {
    return <FinanceiroHome />;
  }

  if (profile === 'estoque') {
    return <EstoquistaHome />;
  }

  return <VendedorHome />;
}
