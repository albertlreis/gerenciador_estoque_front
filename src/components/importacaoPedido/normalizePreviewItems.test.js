import { buildPreviewItemKey, normalizePreviewItems } from './normalizePreviewItems';

describe('normalizePreviewItems', () => {
  it('preserva linhas repetidas de codigo/referencia', () => {
    const entrada = [
      { codigo: 'E66007', descricao: 'MESA APOIO SIA', quantidade: '1', preco_unitario: '100.00' },
      { codigo: 'E66007', descricao: 'MESA APOIO SIA', quantidade: '2', preco_unitario: '100.00' },
      { codigo: 'E66007', descricao: 'MESA APOIO SIA', quantidade: '3', preco_unitario: '100.00' },
      { codigo: 'E66008', descricao: 'MESA APOIO NIX', quantidade: '1', preco_unitario: '200.00' },
    ];

    const saida = normalizePreviewItems(entrada);

    expect(saida).toHaveLength(4);
    expect(saida.map((item) => item.ref)).toEqual(['E66007', 'E66007', 'E66007', 'E66008']);
    expect(saida.map((item) => item.quantidade)).toEqual([1, 2, 3, 1]);
    expect(saida.map((item) => item.linha)).toEqual([1, 2, 3, 4]);
  });

  it('gera key unica por linha mesmo com referencia repetida', () => {
    const itens = normalizePreviewItems([
      { codigo: 'E66009', descricao: 'MESA APOIO YONE', quantidade: 1, preco_unitario: 10 },
      { codigo: 'E66009', descricao: 'MESA APOIO YONE', quantidade: 1, preco_unitario: 10 },
      { codigo: 'E66009', descricao: 'MESA APOIO YONE', quantidade: 1, preco_unitario: 10 },
    ]);

    const keys = itens.map((item, index) => buildPreviewItemKey(item, index));
    const keysUnicas = new Set(keys);

    expect(keysUnicas.size).toBe(3);
  });
});
