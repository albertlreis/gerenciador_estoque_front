export const FINANCEIRO_ENDPOINTS = Object.freeze({
  dashboard: '/financeiro/dashboard',

  catalogos: Object.freeze({
    categoriasFinanceiras: '/financeiro/categorias-financeiras',
    contasFinanceiras: '/financeiro/contas-financeiras',
  }),

  centrosCusto: '/financeiro/centros-custo',

  lancamentos: Object.freeze({
    base: '/financeiro/lancamentos',
    totais: '/financeiro/lancamentos/totais',
    byId: (id) => `/financeiro/lancamentos/${id}`,
  }),

  contasPagar: Object.freeze({
    base: '/financeiro/contas-pagar',
    byId: (id) => `/financeiro/contas-pagar/${id}`,
    kpis: '/financeiro/contas-pagar/kpis',
    exportExcel: '/financeiro/contas-pagar/export/excel',
    exportPdf: '/financeiro/contas-pagar/export/pdf',
    pagar: (id) => `/financeiro/contas-pagar/${id}/pagar`,
    estornar: (contaId, pagamentoId) => `/financeiro/contas-pagar/${contaId}/pagamentos/${pagamentoId}`,
  }),

  contasReceber: Object.freeze({
    base: '/financeiro/contas-receber',
    byId: (id) => `/financeiro/contas-receber/${id}`,
    kpis: '/financeiro/contas-receber/kpis',
    exportExcel: '/financeiro/contas-receber/export/excel',
    exportPdf: '/financeiro/contas-receber/export/pdf',
    pagar: (id) => `/financeiro/contas-receber/${id}/pagar`,
    estornar: (contaId, pagamentoId) => `/financeiro/contas-receber/${contaId}/pagamentos/${pagamentoId}`,
  }),

  despesasRecorrentes: Object.freeze({
    base: '/financeiro/despesas-recorrentes',
    byId: (id) => `/financeiro/despesas-recorrentes/${id}`,
    pausar: (id) => `/financeiro/despesas-recorrentes/${id}/pausar`,
    ativar: (id) => `/financeiro/despesas-recorrentes/${id}/ativar`,
    cancelar: (id) => `/financeiro/despesas-recorrentes/${id}/cancelar`,
    executar: (id) => `/financeiro/despesas-recorrentes/${id}/executar`,
  }),
});

export default FINANCEIRO_ENDPOINTS;
