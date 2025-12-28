import apiFinanceiro from '../services/apiFinanceiro';
import { ENDPOINTS } from '../constants/endpoints';

export const FinanceiroApi = {
  // DASHBOARD
  dashboard: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.dashboard, { params }),

  // CATÁLOGOS
  catalogos: {
    categoriasFinanceiras: (params) =>
      apiFinanceiro.get(ENDPOINTS.financeiro.catalogos.categoriasFinanceiras, { params }),
    contasFinanceiras: (params) =>
      apiFinanceiro.get(ENDPOINTS.financeiro.catalogos.contasFinanceiras, { params }),
  },

  centrosCusto: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.centrosCusto, { params }),

  // LANÇAMENTOS
  lancamentos: {
    totais: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.lancamentos.totais, { params }),
    listar: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.lancamentos.base, { params }),
    buscar: (id) => apiFinanceiro.get(ENDPOINTS.financeiro.lancamentos.byId(id)),
    criar: (payload) => apiFinanceiro.post(ENDPOINTS.financeiro.lancamentos.base, payload),
    atualizar: (id, payload) => apiFinanceiro.put(ENDPOINTS.financeiro.lancamentos.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(ENDPOINTS.financeiro.lancamentos.byId(id)),
  },

  // CONTAS A PAGAR
  contasPagar: {
    kpis: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.contasPagar.kpis, { params }),

    exportarExcel: (params) =>
      apiFinanceiro.get(ENDPOINTS.financeiro.contasPagar.exportExcel, {
        params,
        responseType: 'blob',
      }),

    exportarPdf: (params) =>
      apiFinanceiro.get(ENDPOINTS.financeiro.contasPagar.exportPdf, {
        params,
        responseType: 'blob',
      }),

    listar: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.contasPagar.base, { params }),
    buscar: (id) => apiFinanceiro.get(ENDPOINTS.financeiro.contasPagar.byId(id)),
    criar: (payload) => apiFinanceiro.post(ENDPOINTS.financeiro.contasPagar.base, payload),
    atualizar: (id, payload) => apiFinanceiro.put(ENDPOINTS.financeiro.contasPagar.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(ENDPOINTS.financeiro.contasPagar.byId(id)),

    pagar: (id, payload) => apiFinanceiro.post(ENDPOINTS.financeiro.contasPagar.pagar(id), payload),

    estornarPagamento: (contaId, pagamentoId) =>
      apiFinanceiro.delete(ENDPOINTS.financeiro.contasPagar.estornar(contaId, pagamentoId)),
  },

  // CONTAS A RECEBER
  contasReceber: {
    kpis: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.contasReceber.kpis, { params }),

    exportarExcel: (params) =>
      apiFinanceiro.get(ENDPOINTS.financeiro.contasReceber.exportExcel, {
        params,
        responseType: 'blob',
      }),

    exportarPdf: (params) =>
      apiFinanceiro.get(ENDPOINTS.financeiro.contasReceber.exportPdf, {
        params,
        responseType: 'blob',
      }),

    listar: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.contasReceber.base, { params }),
    buscar: (id) => apiFinanceiro.get(ENDPOINTS.financeiro.contasReceber.byId(id)),
    criar: (payload) => apiFinanceiro.post(ENDPOINTS.financeiro.contasReceber.base, payload),
    atualizar: (id, payload) => apiFinanceiro.put(ENDPOINTS.financeiro.contasReceber.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(ENDPOINTS.financeiro.contasReceber.byId(id)),

    pagar: (id, payload) => apiFinanceiro.post(ENDPOINTS.financeiro.contasReceber.pagar(id), payload),

    estornarPagamento: (contaId, pagamentoId) =>
      apiFinanceiro.delete(ENDPOINTS.financeiro.contasReceber.estornar(contaId, pagamentoId)),
  },

  // DESPESAS RECORRENTES
  despesasRecorrentes: {
    listar: (params) => apiFinanceiro.get(ENDPOINTS.financeiro.despesasRecorrentes.base, { params }),
    buscar: (id) => apiFinanceiro.get(ENDPOINTS.financeiro.despesasRecorrentes.byId(id)),
    criar: (payload) => apiFinanceiro.post(ENDPOINTS.financeiro.despesasRecorrentes.base, payload),
    atualizar: (id, payload) =>
      apiFinanceiro.put(ENDPOINTS.financeiro.despesasRecorrentes.byId(id), payload),
    remover: (id) => apiFinanceiro.delete(ENDPOINTS.financeiro.despesasRecorrentes.byId(id)),

    pausar: (id) => apiFinanceiro.patch(ENDPOINTS.financeiro.despesasRecorrentes.pausar(id)),
    ativar: (id) => apiFinanceiro.patch(ENDPOINTS.financeiro.despesasRecorrentes.ativar(id)),
    cancelar: (id) => apiFinanceiro.patch(ENDPOINTS.financeiro.despesasRecorrentes.cancelar(id)),

    executar: (id, payload) => apiFinanceiro.post(ENDPOINTS.financeiro.despesasRecorrentes.executar(id), payload),
  },
};

export default FinanceiroApi;
