import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardEstoque from '../../../../hooks/dashboard/useDashboardEstoque';
import KpiCard from '../../../../components/dashboard/KpiCard';
import PendingCard from '../../../../components/dashboard/PendingCard';
import PendingList from '../../../../components/dashboard/PendingList';
import QuickActions from '../../../../components/dashboard/QuickActions';
import DashboardFilters from '../../../../components/dashboard/DashboardFilters';
import EmptyState from '../../../../components/dashboard/EmptyState';

export default function EstoquistaHome() {
  const navigate = useNavigate();
  const { data, loading, error, empty, filters, setFilters, refresh } = useDashboardEstoque();

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

  if (empty) {
    return (
      <EmptyState
        title="Sem dados de estoque para o período"
        description="Registre uma movimentação para iniciar os indicadores."
        actionLabel="Movimentar estoque"
        onAction={() => navigate('/movimentacoes-estoque')}
      />
    );
  }

  return (
    <div>
      <DashboardFilters filters={filters} onChange={setFilters} onRefresh={refresh} />

      <div className="grid">
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Estoque baixo" kpi={kpis.estoque_baixo_qtd} onClick={() => navigate('/produtos')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Entradas no período" kpi={kpis.entradas_qtd} onClick={() => navigate('/movimentacoes-estoque')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Saídas no período" kpi={kpis.saidas_qtd} onClick={() => navigate('/movimentacoes-estoque')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="Transferências no período" kpi={kpis.transferencias_qtd} onClick={() => navigate('/movimentacoes-estoque')} />
        </div>
      </div>

      <div className="grid mt-1">
        <div className="col-12 md:col-6">
          <PendingCard
            title="Itens com entrega pendente"
            value={pendencias.itens_entrega_pendente_qtd}
            onClick={() => navigate('/pedidos?entrega_pendente=1')}
          />
        </div>
        <div className="col-12 md:col-6">
          <PendingCard
            title="Consignações vencendo"
            value={pendencias.consignacoes_vencendo_qtd}
            onClick={() => navigate('/consignacoes?status=pendente')}
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
          actions={[
            { label: 'Dar entrada', icon: 'pi pi-plus', onClick: () => navigate('/movimentacoes-estoque'), primary: true },
            { label: 'Registrar saída', icon: 'pi pi-minus', onClick: () => navigate('/movimentacoes-estoque') },
            { label: 'Transferir depósito', icon: 'pi pi-send', onClick: () => navigate('/movimentacoes-estoque') },
            { label: 'Ajuste', icon: 'pi pi-pencil', onClick: () => navigate('/movimentacoes-estoque') },
            { label: 'Itens críticos', icon: 'pi pi-exclamation-triangle', onClick: () => navigate('/produtos') },
          ]}
        />
      </div>
    </div>
  );
}
