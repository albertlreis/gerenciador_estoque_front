import { filtrarVariacoesPorEstoqueStatus } from './catalogoEstoque';

describe('filtrarVariacoesPorEstoqueStatus', () => {
  const variacoes = [
    { id: 1, estoque_total: 0 },
    { id: 2, estoque_total: 3 },
    { id: 3, estoques: [{ quantidade: 0 }, { quantidade: 2 }] },
  ];

  it('filtra apenas variacoes com estoque quando status for com_estoque', () => {
    const resultado = filtrarVariacoesPorEstoqueStatus(variacoes, 'com_estoque');
    expect(resultado.map((v) => v.id)).toEqual([2, 3]);
  });

  it('retorna todas as variacoes quando status nao for com_estoque', () => {
    const resultado = filtrarVariacoesPorEstoqueStatus(variacoes, null);
    expect(resultado.map((v) => v.id)).toEqual([1, 2, 3]);
  });
});

