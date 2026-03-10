import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardEstoque from '../../../../hooks/dashboard/useDashboardEstoque';
import KpiCard from '../../../../components/dashboard/KpiCard';
import PendingCard from '../../../../components/dashboard/PendingCard';
import PendingList from '../../../../components/dashboard/PendingList';
import QuickActions from '../../../../components/dashboard/QuickActions';
import DashboardFilters from '../../../../components/dashboard/DashboardFilters';
import EmptyState from '../../../../components/dashboard/EmptyState';
import usePermissions from '../../../../hooks/usePermissions';
import { PERMISSOES } from '../../../../constants/permissoes';
import { filterDashboardActions } from '../homeConfig';

export default function EstoquistaHome() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const { data, loading, error, filters, setFilters, refresh } = useDashboardEstoque();

  const kpis = data?.kpis || {};
  const pendencias = data?.pendencias || {};

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
      <DashboardFilters filters={filters} onChange={setFilters} onRefresh={refresh} />

      <div className="grid">
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Estoque baixo"
            kpi={kpis.estoque_baixo_qtd}
            onClick={has(PERMISSOES.PRODUTOS.VISUALIZAR) ? () => navigate('/produtos') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Entradas no período"
            kpi={kpis.entradas_qtd}
            onClick={has(PERMISSOES.ESTOQUE.MOVIMENTACAO) ? () => navigate('/movimentacoes-estoque') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Saídas no período"
            kpi={kpis.saidas_qtd}
            onClick={has(PERMISSOES.ESTOQUE.MOVIMENTACAO) ? () => navigate('/movimentacoes-estoque') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="Transferências no período"
            kpi={kpis.transferencias_qtd}
            onClick={has(PERMISSOES.ESTOQUE.MOVIMENTACAO) ? () => navigate('/movimentacoes-estoque') : undefined}
          />
        </div>
      </div>

      <div className="grid mt-1">
        <div className="col-12 md:col-6">
          <PendingCard
            title="Itens com entrega pendente"
            value={pendencias.itens_entrega_pendente_qtd}
            onClick={has(PERMISSOES.PEDIDOS.VISUALIZAR) ? () => navigate('/pedidos?entrega_pendente=1') : undefined}
          />
        </div>
        <div className="col-12 md:col-6">
          <PendingCard
            title="Consignações vencendo"
            value={pendencias.consignacoes_vencendo_qtd}
            onClick={has(PERMISSOES.CONSIGNACOES.VISUALIZAR) ? () => navigate('/consignacoes?status=pendente') : undefined}
          />
        </div>
        <div className="col-12">
          <PendingList
            title="Últimas movimentações"
            items={pendencias.ultimas_movimentacoes || []}
            renderItem={(item) => (
              <div className="flex justify-content-between gap-2">
                <span>{item.tipo} - {item.produto_nome || item.referencia || 'Item'}</span>
                <strong>{item.quantidade}</strong>
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-3">
        <QuickActions
          actions={filterDashboardActions([
            {
              label: 'Dar entrada',
              icon: 'pi pi-plus',
              onClick: () => navigate('/movimentacoes-estoque'),
              primary: true,
              permission: PERMISSOES.ESTOQUE.MOVIMENTACAO,
            },
            {
              label: 'Registrar saída',
              icon: 'pi pi-minus',
              onClick: () => navigate('/movimentacoes-estoque'),
              permission: PERMISSOES.ESTOQUE.MOVIMENTACAO,
            },
            {
              label: 'Transferir depósito',
              icon: 'pi pi-send',
              onClick: () => navigate('/movimentacoes-estoque'),
              permission: PERMISSOES.ESTOQUE.MOVIMENTACAO,
            },
            {
              label: 'Ajuste',
              icon: 'pi pi-pencil',
              onClick: () => navigate('/movimentacoes-estoque'),
              permission: PERMISSOES.ESTOQUE.MOVIMENTACAO,
            },
            {
              label: 'Itens críticos',
              icon: 'pi pi-exclamation-triangle',
              onClick: () => navigate('/produtos'),
              permission: PERMISSOES.PRODUTOS.VISUALIZAR,
            },
          ], has)}
        />
      </div>
    </div>
  );
}
