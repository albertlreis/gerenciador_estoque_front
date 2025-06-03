import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData';
import usePermissions from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { getGravatarUrl, getInitials } from '../../utils/gravatar';

import KpiCards from './KpiCards';
import QuickLinks from './QuickLinks';
import UltimosPedidosCard from './UltimosPedidosCard';
import ConsignacoesAlert from './ConsignacoesAlert';
import ModaisDashboard from './ModaisDashboard';
import {PERFIS} from "../../constants/perfis";

const HomeVendedorView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { has } = usePermissions();

  const {
    kpis, ultimosPedidos, consignacoesVencendo,
    pedidosMes, clientesMes,
    loadingKpis, loadingPedidos, loadingConsignacoes
  } = useDashboardData();

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <div className="flex align-items-center gap-3">
          <Avatar image={getGravatarUrl(user?.email)} label={getInitials(user?.nome)} />
          <div>
            <h2 className="m-0">Bem-vindo, {user?.nome}</h2>
            <Tag value={user?.email} severity="info" />
          </div>
        </div>
      </div>

      <KpiCards
        perfil="Vendedor"
        kpis={kpis}
        loading={loadingKpis}
      />

      <QuickLinks perfil={PERFIS.VENDEDOR.slug} hasPermission={has} navigate={navigate} />

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
