import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'primereact/chart';
import useDashboardAdmin from '../../../../hooks/dashboard/useDashboardAdmin';
import KpiCard from '../../../../components/dashboard/KpiCard';
import PendingCard from '../../../../components/dashboard/PendingCard';
import PendingList from '../../../../components/dashboard/PendingList';
import QuickActions from '../../../../components/dashboard/QuickActions';
import DashboardFilters from '../../../../components/dashboard/DashboardFilters';
import EmptyState from '../../../../components/dashboard/EmptyState';
import { buildSeriesData, buildSeriesDataWithCompare } from '../chartHelpers';
import usePermissions from '../../../../hooks/usePermissions';
import { PERMISSOES } from '../../../../constants/permissoes';
import { filterDashboardActions } from '../homeConfig';

export default function AdminHome() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const { data, loading, error, filters, setFilters, refresh } = useDashboardAdmin();

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
        '#2563eb',
        '#94a3b8',
      );
    }

    return buildSeriesData(pedidosSerie, 'Pedidos', '#2563eb');
  }, [pedidosSerie, pedidosSeriePrevious]);

  const faturamentoChartData = useMemo(() => {
    if (faturamentoSeriePrevious.length > 0) {
      return buildSeriesDataWithCompare(
        faturamentoSerie,
        faturamentoSeriePrevious,
        'Faturamento',
        'Período anterior',
        '#059669',
        '#94a3b8',
      );
    }

    return buildSeriesData(faturamentoSerie, 'Faturamento', '#059669');
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

  return (
    <div>
      <DashboardFilters filters={filters} onChange={setFilters} onRefresh={refresh} allowCompare />

      <div className="grid">
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Vendas no período"
            kpi={kpis.vendas_total}
            currency
            onClick={has(PERMISSOES.PEDIDOS.VISUALIZAR) ? () => navigate('/pedidos') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Pedidos no período"
            kpi={kpis.pedidos_total}
            onClick={has(PERMISSOES.PEDIDOS.VISUALIZAR) ? () => navigate('/pedidos') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Ticket médio"
            kpi={kpis.ticket_medio}
            currency
            onClick={has(PERMISSOES.PEDIDOS.VISUALIZAR) ? () => navigate('/pedidos') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Clientes únicos"
            kpi={kpis.clientes_unicos}
            onClick={has(PERMISSOES.CLIENTES.VISUALIZAR) ? () => navigate('/clientes') : undefined}
          />
        </div>
      </div>

      <div className="grid mt-1">
        <div className="col-12 md:col-4">
          <PendingCard
            title="Itens com entrega pendente"
            value={pendencias.itens_entrega_pendente_qtd}
            onClick={has(PERMISSOES.PEDIDOS.VISUALIZAR) ? () => navigate('/pedidos?entrega_pendente=1') : undefined}
          />
        </div>
        <div className="col-12 md:col-4">
          <PendingCard
            title="Consignações vencendo"
            value={pendencias.consignacoes_vencendo_qtd}
            onClick={has(PERMISSOES.CONSIGNACOES.VISUALIZAR) ? () => navigate('/consignacoes?status=pendente') : undefined}
          />
        </div>
        <div className="col-12 md:col-4">
          <PendingCard
            title="Pedidos em aberto"
            value={pendencias.pedidos_em_aberto_qtd}
            onClick={has(PERMISSOES.PEDIDOS.VISUALIZAR) ? () => navigate('/pedidos') : undefined}
          />
        </div>
        <div className="col-12">
          <PendingList
            title="Pedidos em andamento por etapa"
            items={Object.entries(pendencias.pedidos_por_etapa || {}).map(([etapa, total]) => ({ etapa, total }))}
            renderItem={(item) => (
              <div className="flex justify-content-between">
                <span className="text-capitalize">{item.etapa}</span>
                <strong>{Number(item.total || 0).toLocaleString('pt-BR')}</strong>
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
          actions={filterDashboardActions([
            {
              label: 'Novo pedido',
              icon: 'pi pi-plus',
              onClick: () => navigate('/catalogo'),
              primary: true,
              permission: PERMISSOES.PRODUTOS.CATALOGO,
            },
            {
              label: 'Importar pedido',
              icon: 'pi pi-upload',
              onClick: () => navigate('/pedidos/importar'),
              permission: PERMISSOES.PEDIDOS.IMPORTAR,
            },
            {
              label: 'Produtos',
              icon: 'pi pi-box',
              onClick: () => navigate('/produtos'),
              permission: PERMISSOES.PRODUTOS.VISUALIZAR,
            },
            {
              label: 'Estoque',
              icon: 'pi pi-warehouse',
              onClick: () => navigate('/movimentacoes-estoque'),
              permission: PERMISSOES.ESTOQUE.MOVIMENTACAO,
            },
            {
              label: 'Usuários/Acessos',
              icon: 'pi pi-users',
              onClick: () => navigate('/acessos/usuarios'),
              permission: PERMISSOES.USUARIOS.VISUALIZAR,
            },
            {
              label: 'Relatórios',
              icon: 'pi pi-chart-bar',
              onClick: () => navigate('/relatorios'),
              permission: PERMISSOES.RELATORIOS.VISUALIZAR,
            },
            {
              label: 'Configurações',
              icon: 'pi pi-cog',
              onClick: () => navigate('/configuracoes'),
              permission: PERMISSOES.CONFIGURACOES.VISUALIZAR,
            },
          ], has)}
        />
      </div>
    </div>
  );
}
