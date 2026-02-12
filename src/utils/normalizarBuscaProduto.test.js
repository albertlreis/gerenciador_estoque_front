import { aplicarNormalizacaoBuscaProduto, normalizarBuscaProduto } from './normalizarBuscaProduto';

describe('normalizarBuscaProduto', () => {
  it('preserva barra e caracteres especiais no termo', () => {
    expect(normalizarBuscaProduto(' ABC/123_%#?&= ')).toBe('ABC/123_%#?&=');
  });

  it('retorna undefined para valor vazio', () => {
    expect(normalizarBuscaProduto('   ')).toBeUndefined();
    expect(normalizarBuscaProduto(null)).toBeUndefined();
    expect(normalizarBuscaProduto(undefined)).toBeUndefined();
  });
});

describe('aplicarNormalizacaoBuscaProduto', () => {
  it('normaliza apenas campos de busca sem remover caracteres especiais', () => {
    const params = aplicarNormalizacaoBuscaProduto({
      q: ' REF/01 ',
      nome: ' Mesa/Verde ',
      referencia: ' ABC_% ',
      page: 2,
    });

    expect(params).toEqual({
      q: 'REF/01',
      nome: 'Mesa/Verde',
      referencia: 'ABC_%',
      page: 2,
    });
  });
});
