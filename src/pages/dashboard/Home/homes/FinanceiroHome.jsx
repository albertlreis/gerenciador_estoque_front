import React from 'react';
import { useNavigate } from 'react-router-dom';
import useDashboardFinanceiro from '../../../../hooks/dashboard/useDashboardFinanceiro';
import KpiCard from '../../../../components/dashboard/KpiCard';
import PendingList from '../../../../components/dashboard/PendingList';
import QuickActions from '../../../../components/dashboard/QuickActions';
import DashboardFilters from '../../../../components/dashboard/DashboardFilters';
import EmptyState from '../../../../components/dashboard/EmptyState';

export default function FinanceiroHome() {
  const navigate = useNavigate();
  const { data, loading, error, empty, filters, setFilters, refresh } = useDashboardFinanceiro();

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
        title="Sem dados financeiros para o período"
        description="Ajuste os filtros ou cadastre novos lançamentos."
        actionLabel="Ir para lançamentos"
        onAction={() => navigate('/financeiro/lancamentos')}
      />
    );
  }

  return (
    <div>
      <DashboardFilters filters={filters} onChange={setFilters} onRefresh={refresh} />

      <div className="grid">
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="A receber vencido (R$)" kpi={kpis.receber_vencido_valor} currency onClick={() => navigate('/financeiro/contas-receber')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="A receber vencido (qtd)" kpi={kpis.receber_vencido_qtd} onClick={() => navigate('/financeiro/contas-receber')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="A pagar vencido (R$)" kpi={kpis.pagar_vencido_valor} currency onClick={() => navigate('/financeiro/contas-pagar')} />
        </div>
        <div className="col-12 md:col-6 xl:col-3">
          <KpiCard title="A pagar vencido (qtd)" kpi={kpis.pagar_vencido_qtd} onClick={() => navigate('/financeiro/contas-pagar')} />
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
          actions={[
            { label: 'Contas a Receber', icon: 'pi pi-wallet', onClick: () => navigate('/financeiro/contas-receber'), primary: true },
            { label: 'Contas a Pagar', icon: 'pi pi-credit-card', onClick: () => navigate('/financeiro/contas-pagar') },
            { label: 'Lançamentos', icon: 'pi pi-list', onClick: () => navigate('/financeiro/lancamentos') },
            { label: 'Transferências', icon: 'pi pi-arrow-right-arrow-left', onClick: () => navigate('/financeiro/transferencias') },
            { label: 'Exportar', icon: 'pi pi-download', onClick: () => navigate('/relatorios') },
          ]}
        />
      </div>
    </div>
  );
}
