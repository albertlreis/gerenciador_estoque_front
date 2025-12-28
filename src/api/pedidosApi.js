import apiEstoque from '../services/apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

export const PedidosApi = {
  // CRUD base
  listar: (params) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.base, { params }),
  buscar: (pedidoId) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.byId(pedidoId)),
  criar: (payload) => apiEstoque.post(ESTOQUE_ENDPOINTS.pedidos.base, payload),
  atualizar: (pedidoId, payload) => apiEstoque.put(ESTOQUE_ENDPOINTS.pedidos.byId(pedidoId), payload),
  remover: (pedidoId) => apiEstoque.delete(ESTOQUE_ENDPOINTS.pedidos.byId(pedidoId)),

  // Auxiliares
  exportar: (params) =>
    apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.export, {
      params,
      responseType: 'blob', // geralmente export é arquivo
    }),

  estatisticas: (params) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.stats, { params }),

  importarArquivo: (formData, config = {}) =>
    apiEstoque.post(ESTOQUE_ENDPOINTS.pedidos.import, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    }),

  confirmarImportacaoPdf: (payload) => apiEstoque.post(ESTOQUE_ENDPOINTS.pedidos.importPdfConfirm, payload),

  detalhado: (pedidoId) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.detalhado(pedidoId)),

  // STATUS
  status: {
    atualizar: (pedidoId, payload) => apiEstoque.patch(ESTOQUE_ENDPOINTS.pedidos.status.patch(pedidoId), payload),
    historico: (pedidoId, params) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.status.historico(pedidoId), { params }),
    previsoes: (pedidoId, params) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.status.previsoes(pedidoId), { params }),
    fluxo: (pedidoId, params) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.status.fluxo(pedidoId), { params }),

    removerHistorico: (pedidoId, statusHistoricoId) =>
      apiEstoque.delete(ESTOQUE_ENDPOINTS.pedidos.status.removerHistorico(pedidoId, statusHistoricoId)),
  },

  // ESTOQUE DO PEDIDO (ações)
  estoque: {
    reservar: (pedidoId, payload) => apiEstoque.post(ESTOQUE_ENDPOINTS.pedidos.estoque.reservar(pedidoId), payload),
    expedir: (pedidoId, payload) => apiEstoque.post(ESTOQUE_ENDPOINTS.pedidos.estoque.expedir(pedidoId), payload),
    cancelarReservas: (pedidoId, payload) =>
      apiEstoque.post(ESTOQUE_ENDPOINTS.pedidos.estoque.cancelarReservas(pedidoId), payload),
  },

  // ITENS
  itens: {
    // nested CRUD
    listar: (pedidoId, params) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.itens.nested(pedidoId), { params }),
    buscar: (pedidoId, itemId) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.itens.nestedById(pedidoId, itemId)),
    criar: (pedidoId, payload) => apiEstoque.post(ESTOQUE_ENDPOINTS.pedidos.itens.nested(pedidoId), payload),
    atualizar: (pedidoId, itemId, payload) =>
      apiEstoque.put(ESTOQUE_ENDPOINTS.pedidos.itens.nestedById(pedidoId, itemId), payload),
    remover: (pedidoId, itemId) => apiEstoque.delete(ESTOQUE_ENDPOINTS.pedidos.itens.nestedById(pedidoId, itemId)),

    // global
    listarGlobal: (params) => apiEstoque.get(ESTOQUE_ENDPOINTS.pedidos.itens.global, { params }),

    liberarEntrega: (itemId, payload) =>
      apiEstoque.patch(ESTOQUE_ENDPOINTS.pedidos.itens.liberarEntrega(itemId), payload),
  },
};

export default PedidosApi;
