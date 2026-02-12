import { getQuantidadeDisponivelVariacao, isVariacaoDisponivel } from './estoqueVariacao';

describe('estoqueVariacao', () => {
  it('usa estoque_total quando presente', () => {
    expect(getQuantidadeDisponivelVariacao({ estoque_total: '7' })).toBe(7);
  });

  it('soma estoques por deposito quando necessario', () => {
    expect(
      getQuantidadeDisponivelVariacao({
        estoques: [{ quantidade: '2' }, { quantidade: 3 }, { quantidade: null }],
      })
    ).toBe(5);
  });

  it('retorna indisponivel quando quantidade for zero ou invalida', () => {
    expect(isVariacaoDisponivel({ estoque_total: 0 })).toBe(false);
    expect(isVariacaoDisponivel({ estoque: { quantidade: 'abc' } })).toBe(false);
  });
});
