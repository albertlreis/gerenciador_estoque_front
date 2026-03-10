import { PERMISSOES } from '../../../constants/permissoes';

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export const HOME_PROFILES = [
  {
    key: 'admin',
    perfis: ['administrador'],
    permissoes: [PERMISSOES.DASHBOARD_ADMIN],
  },
  {
    key: 'financeiro',
    perfis: ['financeiro'],
    permissoes: [
      PERMISSOES.FINANCEIRO.DASHBOARD.VISUALIZAR,
      PERMISSOES.FINANCEIRO.LANCAMENTOS.VISUALIZAR,
      PERMISSOES.FINANCEIRO.CONTAS_RECEBER.VISUALIZAR,
      PERMISSOES.FINANCEIRO.CONTAS_PAGAR.VISUALIZAR,
    ],
  },
  {
    key: 'estoque',
    perfis: ['estoque', 'estoquista'],
    permissoes: [
      PERMISSOES.ESTOQUE.MOVIMENTACAO,
      PERMISSOES.ESTOQUE.MOVIMENTAR,
      PERMISSOES.ESTOQUE.HISTORICO,
    ],
  },
  {
    key: 'vendedor',
    perfis: ['vendedor'],
    permissoes: [
      'dashboard.vendedor',
      PERMISSOES.PEDIDOS.VISUALIZAR,
      PERMISSOES.PEDIDOS.CRIAR,
    ],
  },
];

export const normalizeDashboardValue = normalize;

export const canAccessDashboardProfile = (user, profile) => {
  const perfis = new Set(
    Array.isArray(user?.perfis) ? user.perfis.map(normalize) : []
  );
  const permissoes = new Set(Array.isArray(user?.permissoes) ? user.permissoes : []);

  return profile.perfis.some((perfil) => perfis.has(normalize(perfil)))
    || profile.permissoes.some((permissao) => permissoes.has(permissao));
};

export const getDashboardProfileKey = (user) => {
  const profile = HOME_PROFILES.find((item) => canAccessDashboardProfile(user, item));
  return profile?.key ?? null;
};

export const filterDashboardActions = (actions, has) =>
  actions.filter((action) => !action.permission || has(action.permission));
