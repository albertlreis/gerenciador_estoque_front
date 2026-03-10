import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardHome from './index';

let mockUser = { perfis: ['Administrador'], permissoes: [] };

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock('./homes/AdminHome', () => () => <div>Admin Home</div>);
jest.mock('./homes/FinanceiroHome', () => () => <div>Financeiro Home</div>);
jest.mock('./homes/EstoquistaHome', () => () => <div>Estoque Home</div>);
jest.mock('./homes/VendedorHome', () => () => <div>Vendedor Home</div>);
jest.mock('../../../components/dashboard/EmptyState', () => ({ title, description }) => (
  <div>
    <span>{title}</span>
    <span>{description}</span>
  </div>
));

describe('DashboardHome', () => {
  it('renderiza Home de administrador quando houver múltiplos perfis', () => {
    mockUser = { perfis: ['Vendedor', 'Administrador'], permissoes: [] };
    render(<DashboardHome />);
    expect(screen.getByText('Admin Home')).toBeInTheDocument();
  });

  it('renderiza Home financeiro quando não for admin', () => {
    mockUser = { perfis: ['Financeiro'], permissoes: [] };
    render(<DashboardHome />);
    expect(screen.getByText('Financeiro Home')).toBeInTheDocument();
  });

  it('renderiza Home vendedor como fallback', () => {
    mockUser = { perfis: ['Vendedor'], permissoes: [] };
    render(<DashboardHome />);
    expect(screen.getByText('Vendedor Home')).toBeInTheDocument();
  });

  it('exibe estado sem dashboard quando não houver perfil compatível', () => {
    mockUser = { perfis: ['Desenvolvedor'], permissoes: ['home.visualizar'] };
    render(<DashboardHome />);
    expect(screen.getByText('Nenhum dashboard disponível')).toBeInTheDocument();
  });
});
