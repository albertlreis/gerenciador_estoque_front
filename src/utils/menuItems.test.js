import menuItems from './menuItems';
import { PERMISSOES } from '../constants/permissoes';

const findByKey = (items, key) => {
  for (const item of items) {
    if (item?.key === key) return item;
    if (Array.isArray(item?.items)) {
      const found = findByKey(item.items, key);
      if (found) return found;
    }
  }

  return null;
};

describe('menuItems', () => {
  it('oculta "Importar Pedido" para perfil efetivo vendedor mesmo com permissão', () => {
    const permissions = new Set([
      PERMISSOES.PEDIDOS.VISUALIZAR,
      PERMISSOES.PEDIDOS.IMPORTAR,
    ]);
    const has = (perms) => {
      const list = Array.isArray(perms) ? perms : [perms];
      return list.some((perm) => permissions.has(perm));
    };

    const model = menuItems(has, {
      perfis: ['Vendedor'],
      permissoes: Array.from(permissions),
    });

    expect(findByKey(model, 'pedidos-importar')).toBeNull();
  });

  it('mantém "Importar Pedido" para perfil efetivo estoque com permissão', () => {
    const permissions = new Set([
      PERMISSOES.PEDIDOS.VISUALIZAR,
      PERMISSOES.PEDIDOS.IMPORTAR,
      PERMISSOES.ESTOQUE.MOVIMENTACAO,
    ]);
    const has = (perms) => {
      const list = Array.isArray(perms) ? perms : [perms];
      return list.some((perm) => permissions.has(perm));
    };

    const model = menuItems(has, {
      perfis: ['Estoque'],
      permissoes: Array.from(permissions),
    });

    expect(findByKey(model, 'pedidos-importar')).not.toBeNull();
  });

  it('mantém "Importar Pedido" para administrador', () => {
    const permissions = new Set([
      PERMISSOES.PEDIDOS.VISUALIZAR,
      PERMISSOES.PEDIDOS.IMPORTAR,
      PERMISSOES.DASHBOARD_ADMIN,
    ]);
    const has = (perms) => {
      const list = Array.isArray(perms) ? perms : [perms];
      return list.some((perm) => permissions.has(perm));
    };

    const model = menuItems(has, {
      perfis: ['Administrador'],
      permissoes: Array.from(permissions),
    });

    expect(findByKey(model, 'pedidos-importar')).not.toBeNull();
  });
});
