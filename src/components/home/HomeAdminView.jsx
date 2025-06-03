import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { useAuth } from '../../context/AuthContext';
import { getGravatarUrl, getInitials } from '../../utils/gravatar';

import useDashboardData from '../../hooks/useDashboardData';
import usePermissions from '../../hooks/usePermissions';

import KpiCards from './KpiCards';
import ChartsSection from './ChartsSection';
import QuickLinks from './QuickLinks';
import UltimosPedidosCard from './UltimosPedidosCard';
import ConsignacoesAlert from './ConsignacoesAlert';
import ModaisDashboard from './ModaisDashboard';
import {PERFIS} from "../../constants/perfis";

const HomeAdminView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { has } = usePermissions();

  const {
    kpis, ultimosPedidos, graficoPedidos, graficoValores,
    graficoStatus, estoqueCritico, pedidosMes, clientesMes,
    modalKpi, exibirModalEstoque, periodo, tipoGrafico,
    setModalKpi, setExibirModalEstoque, setPeriodo, setTipoGrafico,
    handleAtualizarGrafico,
    loadingKpis, loadingPedidos, loadingEstatisticas, loadingStatus,
    consignacoesVencendo, loadingConsignacoes
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
        perfil={PERFIS.ADMINISTRADOR.slug}
        kpis={kpis}
        loading={loadingKpis}
        setModalKpi={setModalKpi}
        setExibirModalEstoque={setExibirModalEstoque}
      />

      <QuickLinks perfil={PERFIS.ADMINISTRADOR.slug} hasPermission={has} navigate={navigate} />

      <ChartsSection
        perfil={PERFIS.ADMINISTRADOR.slug}
        graficoPedidos={graficoPedidos}
        graficoValores={graficoValores}
        graficoStatus={graficoStatus}
        carregandoGrafico={loadingEstatisticas}
        carregandoStatus={loadingStatus}
        periodo={periodo}
        tipoGrafico={tipoGrafico}
        setPeriodo={setPeriodo}
        setTipoGrafico={setTipoGrafico}
        handleAtualizarGrafico={handleAtualizarGrafico}
      />

      <div className="grid">
        <div className="col-12 md:col-6">
          <UltimosPedidosCard pedidos={ultimosPedidos} loading={loadingPedidos} navigate={navigate} />
        </div>
        <div className="col-12 md:col-6">
          <ConsignacoesAlert consignacoesVencendo={consignacoesVencendo} loading={loadingConsignacoes} />
        </div>
      </div>

      <ModaisDashboard
        perfil={PERFIS.ADMINISTRADOR.slug}
        modalKpi={modalKpi}
        setModalKpi={setModalKpi}
        pedidosMes={pedidosMes}
        clientesMes={clientesMes}
        exibirModalEstoque={exibirModalEstoque}
        setExibirModalEstoque={setExibirModalEstoque}
        estoqueCritico={estoqueCritico}
      />
    </div>
  );
};

export default HomeAdminView;
