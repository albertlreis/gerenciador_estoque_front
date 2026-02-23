import { getQuantidadeDisponivelVariacao } from './estoqueVariacao';

export const filtrarVariacoesPorEstoqueStatus = (variacoes, estoqueStatus) => {
  const lista = Array.isArray(variacoes) ? variacoes : [];

  if (estoqueStatus === 'com_estoque') {
    return lista.filter((variacao) => getQuantidadeDisponivelVariacao(variacao) > 0);
  }

  return lista;
};

