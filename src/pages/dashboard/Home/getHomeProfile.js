const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export default function getHomeProfile(user) {
  const perfis = Array.isArray(user?.perfis) ? user.perfis.map(normalize) : [];
  const permissoes = new Set(Array.isArray(user?.permissoes) ? user.permissoes : []);

  if (perfis.includes('administrador') || permissoes.has('dashboard.admin')) {
    return 'admin';
  }

  if (perfis.includes('financeiro') || permissoes.has('financeiro.dashboard.visualizar')) {
    return 'financeiro';
  }

  if (
    perfis.includes('estoquista')
    || permissoes.has('estoque.movimentacao')
    || permissoes.has('estoque.movimentar')
  ) {
    return 'estoque';
  }

  return 'vendedor';
}
