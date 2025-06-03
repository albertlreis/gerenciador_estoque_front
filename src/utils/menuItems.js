/**
 * Gera os itens de menu com base nas permissões do usuário.
 * @param {Function} navigate - Função do React Router.
 * @param {Function} has - Função has(permission) para validação.
 * @returns {Array} Itens de menu para o PanelMenu.
 */
const menuItems = (navigate, has) => {
  return [
    {
      label: 'Dashboard',
      key: 'dashboard',
      icon: 'pi pi-fw pi-home',
      command: () => navigate('/dashboard')
    },

    has('pedidos.visualizar') && {
      label: 'Vendas',
      key: 'vendas',
      icon: 'pi pi-fw pi-shopping-cart',
      items: [
        {
          label: 'Pedidos',
          key: 'vendas-pedidos',
          icon: 'pi pi-fw pi-list',
          command: () => navigate('/pedidos')
        },
        {
          label: 'Consignações',
          key: 'vendas-consignacoes',
          icon: 'pi pi-undo',
          command: () => navigate('/consignacoes')
        }
      ]
    },

    has('clientes.visualizar') && {
      label: 'Relacionamentos',
      key: 'relacionamentos',
      icon: 'pi pi-fw pi-users',
      items: [
        {
          label: 'Clientes',
          key: 'relacionamentos-clientes',
          icon: 'pi pi-fw pi-user',
          command: () => navigate('/clientes')
        }
      ]
    },

    has([
      'produtos.visualizar',
      'produtos.catalogo',
      'produtos.outlet',
      'produtos.configurar_outlet',
      'produtos.importar'
    ]) && {
      label: 'Produtos',
      key: 'produtos',
      icon: 'pi pi-fw pi-tags',
      items: [
        has('produtos.visualizar') && {
          label: 'Gerenciar Produtos',
          key: 'produtos-gerenciar',
          icon: 'pi pi-fw pi-pencil',
          command: () => navigate('/produtos')
        },
        has('produtos.catalogo') && {
          label: 'Catálogo',
          key: 'produtos-catalogo',
          icon: 'pi pi-fw pi-list',
          command: () => navigate('/catalogo')
        },
        has('produtos.outlet') && {
          label: 'Outlet',
          key: 'produtos-outlet',
          icon: 'pi pi-fw pi-star',
          command: () => navigate('/produtos-outlet')
        },
        has('produtos.configurar_outlet') && {
          label: 'Configurar Outlet',
          key: 'produtos-configurar-outlet',
          icon: 'pi pi-fw pi-cog',
          command: () => navigate('/configuracao-outlet')
        },
        has('produtos.importar') && {
          label: 'Importar Produtos',
          key: 'produtos-importar',
          icon: 'pi pi-fw pi-upload',
          command: () => navigate('/produtos/importar')
        }
      ].filter(Boolean)
    },

    has('depositos.visualizar') && {
      label: 'Estoque',
      key: 'estoque',
      icon: 'pi pi-fw pi-box',
      items: [
        {
          label: 'Depósitos',
          key: 'estoque-depositos',
          icon: 'pi pi-fw pi-sitemap',
          command: () => navigate('/depositos')
        }
      ]
    },

    has(['usuarios.visualizar', 'perfis.visualizar', 'permissoes.visualizar']) && {
      label: 'Administração',
      key: 'administracao',
      icon: 'pi pi-fw pi-briefcase',
      items: [
        has('usuarios.visualizar') && {
          label: 'Usuários',
          key: 'admin-usuarios',
          icon: 'pi pi-fw pi-users',
          command: () => navigate('/usuarios')
        },
        has('perfis.visualizar') && {
          label: 'Perfis',
          key: 'admin-perfis',
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate('/perfis')
        },
        has('permissoes.visualizar') && {
          label: 'Permissões',
          key: 'admin-permissoes',
          icon: 'pi pi-fw pi-lock',
          command: () => navigate('/permissoes')
        }
      ].filter(Boolean)
    },

    {
      label: 'Configurações',
      key: 'configuracoes',
      icon: 'pi pi-fw pi-cog',
      command: () => navigate('/configuracoes')
    }

  ].filter(Boolean);
};

export default menuItems;
