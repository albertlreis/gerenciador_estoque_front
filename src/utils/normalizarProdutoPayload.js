const normalizeNumberString = (value) => {
  const raw = String(value).trim();
  if (raw.includes(',') && raw.includes('.')) {
    return raw.replace(/\./g, '').replace(/,/g, '.');
  }
  if (raw.includes(',')) return raw.replace(/,/g, '.');
  return raw;
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const raw = normalizeNumberString(value);
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
};

const toIntegerOrNull = (value) => {
  const num = toNumberOrNull(value);
  if (num === null) return null;
  return Number.isNaN(num) ? null : num;
};

export const normalizarProdutoPayload = (data = {}) => {
  return {
    nome: (data.nome ?? '').trim(),
    descricao: data.descricao ?? '',
    id_categoria: toIntegerOrNull(data.id_categoria ?? data.idCategoria),
    id_fornecedor: toIntegerOrNull(data.id_fornecedor ?? data.idFornecedor),
    altura: toNumberOrNull(data.altura),
    largura: toNumberOrNull(data.largura),
    profundidade: toNumberOrNull(data.profundidade),
    peso: toNumberOrNull(data.peso),
    ativo: data.ativo ?? 1,
    motivo_desativacao: data.motivo_desativacao ?? '',
    estoque_minimo: toIntegerOrNull(data.estoque_minimo ?? data.estoqueMinimo),
    manualArquivo: data.manualArquivo,
  };
};
