import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../../hooks/useDashboardData';
import usePermissions from '../../hooks/usePermissions';

import DashboardHeader from './DashboardHeader';
import KpiCards from './KpiCards';
import ChartsSection from './ChartsSection';
import QuickLinks from './QuickLinks';
import UltimosPedidosCard from './UltimosPedidosCard';
import ConsignacoesAlert from './ConsignacoesAlert';
import ModaisDashboard from './ModaisDashboard';
import {PERFIS} from "../../constants/perfis";

const HomeAdminView = () => {
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const { has } = usePermissions();

  const {
    kpis, ultimosPedidos, graficoPedidos, graficoValores,
    graficoStatus, estoqueCritico, pedidosMes, clientesMes,
    modalKpi, exibirModalEstoque, periodo, tipoGrafico,
    setModalKpi, setExibirModalEstoque, setPeriodo, setTipoGrafico,
    handleAtualizarGrafico,
    loadingKpis, loadingPedidos, loadingEstatisticas,
    consignacoesVencendo, loadingConsignacoes, fetchResumoDashboard,
    sugestoesOutlet, diasLimiteOutlet, loadingSugestoesOutlet,
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
        perfil={PERFIS.ADMINISTRADOR.slug}
        kpis={kpis}
        loading={loadingKpis}
        setModalKpi={setModalKpi}
        setExibirModalEstoque={setExibirModalEstoque}
      />

      <QuickLinks perfil={PERFIS.ADMINISTRADOR.slug} hasPermission={has} navigate={navigate}/>

      <ChartsSection
        perfil={PERFIS.ADMINISTRADOR.slug}
        graficoPedidos={graficoPedidos}
        graficoValores={graficoValores}
        graficoStatus={graficoStatus}
        carregandoGrafico={loadingEstatisticas}
        carregandoStatus={loadingEstatisticas}
        periodo={periodo}
        tipoGrafico={tipoGrafico}
        setPeriodo={setPeriodo}
        setTipoGrafico={setTipoGrafico}
        handleAtualizarGrafico={handleAtualizarGrafico}
      />

      <div className="grid">
        <div className="col-12 md:col-6">
          <UltimosPedidosCard pedidos={ultimosPedidos} loading={loadingPedidos} navigate={navigate}/>
        </div>
        <div className="col-12 md:col-6">
          <ConsignacoesAlert consignacoesVencendo={consignacoesVencendo} loading={loadingConsignacoes}/>
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
