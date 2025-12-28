export const AUTH_ENDPOINTS = Object.freeze({
  auth: Object.freeze({
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  }),

  usuarios: Object.freeze({
    base: '/usuarios',
    byId: (id) => `/usuarios/${id}`,

    opcoes: Object.freeze({
      vendedores: '/usuarios/opcoes/vendedores',
    }),

    perfis: Object.freeze({
      base: (usuarioId) => `/usuarios/${usuarioId}/perfis`,
      remover: (usuarioId, perfilId) => `/usuarios/${usuarioId}/perfis/${perfilId}`,
    }),
  }),

  perfis: Object.freeze({
    base: '/perfis',
    byId: (id) => `/perfis/${id}`,

    permissoes: Object.freeze({
      base: (perfilId) => `/perfis/${perfilId}/permissoes`,
      remover: (perfilId, permissaoId) => `/perfis/${perfilId}/permissoes/${permissaoId}`,
    }),
  }),

  permissoes: Object.freeze({
    base: '/permissoes',
    byId: (id) => `/permissoes/${id}`,
  }),

  monitoramento: Object.freeze({
    cache: '/monitoramento/cache',
  }),
});

export default AUTH_ENDPOINTS;
