import React from 'react';
import { render, screen } from '@testing-library/react';
import VendedorHome from './VendedorHome';
import EstoquistaHome from './EstoquistaHome';
import FinanceiroHome from './FinanceiroHome';

const usePermissionsMock = jest.fn(() => ({ has: () => true }));
const useNavigateMock = jest.fn();
const vendedorHook = jest.fn();
const estoqueHook = jest.fn();
const financeiroHook = jest.fn();

jest.mock('../../../../hooks/usePermissions', () => () => usePermissionsMock());
jest.mock('react-router-dom', () => ({
  useNavigate: () => useNavigateMock,
}));
jest.mock('../../../../hooks/dashboard/useDashboardVendedor', () => () => vendedorHook());
jest.mock('../../../../hooks/dashboard/useDashboardEstoque', () => () => estoqueHook());
jest.mock('../../../../hooks/dashboard/useDashboardFinanceiro', () => () => financeiroHook());
jest.mock('primereact/chart', () => ({
  Chart: () => <div>Chart</div>,
}));

const baseState = {
  loading: false,
  error: null,
  empty: true,
  filters: { period: 'month', compare: 0 },
  setFilters: jest.fn(),
  refresh: jest.fn(),
};

describe('Profile homes', () => {
  it('renderiza vendedor com atalhos e blocos básicos mesmo sem movimentação', () => {
    vendedorHook.mockReturnValue({
      ...baseState,
      data: { kpis: {}, pendencias: {}, series: {} },
    });

    render(<VendedorHome />);

    expect(screen.getByText('Ações rápidas')).toBeInTheDocument();
    expect(screen.getByText('Sem série de pedidos')).toBeInTheDocument();
    expect(screen.queryByText('Importar pedido')).not.toBeInTheDocument();
  });

  it('renderiza estoque com atalhos básicos mesmo sem movimentação', () => {
    estoqueHook.mockReturnValue({
      ...baseState,
      data: { kpis: {}, pendencias: {} },
    });

    render(<EstoquistaHome />);

    expect(screen.getByText('Ações rápidas')).toBeInTheDocument();
    expect(screen.getByText('Últimas movimentações')).toBeInTheDocument();
  });

  it('renderiza financeiro com estrutura básica mesmo sem pendências', () => {
    financeiroHook.mockReturnValue({
      ...baseState,
      data: { kpis: {}, pendencias: {} },
    });

    render(<FinanceiroHome />);

    expect(screen.getByText('Ações rápidas')).toBeInTheDocument();
    expect(screen.getByText('Top 10 contas a receber vencidas')).toBeInTheDocument();
  });
});
