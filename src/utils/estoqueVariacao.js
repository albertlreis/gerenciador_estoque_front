const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getQuantidadeDisponivelVariacao = (variacao) => {
  if (!variacao || typeof variacao !== 'object') return 0;

  const quantidadeDireta = toNumber(
    variacao.quantidade_disponivel ??
      variacao.estoque_total ??
      variacao.estoque?.quantidade
  );
  if (quantidadeDireta !== null) return quantidadeDireta;

  if (Array.isArray(variacao.estoques)) {
    return variacao.estoques.reduce((acc, estoque) => {
      const quantidade = toNumber(estoque?.quantidade);
      return acc + (quantidade ?? 0);
    }, 0);
  }

  return 0;
};

export const isVariacaoDisponivel = (variacao) =>
  getQuantidadeDisponivelVariacao(variacao) > 0;
