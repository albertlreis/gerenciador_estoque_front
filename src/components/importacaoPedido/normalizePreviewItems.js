const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundCurrency = (value) => Number(toNumber(value).toFixed(2));

const toLinha = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function normalizePreviewItems(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];

  return items.map((item, index) => ({
    linha: toLinha(item?.linha, index + 1),
    quantidade: toNumber(item?.quantidade ?? 0),
    custo_unitario: roundCurrency(
      item?.custo_unitario ??
        item?.preco_unitario ??
        item?.preco ??
        0,
    ),
    ref: item?.ref || item?.codigo || item?.referencia || '',
    nome: item?.nome || item?.descricao || '',
    descricao: item?.descricao || item?.nome || '',
    nome_completo: item?.nome_completo || '',
    valor: roundCurrency(
      item?.valor ??
        item?.preco_venda ??
        item?.preco_unitario ??
        item?.preco ??
        0,
    ),
    preco_unitario: roundCurrency(
      item?.valor ??
        item?.preco_venda ??
        item?.preco_unitario ??
        item?.preco ??
        0,
    ),
    preco: roundCurrency(item?.preco ?? item?.preco_unitario ?? 0),
    unidade: item?.unidade || 'PC',
    id_categoria: item?.id_categoria ?? null,
    categoria: item?.categoria ?? null,
    produto_id: item?.produto_id ?? null,
    id_variacao: item?.id_variacao ?? null,
    variacao_nome: item?.variacao_nome ?? null,
    tipo: 'PEDIDO',
    enviar_fabrica: false,
    atributos: item?.atributos || {},
    atributos_raw: item?.atributos_raw || [],
    fixos: item?.fixos || {},
    id_deposito: null,
  }));
}

export function buildPreviewItemKey(item, index) {
  const linha = toLinha(item?.linha, index + 1);
  const identificador = `${item?.codigo || item?.ref || item?.referencia || 'item'}`
    .trim() || 'item';
  return `${identificador}-${linha}-${index}`;
}
