import { PERMISSOES } from '../constants/permissoes';

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
      command: () => navigate('/')
    },

    has(PERMISSOES.PEDIDOS.VISUALIZAR) && {
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
        has(PERMISSOES.CONSIGNACOES.VISUALIZAR) && {
          label: 'Consignações',
          key: 'vendas-consignacoes',
          icon: 'pi pi-undo',
          command: () => navigate('/consignacoes')
        },
        has(PERMISSOES.PEDIDOS.IMPORTAR) && {
          label: 'Importar Pedido',
          key: 'vendas-importar-pedido',
          icon: 'pi pi-fw pi-upload',
          command: () => navigate('/pedidos/importar')
        }
      ].filter(Boolean)
    },

    has(PERMISSOES.CLIENTES.VISUALIZAR) && {
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
      PERMISSOES.PRODUTOS.VISUALIZAR,
      PERMISSOES.PRODUTOS.IMPORTAR,
      PERMISSOES.PRODUTOS.CATALOGO
    ]) && {
      label: 'Produtos',
      key: 'produtos',
      icon: 'pi pi-fw pi-tags',
      items: [
        has(PERMISSOES.PRODUTOS.CATALOGO) && {
          label: 'Catálogo',
          key: 'catalogo',
          icon: 'pi pi-undo',
          command: () => navigate('/catalogo')
        },
        has(PERMISSOES.PRODUTOS.VISUALIZAR) && {
          label: 'Gerenciar Produtos',
          key: 'produtos-gerenciar',
          icon: 'pi pi-fw pi-pencil',
          command: () => navigate('/produtos')
        },
        has(PERMISSOES.PRODUTOS.IMPORTAR) && {
          label: 'Importar Produtos',
          key: 'produtos-importar',
          icon: 'pi pi-fw pi-upload',
          command: () => navigate('/produtos/importar')
        }
      ].filter(Boolean)
    },

    has(PERMISSOES.DEPOSITOS.VISUALIZAR) && {
      label: 'Estoque',
      key: 'estoque',
      icon: 'pi pi-fw pi-box',
      items: [
        {
          label: 'Depósitos',
          key: 'estoque-depositos',
          icon: 'pi pi-fw pi-sitemap',
          command: () => navigate('/depositos')
        },
        {
          label: 'Movimentações de Estoque',
          key: 'estoque-movimentacoes',
          icon: 'pi pi-fw pi-exchange',
          command: () => navigate('/movimentacoes-estoque')
        }
      ]
    },

    has([
      PERMISSOES.USUARIOS.VISUALIZAR,
      PERMISSOES.PERFIS.VISUALIZAR,
      PERMISSOES.PERMISSOES.VISUALIZAR
    ]) && {
      label: 'Administração',
      key: 'administracao',
      icon: 'pi pi-fw pi-briefcase',
      items: [
        has(PERMISSOES.USUARIOS.VISUALIZAR) && {
          label: 'Usuários',
          key: 'admin-usuarios',
          icon: 'pi pi-fw pi-users',
          command: () => navigate('/usuarios')
        },
        has(PERMISSOES.PERFIS.VISUALIZAR) && {
          label: 'Perfis',
          key: 'admin-perfis',
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate('/perfis')
        },
        has(PERMISSOES.PERMISSOES.VISUALIZAR) && {
          label: 'Permissões',
          key: 'admin-permissoes',
          icon: 'pi pi-fw pi-lock',
          command: () => navigate('/permissoes')
        }
      ].filter(Boolean)
    },

    {
      label: 'Monitoramento',
      key: 'monitoramento',
      icon: 'pi pi-fw pi-chart-bar',
      command: () => navigate('/monitoramento/cache'),
      visible: has(PERMISSOES.MONITORAMENTO?.VISUALIZAR)
    },

    has(PERMISSOES.CONFIGURACOES?.VISUALIZAR) && {
      label: 'Configurações',
      key: 'configuracoes',
      icon: 'pi pi-fw pi-cog',
      command: () => navigate('/configuracoes')
    }

  ].filter(Boolean);
};

export default menuItems;
