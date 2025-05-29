import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { LogOut } from 'lucide-react';

import SakaiLayout from '../layouts/SakaiLayout';
import { useAuth } from '../context/AuthContext';
import { getGravatarUrl, getInitials } from '../utils/gravatar';

import useDashboardData from '../hooks/useDashboardData';
import KpiCards from '../components/home/KpiCards';
import ChartsSection from '../components/home/ChartsSection';
import QuickLinks from '../components/home/QuickLinks';
import UltimosPedidosCard from '../components/home/UltimosPedidosCard';
import ModaisDashboard from '../components/home/ModaisDashboard';
import ConsignacoesAlert from "../components/home/ConsignacoesAlert";

const HomePage = () => {
  const navigate = useNavigate();
  const { logout, user, hasPermission } = useAuth();

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
    <SakaiLayout>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <div className="flex align-items-center gap-3">
            <Avatar image={getGravatarUrl(user?.email)} label={getInitials(user?.nome)} />
            <div>
              <h2 className="m-0">Bem-vindo, {user?.nome}</h2>
              <Tag value={user?.email} severity="info" />
            </div>
          </div>
          <Button icon={<LogOut size={18} />} label="Sair" className="p-button-danger" onClick={logout} />
        </div>

        <KpiCards
          kpis={kpis}
          loading={loadingKpis}
          setModalKpi={setModalKpi}
          setExibirModalEstoque={setExibirModalEstoque}
        />

        <QuickLinks hasPermission={hasPermission} navigate={navigate} />

        <ChartsSection
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
            <UltimosPedidosCard pedidos={ultimosPedidos} loading={loadingPedidos} navigate={navigate}/>
          </div>
          <div className="col-12 md:col-6">
            <ConsignacoesAlert
              consignacoesVencendo={consignacoesVencendo}
              loading={loadingConsignacoes}
            />
          </div>
        </div>

        <ModaisDashboard
          modalKpi={modalKpi}
          setModalKpi={setModalKpi}
          pedidosMes={pedidosMes}
          clientesMes={clientesMes}
          exibirModalEstoque={exibirModalEstoque}
          setExibirModalEstoque={setExibirModalEstoque}
          estoqueCritico={estoqueCritico}
        />
      </div>
    </SakaiLayout>
  );
};

export default HomePage;
