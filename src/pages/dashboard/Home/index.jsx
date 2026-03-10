import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import getHomeProfile from './getHomeProfile';
import AdminHome from './homes/AdminHome';
import FinanceiroHome from './homes/FinanceiroHome';
import EstoquistaHome from './homes/EstoquistaHome';
import VendedorHome from './homes/VendedorHome';
import EmptyState from '../../../components/dashboard/EmptyState';

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

  if (profile === 'vendedor') {
    return <VendedorHome />;
  }

  return (
    <EmptyState
      title="Nenhum dashboard disponível"
      description="Seu usuário não possui um painel inicial compatível com os perfis configurados."
    />
  );
}
