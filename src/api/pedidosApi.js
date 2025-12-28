import apiEstoque from '../services/apiEstoque';
import { ENDPOINTS } from '../constants/endpoints';

export const PedidosApi = {
  // CRUD base
  listar: (params) => apiEstoque.get(ENDPOINTS.pedidos.base, { params }),
  buscar: (pedidoId) => apiEstoque.get(ENDPOINTS.pedidos.byId(pedidoId)),
  criar: (payload) => apiEstoque.post(ENDPOINTS.pedidos.base, payload),
  atualizar: (pedidoId, payload) => apiEstoque.put(ENDPOINTS.pedidos.byId(pedidoId), payload),
  remover: (pedidoId) => apiEstoque.delete(ENDPOINTS.pedidos.byId(pedidoId)),

  // Auxiliares
  exportar: (params) =>
    apiEstoque.get(ENDPOINTS.pedidos.export, {
      params,
      responseType: 'blob', // geralmente export é arquivo
    }),

  estatisticas: (params) => apiEstoque.get(ENDPOINTS.pedidos.stats, { params }),

  importar: (payload) => apiEstoque.post(ENDPOINTS.pedidos.import, payload),

  confirmarImportacaoPdf: (payload) => apiEstoque.post(ENDPOINTS.pedidos.importPdfConfirm, payload),

  detalhado: (pedidoId) => apiEstoque.get(ENDPOINTS.pedidos.detalhado(pedidoId)),

  // STATUS
  status: {
    atualizar: (pedidoId, payload) => apiEstoque.patch(ENDPOINTS.pedidos.status.patch(pedidoId), payload),
    historico: (pedidoId, params) => apiEstoque.get(ENDPOINTS.pedidos.status.historico(pedidoId), { params }),
    previsoes: (pedidoId, params) => apiEstoque.get(ENDPOINTS.pedidos.status.previsoes(pedidoId), { params }),
    fluxo: (pedidoId, params) => apiEstoque.get(ENDPOINTS.pedidos.status.fluxo(pedidoId), { params }),

    removerHistorico: (pedidoId, statusHistoricoId) =>
      apiEstoque.delete(ENDPOINTS.pedidos.status.removerHistorico(pedidoId, statusHistoricoId)),
  },

  // ESTOQUE DO PEDIDO (ações)
  estoque: {
    reservar: (pedidoId, payload) => apiEstoque.post(ENDPOINTS.pedidos.estoque.reservar(pedidoId), payload),
    expedir: (pedidoId, payload) => apiEstoque.post(ENDPOINTS.pedidos.estoque.expedir(pedidoId), payload),
    cancelarReservas: (pedidoId, payload) =>
      apiEstoque.post(ENDPOINTS.pedidos.estoque.cancelarReservas(pedidoId), payload),
  },

  // ITENS
  itens: {
    // nested CRUD
    listar: (pedidoId, params) => apiEstoque.get(ENDPOINTS.pedidos.itens.nested(pedidoId), { params }),
    buscar: (pedidoId, itemId) => apiEstoque.get(ENDPOINTS.pedidos.itens.nestedById(pedidoId, itemId)),
    criar: (pedidoId, payload) => apiEstoque.post(ENDPOINTS.pedidos.itens.nested(pedidoId), payload),
    atualizar: (pedidoId, itemId, payload) =>
      apiEstoque.put(ENDPOINTS.pedidos.itens.nestedById(pedidoId, itemId), payload),
    remover: (pedidoId, itemId) => apiEstoque.delete(ENDPOINTS.pedidos.itens.nestedById(pedidoId, itemId)),

    // global
    listarGlobal: (params) => apiEstoque.get(ENDPOINTS.pedidos.itens.global, { params }),

    liberarEntrega: (itemId, payload) =>
      apiEstoque.patch(ENDPOINTS.pedidos.itens.liberarEntrega(itemId), payload),
  },
};

export default PedidosApi;
