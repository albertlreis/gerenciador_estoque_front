import { findMenuPathByRoute, isRouteMatch, mergeExpandedKeys } from './menuState';

describe('menuState utils', () => {
  const items = [
    { key: 'dashboard', to: '/' },
    {
      key: 'produtos',
      items: [
        { key: 'catalogo', to: '/catalogo' },
        { key: 'gerenciar', to: '/produtos' },
      ],
    },
    {
      key: 'estoque',
      items: [
        { key: 'transferir', to: '/estoque/leitura?mode=transfer' },
      ],
    },
  ];

  it('reconhece rota exata e subrota', () => {
    expect(isRouteMatch('/produtos', '/produtos')).toBe(true);
    expect(isRouteMatch('/produtos', '/produtos/123')).toBe(true);
    expect(isRouteMatch('/produtos', '/pedidos')).toBe(false);
  });

  it('encontra a cadeia de chaves para deep link', () => {
    expect(findMenuPathByRoute(items, '/catalogo')).toEqual(['produtos', 'catalogo']);
    expect(findMenuPathByRoute(items, '/estoque/leitura')).toEqual(['estoque', 'transferir']);
  });

  it('mergeia expandedKeys sem limpar secoes ja abertas', () => {
    const merged = mergeExpandedKeys({ pedidos: true }, ['produtos']);
    expect(merged).toEqual({ pedidos: true, produtos: true });
  });
});
