const menuItems = (navigate, hasPermission) => {
  return [
    hasPermission(['usuarios.visualizar', 'perfis.visualizar', 'permissoes.visualizar']) && {
      label: 'Acesso',
      key: 'acesso',
      icon: 'pi pi-fw pi-briefcase',
      items: [
        hasPermission('usuarios.visualizar') && {
          label: 'Usuários',
          key: 'acesso-usuarios',
          icon: 'pi pi-fw pi-users',
          command: () => navigate('/usuarios')
        },
        hasPermission('perfis.visualizar') && {
          label: 'Perfis',
          key: 'acesso-perfis',
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate('/perfis')
        },
        hasPermission('permissoes.visualizar') && {
          label: 'Permissões',
          key: 'acesso-permissoes',
          icon: 'pi pi-fw pi-lock',
          command: () => navigate('/permissoes')
        }
      ].filter(Boolean)
    },

    hasPermission('clientes.visualizar') && {
      label: 'Clientes',
      key: 'clientes',
      icon: 'pi pi-fw pi-user',
      command: () => navigate('/clientes')
    },

    hasPermission('categorias.visualizar') && {
      label: 'Categorias',
      key: 'categorias',
      icon: 'pi pi-fw pi-book',
      command: () => navigate('/categorias')
    },

    hasPermission([
      'produtos.visualizar',
      'produtos.outlet',
      'produtos.configurar_outlet',
      'produtos.catalogo'
    ]) && {
      label: 'Produtos',
      key: 'produtos',
      icon: 'pi pi-fw pi-tags',
      items: [
        hasPermission('produtos.visualizar') && {
          label: 'Gerenciar Produtos',
          key: 'produtos-gerenciar',
          icon: 'pi pi-fw pi-pencil',
          command: () => navigate('/produtos')
        },
        hasPermission('produtos.catalogo') && {
          label: 'Catálogo',
          key: 'produtos-catalogo',
          icon: 'pi pi-fw pi-list',
          command: () => navigate('/catalogo')
        },
        hasPermission('produtos.outlet') && {
          label: 'Produtos Outlet',
          key: 'produtos-outlet',
          icon: 'pi pi-fw pi-exclamation-circle',
          command: () => navigate('/produtos-outlet')
        },
        hasPermission('produtos.configurar_outlet') && {
          label: 'Configurar Outlet',
          key: 'configurar-outlet',
          icon: 'pi pi-fw pi-cog',
          command: () => navigate('/configuracao-outlet')
        },
        hasPermission('produtos.importar') && {
          label: 'Importar Produtos',
          key: 'produtos-importar',
          icon: 'pi pi-fw pi-pencil',
          command: () => navigate('/produtos/importar')
        }
      ].filter(Boolean)
    },

    hasPermission('pedidos.visualizar') && {
      label: 'Pedidos',
      key: 'pedidos',
      icon: 'pi pi-fw pi-shopping-cart',
      command: () => navigate('/pedidos')
    },

    {
      label: 'Consignações',
      icon: 'pi pi-undo',
      command: () => navigate('/consignacoes')
    },

    hasPermission('depositos.visualizar') && {
      label: 'Depósitos',
      key: 'depositos',
      icon: 'pi pi-fw pi-box',
      command: () => navigate('/depositos')
    },

    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      command: () => navigate('/configuracoes')
    }

  ].filter(Boolean);
};

export default menuItems;
