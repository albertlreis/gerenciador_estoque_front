import apiFinanceiro from '../services/apiFinanceiro';
import { FINANCEIRO_ENDPOINTS } from '../constants/endpointsFinanceiro';

export const FinanceiroApi = {
  // DASHBOARD
  dashboard: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.dashboard, { params }),

  // CATÁLOGOS
  catalogos: {
    categoriasFinanceiras: (params) =>
      apiFinanceiro.get(FINANCEIRO_ENDPOINTS.catalogos.categoriasFinanceiras, { params }),
    contasFinanceiras: (params) =>
      apiFinanceiro.get(FINANCEIRO_ENDPOINTS.catalogos.contasFinanceiras, { params }),
  },

  centrosCusto: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.centrosCusto, { params }),

  // LANÇAMENTOS
  lancamentos: {
    totais: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.lancamentos.totais, { params }),
    listar: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.lancamentos.base, { params }),
    buscar: (id) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.lancamentos.byId(id)),
    criar: (payload) => apiFinanceiro.post(FINANCEIRO_ENDPOINTS.lancamentos.base, payload),
    atualizar: (id, payload) => apiFinanceiro.put(FINANCEIRO_ENDPOINTS.lancamentos.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(FINANCEIRO_ENDPOINTS.lancamentos.byId(id)),
  },

  // CONTAS A PAGAR
  contasPagar: {
    kpis: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasPagar.kpis, { params }),

    exportarExcel: (params) =>
      apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasPagar.exportExcel, {
        params,
        responseType: 'blob',
      }),

    exportarPdf: (params) =>
      apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasPagar.exportPdf, {
        params,
        responseType: 'blob',
      }),

    listar: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasPagar.base, { params }),
    buscar: (id) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasPagar.byId(id)),
    criar: (payload) => apiFinanceiro.post(FINANCEIRO_ENDPOINTS.contasPagar.base, payload),
    atualizar: (id, payload) => apiFinanceiro.put(FINANCEIRO_ENDPOINTS.contasPagar.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(FINANCEIRO_ENDPOINTS.contasPagar.byId(id)),

    pagar: (id, payload) => apiFinanceiro.post(FINANCEIRO_ENDPOINTS.contasPagar.pagar(id), payload),

    estornarPagamento: (contaId, pagamentoId) =>
      apiFinanceiro.delete(FINANCEIRO_ENDPOINTS.contasPagar.estornar(contaId, pagamentoId)),
  },

  // CONTAS A RECEBER
  contasReceber: {
    kpis: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasReceber.kpis, { params }),

    exportarExcel: (params) =>
      apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasReceber.exportExcel, {
        params,
        responseType: 'blob',
      }),

    exportarPdf: (params) =>
      apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasReceber.exportPdf, {
        params,
        responseType: 'blob',
      }),

    listar: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasReceber.base, { params }),
    buscar: (id) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.contasReceber.byId(id)),
    criar: (payload) => apiFinanceiro.post(FINANCEIRO_ENDPOINTS.contasReceber.base, payload),
    atualizar: (id, payload) => apiFinanceiro.put(FINANCEIRO_ENDPOINTS.contasReceber.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(FINANCEIRO_ENDPOINTS.contasReceber.byId(id)),

    pagar: (id, payload) => apiFinanceiro.post(FINANCEIRO_ENDPOINTS.contasReceber.pagar(id), payload),

    estornarPagamento: (contaId, pagamentoId) =>
      apiFinanceiro.delete(FINANCEIRO_ENDPOINTS.contasReceber.estornar(contaId, pagamentoId)),
  },

  // DESPESAS RECORRENTES
  despesasRecorrentes: {
    listar: (params) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.despesasRecorrentes.base, { params }),
    buscar: (id) => apiFinanceiro.get(FINANCEIRO_ENDPOINTS.despesasRecorrentes.byId(id)),
    criar: (payload) => apiFinanceiro.post(FINANCEIRO_ENDPOINTS.despesasRecorrentes.base, payload),
    atualizar: (id, payload) =>
      apiFinanceiro.put(FINANCEIRO_ENDPOINTS.despesasRecorrentes.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(FINANCEIRO_ENDPOINTS.despesasRecorrentes.byId(id)),

    pausar: (id) => apiFinanceiro.patch(FINANCEIRO_ENDPOINTS.despesasRecorrentes.pausar(id)),
    ativar: (id) => apiFinanceiro.patch(FINANCEIRO_ENDPOINTS.despesasRecorrentes.ativar(id)),
    cancelar: (id) => apiFinanceiro.patch(FINANCEIRO_ENDPOINTS.despesasRecorrentes.cancelar(id)),

    executar: (id, payload) => apiFinanceiro.post(FINANCEIRO_ENDPOINTS.despesasRecorrentes.executar(id), payload),
  },
};

export default FinanceiroApi;
