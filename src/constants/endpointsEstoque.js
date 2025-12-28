export const ESTOQUE_ENDPOINTS = Object.freeze({
  // SISTEMA
  dashboard: Object.freeze({
    resumo: '/dashboard/resumo',
  }),

  configuracoes: Object.freeze({
    listar: '/configuracoes',
    atualizar: (chave) => `/configuracoes/${encodeURIComponent(chave)}`,
  }),

  // CATÁLOGO
  categorias: Object.freeze({
    base: '/categorias',
    byId: (id) => `/categorias/${id}`,
  }),

  atributos: Object.freeze({
    base: '/atributos',
    sugestoes: '/atributos/sugestoes',
    valores: (nome) => `/atributos/${encodeURIComponent(nome)}/valores`,
  }),

  variacoes: Object.freeze({
    buscar: '/variacoes',
    outlets: Object.freeze({
      base: (variacaoId) => `/variacoes/${variacaoId}/outlets`,
      byId: (variacaoId, outletId) => `/variacoes/${variacaoId}/outlets/${outletId}`,
    }),
  }),

  outletCatalogo: Object.freeze({
    motivos: '/outlet/motivos',
    formasPagamento: '/outlet/formas-pagamento',
  }),

  produtos: Object.freeze({
    base: '/produtos',
    byId: (id) => `/produtos/${id}`,

    estoqueBaixo: '/produtos/estoque-baixo',
    sugestoesOutlet: '/produtos/sugestoes-outlet',

    importacoes: Object.freeze({
      xml: '/produtos/importacoes/xml',
      xmlConfirmar: '/produtos/importacoes/xml/confirmar',
    }),

    imagens: Object.freeze({
      base: (produtoId) => `/produtos/${produtoId}/imagens`,
      byId: (produtoId, imagemId) => `/produtos/${produtoId}/imagens/${imagemId}`,
      definirPrincipal: (produtoId, imagemId) =>
        `/produtos/${produtoId}/imagens/${imagemId}/definir-principal`,
    }),

    variacoes: Object.freeze({
      base: (produtoId) => `/produtos/${produtoId}/variacoes`,
      byId: (produtoId, variacaoId) => `/produtos/${produtoId}/variacoes/${variacaoId}`,
      bulk: (produtoId) => `/produtos/${produtoId}/variacoes/bulk`,
    }),
  }),

  // ESTOQUE
  estoque: Object.freeze({
    atual: '/estoque/atual',
    resumo: '/estoque/resumo',
    porVariacao: (variacaoId) => `/estoque/variacoes/${variacaoId}`,

    movimentacoes: Object.freeze({
      base: '/estoque/movimentacoes',
      byId: (id) => `/estoque/movimentacoes/${id}`,
      lote: '/estoque/movimentacoes/lote',
    }),

    areas: Object.freeze({
      base: '/estoque/areas',
      byId: (id) => `/estoque/areas/${id}`,
    }),

    dimensoes: Object.freeze({
      base: '/estoque/dimensoes',
      byId: (id) => `/estoque/dimensoes/${id}`,
    }),
  }),

  depositos: Object.freeze({
    base: '/depositos',
    byId: (id) => `/depositos/${id}`,
    estoques: Object.freeze({
      base: (depositoId) => `/depositos/${depositoId}/estoques`,
      byId: (depositoId, estoqueId) => `/depositos/${depositoId}/estoques/${estoqueId}`,
    }),
  }),

  localizacoesEstoque: Object.freeze({
    base: '/localizacoes-estoque',
    byId: (id) => `/localizacoes-estoque/${id}`,
  }),

  importacoesEstoque: Object.freeze({
    base: '/importacoes/estoque',
    byId: (id) => `/importacoes/estoque/${id}`,
    processar: (id) => `/importacoes/estoque/${id}/processar`,
  }),

  // PESSOAS
  clientes: Object.freeze({
    base: '/clientes',
    byId: (id) => `/clientes/${id}`,
    verificarDocumento: '/clientes/verificar-documento', // query string
  }),

  fornecedores: Object.freeze({
    base: '/fornecedores',
    byId: (id) => `/fornecedores/${id}`,
    restaurar: (id) => `/fornecedores/${id}/restaurar`,
    produtos: (id) => `/fornecedores/${id}/produtos`,
  }),

  parceiros: Object.freeze({
    base: '/parceiros',
    byId: (id) => `/parceiros/${id}`,
    restaurar: (id) => `/parceiros/${id}/restaurar`,
  }),

  // PEDIDOS
  pedidos: Object.freeze({
    base: '/pedidos',
    byId: (id) => `/pedidos/${id}`,

    export: '/pedidos/export',
    stats: '/pedidos/stats',

    import: '/pedidos/import',
    importPdfConfirm: '/pedidos/import/pdf/confirm',

    detalhado: (pedidoId) => `/pedidos/${pedidoId}/detalhado`,

    status: Object.freeze({
      patch: (pedidoId) => `/pedidos/${pedidoId}/status`,
      historico: (pedidoId) => `/pedidos/${pedidoId}/status/historico`,
      previsoes: (pedidoId) => `/pedidos/${pedidoId}/status/previsoes`,
      fluxo: (pedidoId) => `/pedidos/${pedidoId}/status/fluxo`,
      removerHistorico: (pedidoId, statusHistoricoId) =>
        `/pedidos/${pedidoId}/status-historicos/${statusHistoricoId}`,
    }),

    estoque: Object.freeze({
      reservar: (pedidoId) => `/pedidos/${pedidoId}/estoque/reservar`,
      expedir: (pedidoId) => `/pedidos/${pedidoId}/estoque/expedir`,
      cancelarReservas: (pedidoId) => `/pedidos/${pedidoId}/estoque/cancelar-reservas`,
    }),

    itens: Object.freeze({
      nested: (pedidoId) => `/pedidos/${pedidoId}/itens`,
      nestedById: (pedidoId, itemId) => `/pedidos/${pedidoId}/itens/${itemId}`,
      global: '/pedidos/itens',
      liberarEntrega: (itemId) => `/pedidos/itens/${itemId}/liberar-entrega`,
    }),
  }),

  // CARRINHOS
  carrinhos: Object.freeze({
    base: '/carrinhos',
    byId: (id) => `/carrinhos/${id}`,
    cancelar: (id) => `/carrinhos/${id}/cancelar`,

    itens: Object.freeze({
      base: (carrinhoId) => `/carrinhos/${carrinhoId}/itens`,
      byId: (carrinhoId, itemId) => `/carrinhos/${carrinhoId}/itens/${itemId}`,
      atualizarDeposito: (carrinhoId) => `/carrinhos/${carrinhoId}/itens/atualizar-deposito`,
    }),
  }),

  // CONSIGNAÇÕES
  consignacoes: Object.freeze({
    base: '/consignacoes',
    byId: (id) => `/consignacoes/${id}`,
    porPedido: (pedidoId) => `/consignacoes/pedidos/${pedidoId}`,
    vencendo: '/consignacoes/vencendo',
    clientes: '/consignacoes/clientes',
    vendedores: '/consignacoes/vendedores',
    pdf: (id) => `/consignacoes/${id}/pdf`,
    status: (id) => `/consignacoes/${id}/status`,
    devolucoes: (id) => `/consignacoes/${id}/devolucoes`,
  }),

  // DEVOLUÇÕES
  devolucoes: Object.freeze({
    base: '/devolucoes',
    aprovar: (id) => `/devolucoes/${id}/aprovar`,
    reprovar: (id) => `/devolucoes/${id}/reprovar`,
  }),

  // RELATÓRIOS
  relatorios: Object.freeze({
    estoqueAtual: '/relatorios/estoque/atual',
    pedidos: '/relatorios/pedidos',
    consignacoesAtivas: '/relatorios/consignacoes/ativas',
    assistencias: '/relatorios/assistencias',

    devedores: '/relatorios/devedores',
    devedoresExcel: '/relatorios/devedores/export/excel',
    devedoresPdf: '/relatorios/devedores/export/pdf',
  }),

  // FERIADOS
  feriados: Object.freeze({
    base: '/feriados',
    sincronizar: '/feriados/sincronizar',
  }),

  // ASSISTÊNCIAS
  assistencias: Object.freeze({
    autorizadas: Object.freeze({
      base: '/assistencias/autorizadas',
      byId: (id) => `/assistencias/autorizadas/${id}`,
    }),

    defeitos: Object.freeze({
      base: '/assistencias/defeitos',
      byId: (id) => `/assistencias/defeitos/${id}`,
    }),

    chamados: Object.freeze({
      base: '/assistencias/chamados',
      byId: (id) => `/assistencias/chamados/${id}`,
      cancelar: (id) => `/assistencias/chamados/${id}/cancelar`,
      itens: (id) => `/assistencias/chamados/${id}/itens`,
      arquivos: (id) => `/assistencias/chamados/${id}/arquivos`,
    }),

    itens: Object.freeze({
      arquivos: (itemId) => `/assistencias/itens/${itemId}/arquivos`,
      iniciarReparo: (itemId) => `/assistencias/itens/${itemId}/iniciar-reparo`,
      enviar: (itemId) => `/assistencias/itens/${itemId}/enviar`,
      orcamento: (itemId) => `/assistencias/itens/${itemId}/orcamento`,
      aprovarOrcamento: (itemId) => `/assistencias/itens/${itemId}/aprovar-orcamento`,
      reprovarOrcamento: (itemId) => `/assistencias/itens/${itemId}/reprovar-orcamento`,
      retorno: (itemId) => `/assistencias/itens/${itemId}/retorno`,
      concluirReparo: (itemId) => `/assistencias/itens/${itemId}/concluir-reparo`,
      aguardarResposta: (itemId) => `/assistencias/itens/${itemId}/aguardar-resposta`,
      aguardarPeca: (itemId) => `/assistencias/itens/${itemId}/aguardar-peca`,
      saidaFabrica: (itemId) => `/assistencias/itens/${itemId}/saida-fabrica`,
      entregar: (itemId) => `/assistencias/itens/${itemId}/entregar`,
    }),

    lookupPedidos: Object.freeze({
      busca: '/assistencias/pedidos/busca',
      produtos: (pedidoId) => `/assistencias/pedidos/${pedidoId}/produtos`,
    }),

    arquivos: Object.freeze({
      show: (arquivoId) => `/assistencias/arquivos/${arquivoId}`,
      destroy: (arquivoId) => `/assistencias/arquivos/${arquivoId}`,
    }),
  }),

  // COMUNICAÇÃO
  comunicacao: Object.freeze({
    templates: Object.freeze({
      base: '/comunicacao/templates',
      byId: (id) => `/comunicacao/templates/${id}`,
      preview: (id) => `/comunicacao/templates/${id}/preview`,
    }),

    requests: Object.freeze({
      base: '/comunicacao/requests',
      byId: (id) => `/comunicacao/requests/${id}`,
      cancelar: (id) => `/comunicacao/requests/${id}/cancelar`,
    }),

    messages: Object.freeze({
      base: '/comunicacao/messages',
      byId: (id) => `/comunicacao/messages/${id}`,
      reprocessar: (id) => `/comunicacao/messages/${id}/reprocessar`,
    }),
  }),
});

export default ESTOQUE_ENDPOINTS;
