import apiAuth from '../services/apiAuth';
import AUTH_ENDPOINTS from '../constants/endpointsAuth';

export const AuthApi = {
  // AUTH
  login: (payload) => apiAuth.post(AUTH_ENDPOINTS.auth.login, payload),
  register: (payload) => apiAuth.post(AUTH_ENDPOINTS.auth.register, payload),
  me: () => apiAuth.get(AUTH_ENDPOINTS.auth.me),
  logout: () => apiAuth.post(AUTH_ENDPOINTS.auth.logout),

  // USUÁRIOS
  usuarios: {
    listar: (params) => apiAuth.get(AUTH_ENDPOINTS.usuarios.base, { params }),
    buscar: (id) => apiAuth.get(AUTH_ENDPOINTS.usuarios.byId(id)),
    criar: (payload) => apiAuth.post(AUTH_ENDPOINTS.usuarios.base, payload),
    atualizar: (id, payload) => apiAuth.put(AUTH_ENDPOINTS.usuarios.byId(id), payload),
    remover: (id) => apiAuth.delete(AUTH_ENDPOINTS.usuarios.byId(id)),

    opcoes: {
      vendedores: (params) => apiAuth.get(AUTH_ENDPOINTS.usuarios.opcoes.vendedores, { params }),
    },

    perfis: {
      atribuir: (usuarioId, payload) => apiAuth.post(AUTH_ENDPOINTS.usuarios.perfis.base(usuarioId), payload),
      remover: (usuarioId, perfilId) => apiAuth.delete(AUTH_ENDPOINTS.usuarios.perfis.remover(usuarioId, perfilId)),
    },
  },

  // PERFIS
  perfis: {
    listar: (params) => apiAuth.get(AUTH_ENDPOINTS.perfis.base, { params }),
    buscar: (id) => apiAuth.get(AUTH_ENDPOINTS.perfis.byId(id)),
    criar: (payload) => apiAuth.post(AUTH_ENDPOINTS.perfis.base, payload),
    atualizar: (id, payload) => apiAuth.put(AUTH_ENDPOINTS.perfis.byId(id), payload),
    remover: (id) => apiAuth.delete(AUTH_ENDPOINTS.perfis.byId(id)),

    permissoes: {
      atribuir: (perfilId, payload) => apiAuth.post(AUTH_ENDPOINTS.perfis.permissoes.base(perfilId), payload),
      remover: (perfilId, permissaoId) => apiAuth.delete(AUTH_ENDPOINTS.perfis.permissoes.remover(perfilId, permissaoId)),
    },
  },

  // PERMISSÕES
  permissoes: {
    listar: (params) => apiAuth.get(AUTH_ENDPOINTS.permissoes.base, { params }),
    buscar: (id) => apiAuth.get(AUTH_ENDPOINTS.permissoes.byId(id)),
    criar: (payload) => apiAuth.post(AUTH_ENDPOINTS.permissoes.base, payload),
    atualizar: (id, payload) => apiAuth.put(AUTH_ENDPOINTS.permissoes.byId(id), payload),
    remover: (id) => apiAuth.delete(AUTH_ENDPOINTS.permissoes.byId(id)),
  },

  // MONITORAMENTO
  monitoramento: {
    cache: () => apiAuth.get(AUTH_ENDPOINTS.monitoramento.cache),
  },
};

export default AuthApi;
