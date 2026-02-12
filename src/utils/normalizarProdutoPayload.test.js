import { normalizarProdutoPayload } from './normalizarProdutoPayload';

describe('normalizarProdutoPayload', () => {
  it('normaliza numeros, ids e strings básicas', () => {
    const payload = normalizarProdutoPayload({
      nome: '  Mesa  ',
      id_categoria: '10',
      id_fornecedor: '5',
      altura: '1,5',
      largura: '2.75',
      profundidade: '',
      peso: null,
      estoque_minimo: '3',
      motivo_desativacao: undefined,
    });

    expect(payload.nome).toBe('Mesa');
    expect(payload.id_categoria).toBe(10);
    expect(payload.id_fornecedor).toBe(5);
    expect(payload.altura).toBe(1.5);
    expect(payload.largura).toBe(2.75);
    expect(payload.profundidade).toBeNull();
    expect(payload.peso).toBeNull();
    expect(payload.estoque_minimo).toBe(3);
    expect(payload.motivo_desativacao).toBe('');
  });

  it('aceita ids via idCategoria/idFornecedor e numero com milhar', () => {
    const payload = normalizarProdutoPayload({
      nome: 'Produto',
      idCategoria: 7,
      idFornecedor: 8,
      altura: '1.234,56',
    });

    expect(payload.id_categoria).toBe(7);
    expect(payload.id_fornecedor).toBe(8);
    expect(payload.altura).toBe(1234.56);
  });
});