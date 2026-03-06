import React from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import DashboardHome from './dashboard/Home';

/**
 * Página inicial do sistema.
 */
const HomePage = () => {
  return (
    <SakaiLayout>
      <DashboardHome />
    </SakaiLayout>
  );
};

export default HomePage;
