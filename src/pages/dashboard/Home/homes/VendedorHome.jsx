import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'primereact/chart';
import useDashboardVendedor from '../../../../hooks/dashboard/useDashboardVendedor';
import KpiCard from '../../../../components/dashboard/KpiCard';
import PendingCard from '../../../../components/dashboard/PendingCard';
import PendingList from '../../../../components/dashboard/PendingList';
import QuickActions from '../../../../components/dashboard/QuickActions';
import DashboardFilters from '../../../../components/dashboard/DashboardFilters';
import EmptyState from '../../../../components/dashboard/EmptyState';
import { buildSeriesData, buildSeriesDataWithCompare } from '../chartHelpers';

export default function VendedorHome() {
  const navigate = useNavigate();
  const { data, loading, error, empty, filters, setFilters, refresh } = useDashboardVendedor();

  const kpis = data?.kpis || {};
  const pendencias = data?.pendencias || {};
  const series = data?.series || {};

  const pedidosSerie = Array.isArray(series.pedidos_serie) ? series.pedidos_serie : [];
  const faturamentoSerie = Array.isArray(series.faturamento_serie) ? series.faturamento_serie : [];
  const pedidosSeriePrevious = series?.compare?.pedidos_serie_previous || [];
  const faturamentoSeriePrevious = series?.compare?.faturamento_serie_previous || [];

  const hasSeries = pedidosSerie.length > 0 || faturamentoSerie.length > 0;

  const pedidosChartData = useMemo(() => {
    if (pedidosSeriePrevious.length > 0) {
      return buildSeriesDataWithCompare(
        pedidosSerie,
        pedidosSeriePrevious,
        'Pedidos',
        'Período anterior',
        '#0284c7',
        '#94a3b8',
      );
    }

    return buildSeriesData(pedidosSerie, 'Pedidos', '#0284c7');
  }, [pedidosSerie, pedidosSeriePrevious]);

  const faturamentoChartData = useMemo(() => {
    if (faturamentoSeriePrevious.length > 0) {
      return buildSeriesDataWithCompare(
        faturamentoSerie,
        faturamentoSeriePrevious,
        'Faturamento',
        'Período anterior',
        '#16a34a',
        '#94a3b8',
      );
    }

    return buildSeriesData(faturamentoSerie, 'Faturamento', '#16a34a');
  }, [faturamentoSerie, faturamentoSeriePrevious]);

  if (loading) {
    return <div data-testid="dashboard-loading" className="surface-card p-4 border-round shadow-1">Carregando dashboard...</div>;
  }

  if (error) {
    return (
      <EmptyState
        title="Falha ao carregar o dashboard"
        description="Revise sua conexão e tente novamente."
        actionLabel="Tentar novamente"
        onAction={refresh}
      />
    );
  }

  if (empty) {
    return (
      <EmptyState
        title="Sem dados para o período selecionado"
        description="Crie um pedido para iniciar os indicadores."
        actionLabel="Novo pedido"
        onAction={() => navigate('/catalogo')}
      />
    );
  }

  return (
    <div>
      <DashboardFilters filters={filters} onChange={setFilters} onRefresh={refresh} allowCompare />

      <div className="grid">
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Vendas no período" kpi={kpis.vendas_total} currency onClick={() => navigate('/pedidos')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Pedidos no período" kpi={kpis.pedidos_total} onClick={() => navigate('/pedidos')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Ticket médio" kpi={kpis.ticket_medio} currency onClick={() => navigate('/pedidos')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Clientes únicos" kpi={kpis.clientes_unicos} onClick={() => navigate('/clientes')} />
        </div>
      </div>

      <div className="grid mt-1">
        <div className="col-12 md:col-4">
          <PendingCard title="Pedidos em aberto" value={pendencias.pedidos_em_aberto_qtd} onClick={() => navigate('/pedidos')} />
        </div>
        <div className="col-12 md:col-8">
          <PendingList
            title="Pedidos por etapa"
            items={Object.entries(pendencias.pedidos_por_etapa || {}).map(([etapa, total]) => ({ etapa, total }))}
            renderItem={(item) => (
              <div className="flex justify-content-between">
                <span className="text-capitalize">{item.etapa}</span>
                <strong>{Number(item.total || 0).toLocaleString('pt-BR')}</strong>
              </div>
            )}
          />
        </div>
        <div className="col-12">
          <PendingList
            title="Últimos pedidos"
            items={pendencias.ultimos_pedidos || []}
            renderItem={(item) => (
              <div className="flex justify-content-between gap-2">
                <span>{item.numero_externo || `Pedido #${item.id}`} - {item.cliente_nome || 'Sem cliente'}</span>
                <strong>{Number(item.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </div>
            )}
          />
        </div>
      </div>

      <div className="grid mt-1">
        <div className="col-12 lg:col-6">
          {hasSeries ? (
            <div className="surface-card p-3 border-round shadow-1">
              <div className="text-900 font-semibold mb-3">Série de pedidos</div>
              <Chart type="line" data={pedidosChartData} />
            </div>
          ) : (
            <EmptyState title="Sem série de pedidos" description="Não há dados para desenhar o gráfico neste período." />
          )}
        </div>
        <div className="col-12 lg:col-6">
          {hasSeries ? (
            <div className="surface-card p-3 border-round shadow-1">
              <div className="text-900 font-semibold mb-3">Série de faturamento</div>
              <Chart type="line" data={faturamentoChartData} />
            </div>
          ) : (
            <EmptyState title="Sem série de faturamento" description="Não há dados para desenhar o gráfico neste período." />
          )}
        </div>
      </div>

      <div className="mt-3">
        <QuickActions
          actions={[
            { label: 'Novo pedido', icon: 'pi pi-plus', onClick: () => navigate('/catalogo'), primary: true },
            { label: 'Catálogo', icon: 'pi pi-book', onClick: () => navigate('/catalogo') },
            { label: 'Buscar cliente', icon: 'pi pi-search', onClick: () => navigate('/clientes') },
            { label: 'Cadastrar cliente', icon: 'pi pi-user-plus', onClick: () => navigate('/clientes') },
            { label: 'Meus pedidos', icon: 'pi pi-shopping-cart', onClick: () => navigate('/pedidos') },
            { label: 'Importar pedido', icon: 'pi pi-upload', onClick: () => navigate('/pedidos/importar') },
          ]}
        />
      </div>
    </div>
  );
}
