import React from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import HomeAdminView from '../components/home/HomeAdminView';
import HomeVendedorView from '../components/home/HomeVendedorView';
import usePermissions from "../hooks/usePermissions";

/**
 * Página inicial que redireciona o usuário para a interface adequada.
 */
const HomePage = () => {
  const { has } = usePermissions();

  return (
    <SakaiLayout>
      {has('dashboard.admin') ? <HomeAdminView /> : <HomeVendedorView />}
    </SakaiLayout>
  );
};

export default HomePage;
