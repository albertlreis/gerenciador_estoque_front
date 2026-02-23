import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData';
import usePermissions from '../../hooks/usePermissions';

import DashboardHeader from './DashboardHeader';
import KpiCards from './KpiCards';
import QuickLinks from './QuickLinks';
import UltimosPedidosCard from './UltimosPedidosCard';
import ConsignacoesAlert from './ConsignacoesAlert';
import ModaisDashboard from './ModaisDashboard';
import AvisosCard from './AvisosCard';
import AniversariantesCard from './AniversariantesCard';
import { PERFIS } from '../../constants/perfis';

const HomeVendedorView = () => {
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const { has } = usePermissions();

  const {
    kpis, ultimosPedidos, consignacoesVencendo,
    pedidosMes, clientesMes,
    loadingKpis, loadingPedidos, loadingConsignacoes,
    fetchResumoDashboard
  } = useDashboardData();

  return (
    <div className="p-4">
      <DashboardHeader
        ref={headerRef}
        onAtualizar={async () => {
          await fetchResumoDashboard(true);
          headerRef.current?.showToast();
        }}
      />

      <KpiCards
        perfil={PERFIS.VENDEDOR.slug}
        kpis={kpis}
        loading={loadingKpis}
      />

      <QuickLinks perfil={PERFIS.VENDEDOR.slug} hasPermission={has} navigate={navigate} />

      <div className="grid mb-3">
        <div className="col-12 md:col-6">
          <AvisosCard />
        </div>
        <div className="col-12 md:col-6">
          <AniversariantesCard />
        </div>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6">
          <UltimosPedidosCard pedidos={ultimosPedidos} loading={loadingPedidos} navigate={navigate} />
        </div>
        <div className="col-12 md:col-6">
          <ConsignacoesAlert consignacoesVencendo={consignacoesVencendo} loading={loadingConsignacoes} />
        </div>
      </div>

      <ModaisDashboard
        perfil={PERFIS.VENDEDOR.slug}
        pedidosMes={pedidosMes}
        clientesMes={clientesMes}
      />
    </div>
  );
};

export default HomeVendedorView;
