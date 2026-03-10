import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardFinanceiro from '../../../../hooks/dashboard/useDashboardFinanceiro';
import KpiCard from '../../../../components/dashboard/KpiCard';
import PendingList from '../../../../components/dashboard/PendingList';
import QuickActions from '../../../../components/dashboard/QuickActions';
import DashboardFilters from '../../../../components/dashboard/DashboardFilters';
import EmptyState from '../../../../components/dashboard/EmptyState';
import usePermissions from '../../../../hooks/usePermissions';
import { PERMISSOES } from '../../../../constants/permissoes';
import { filterDashboardActions } from '../homeConfig';

export default function FinanceiroHome() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const { data, loading, error, filters, setFilters, refresh } = useDashboardFinanceiro();

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
      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={refresh}
        showPeriodFilter={false}
        showDepositoFilter={false}
      />

      <div className="grid">
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="A receber vencido (R$)"
            kpi={kpis.receber_vencido_valor}
            currency
            onClick={has(PERMISSOES.FINANCEIRO.CONTAS_RECEBER.VISUALIZAR) ? () => navigate('/financeiro/contas-receber') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="A receber vencido (qtd)"
            kpi={kpis.receber_vencido_qtd}
            onClick={has(PERMISSOES.FINANCEIRO.CONTAS_RECEBER.VISUALIZAR) ? () => navigate('/financeiro/contas-receber') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="A pagar vencido (R$)"
            kpi={kpis.pagar_vencido_valor}
            currency
            onClick={has(PERMISSOES.FINANCEIRO.CONTAS_PAGAR.VISUALIZAR) ? () => navigate('/financeiro/contas-pagar') : undefined}
          />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard
            title="A pagar vencido (qtd)"
            kpi={kpis.pagar_vencido_qtd}
            onClick={has(PERMISSOES.FINANCEIRO.CONTAS_PAGAR.VISUALIZAR) ? () => navigate('/financeiro/contas-pagar') : undefined}
          />
        </div>
      </div>

      <div className="grid mt-1">
        <div className="col-12 lg:col-6">
          <PendingList
            title="Top 10 contas a receber vencidas"
            items={pendencias.top_receber_vencidos || []}
            renderItem={(item) => (
              <div className="flex justify-content-between gap-2">
                <span>{item.titulo || 'Sem descrição'} - {item.cliente || 'Sem cliente'}</span>
                <strong>{Number(item.saldo_aberto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </div>
            )}
          />
        </div>
        <div className="col-12 lg:col-6">
          <PendingList
            title="Top 10 contas a pagar vencidas"
            items={pendencias.top_pagar_vencidos || []}
            renderItem={(item) => (
              <div className="flex justify-content-between gap-2">
                <span>{item.titulo || 'Sem descrição'} - {item.fornecedor || 'Sem fornecedor'}</span>
                <strong>{Number(item.saldo_aberto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-3">
        <QuickActions
          actions={filterDashboardActions([
            {
              label: 'Contas a Receber',
              icon: 'pi pi-wallet',
              onClick: () => navigate('/financeiro/contas-receber'),
              primary: true,
              permission: PERMISSOES.FINANCEIRO.CONTAS_RECEBER.VISUALIZAR,
            },
            {
              label: 'Contas a Pagar',
              icon: 'pi pi-credit-card',
              onClick: () => navigate('/financeiro/contas-pagar'),
              permission: PERMISSOES.FINANCEIRO.CONTAS_PAGAR.VISUALIZAR,
            },
            {
              label: 'Lançamentos',
              icon: 'pi pi-list',
              onClick: () => navigate('/financeiro/lancamentos'),
              permission: PERMISSOES.FINANCEIRO.LANCAMENTOS.VISUALIZAR,
            },
            {
              label: 'Transferências',
              icon: 'pi pi-arrow-right-arrow-left',
              onClick: () => navigate('/financeiro/transferencias'),
              permission: PERMISSOES.FINANCEIRO.LANCAMENTOS.VISUALIZAR,
            },
            {
              label: 'Exportar',
              icon: 'pi pi-download',
              onClick: () => navigate('/relatorios'),
              permission: PERMISSOES.RELATORIOS.VISUALIZAR,
            },
          ], has)}
        />
      </div>
    </div>
  );
}
