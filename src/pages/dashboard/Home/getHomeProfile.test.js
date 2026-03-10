import getHomeProfile from './getHomeProfile';

describe('getHomeProfile', () => {
  it('respeita precedência Admin > Financeiro > Estoquista > Vendedor', () => {
    expect(getHomeProfile({ perfis: ['Vendedor', 'Administrador'] })).toBe('admin');
    expect(getHomeProfile({ perfis: ['Financeiro', 'Vendedor'] })).toBe('financeiro');
    expect(getHomeProfile({ perfis: ['Estoque', 'Vendedor'] })).toBe('estoque');
    expect(getHomeProfile({ perfis: ['Estoquista', 'Vendedor'] })).toBe('estoque');
    expect(getHomeProfile({ perfis: ['Vendedor'] })).toBe('vendedor');
  });

  it('usa fallback por permissões quando perfis não vierem', () => {
    expect(getHomeProfile({ permissoes: ['dashboard.admin'] })).toBe('admin');
    expect(getHomeProfile({ permissoes: ['financeiro.dashboard.visualizar'] })).toBe('financeiro');
    expect(getHomeProfile({ permissoes: ['estoque.movimentacao'] })).toBe('estoque');
    expect(getHomeProfile({ permissoes: ['pedidos.visualizar'] })).toBe('vendedor');
  });

  it('retorna nulo quando usuário não tem perfil compatível com dashboard', () => {
    expect(getHomeProfile({ perfis: ['Desenvolvedor'], permissoes: ['home.visualizar'] })).toBeNull();
  });
});
