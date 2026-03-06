import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminHome from './AdminHome';

const mockHook = jest.fn();

jest.mock('../../../../hooks/dashboard/useDashboardAdmin', () => () => mockHook());

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('primereact/chart', () => ({
  Chart: () => <div>Chart</div>,
}));

describe('AdminHome states', () => {
  it('exibe loading', () => {
    mockHook.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      empty: false,
      filters: { period: 'month', compare: 1 },
      setFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<AdminHome />);
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('exibe estado de erro', () => {
    mockHook.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('erro'),
      empty: false,
      filters: { period: 'month', compare: 1 },
      setFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<AdminHome />);
    expect(screen.getByText('Falha ao carregar o dashboard')).toBeInTheDocument();
  });

  it('exibe empty state quando não há dados', () => {
    mockHook.mockReturnValue({
      data: { kpis: {}, pendencias: {}, series: {} },
      loading: false,
      error: null,
      empty: true,
      filters: { period: 'month', compare: 1 },
      setFilters: jest.fn(),
      refresh: jest.fn(),
    });

    render(<AdminHome />);
    expect(screen.getByText('Sem dados para o período selecionado')).toBeInTheDocument();
  });
});
