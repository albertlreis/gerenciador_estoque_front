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

    // Agrupa tudo de pedidos (cliente, consignação, importação e fábrica)
    (has(PERMISSOES.PEDIDOS?.VISUALIZAR) ||
      has(PERMISSOES.CONSIGNACOES?.VISUALIZAR) ||
      has(PERMISSOES.PEDIDOS?.IMPORTAR) ||
      has(PERMISSOES.PEDIDOS_FABRICA?.VISUALIZAR)
    ) && {
      label: 'Pedidos',
      key: 'pedidos',
      icon: 'pi pi-fw pi-shopping-cart',
      items: [
        has(PERMISSOES.PEDIDOS?.VISUALIZAR) && {
          label: 'Pedidos',
          key: 'pedidos-lista',
          icon: 'pi pi-fw pi-list',
          command: () => navigate('/pedidos')
        },
        has(PERMISSOES.CONSIGNACOES?.VISUALIZAR) && {
          label: 'Consignações',
          key: 'pedidos-consignacoes',
          icon: 'pi pi-undo',
          command: () => navigate('/consignacoes')
        },
        has(PERMISSOES.PEDIDOS?.IMPORTAR) && {
          label: 'Importar Pedido',
          key: 'pedidos-importar',
          icon: 'pi pi-fw pi-upload',
          command: () => navigate('/pedidos/importar')
        },
        has(PERMISSOES.PEDIDOS_FABRICA?.VISUALIZAR) && {
          label: 'Pedidos Fábrica',
          key: 'pedidos-fabrica',
          icon: 'pi pi-fw pi-send',
          command: () => navigate('/pedidos-fabrica')
        }
      ].filter(Boolean)
    },

    has(PERMISSOES.CLIENTES?.VISUALIZAR) && {
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
      PERMISSOES.PRODUTOS?.VISUALIZAR,
      PERMISSOES.PRODUTOS?.GERENCIAR,
      PERMISSOES.PRODUTOS?.IMPORTAR,
      PERMISSOES.PRODUTOS?.CATALOGO
    ]) && {
      label: 'Produtos',
      key: 'produtos',
      icon: 'pi pi-fw pi-tags',
      items: [
        has(PERMISSOES.PRODUTOS?.CATALOGO) && {
          label: 'Catálogo',
          key: 'catalogo',
          icon: 'pi pi-undo',
          command: () => navigate('/catalogo')
        },
        has(PERMISSOES.PRODUTOS?.GERENCIAR) && {
          label: 'Gerenciar Produtos',
          key: 'produtos-gerenciar',
          icon: 'pi pi-fw pi-pencil',
          command: () => navigate('/produtos')
        }
      ].filter(Boolean)
    },

    (has([
      PERMISSOES.FINANCEIRO?.CONTAS_PAGAR?.VISUALIZAR,
    ]) && {
      label: 'Financeiro',
      key: 'financeiro',
      icon: 'pi pi-fw pi-wallet',
      items: [
        has(PERMISSOES.FINANCEIRO?.CONTAS_PAGAR?.VISUALIZAR) && {
          label: 'Contas a Pagar',
          key: 'financeiro-contas-pagar',
          icon: 'pi pi-fw pi-arrow-down-left',
          command: () => navigate('/financeiro/contas-pagar')
        },
      ].filter(Boolean)
    }),

    has(PERMISSOES.DEPOSITOS?.VISUALIZAR) && {
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
          icon: 'pi pi-fw pi-sort-alt',
          command: () => navigate('/movimentacoes-estoque')
        },
        has(PERMISSOES.ESTOQUE?.CAIXA) && {
          label: 'Caixa (Leitor)',
          key: 'estoque-caixa',
          icon: 'pi pi-fw pi-barcode',
          command: () => navigate('/estoque/caixa')
        },
        has(PERMISSOES.ESTOQUE?.TRANSFERIR) && {
          label: 'Transferir entre Depósitos',
          key: 'estoque-transferir',
          icon: 'pi pi-fw pi-external-link',
          command: () => navigate('/estoque/caixa?mode=transfer')
        },
        {
          label: 'Reservas Pendentes',
          key: 'estoque-reservas',
          icon: 'pi pi-fw pi-clock',
          command: () => navigate('/reservas')
        },
        has(PERMISSOES.PRODUTOS?.IMPORTAR) && {
          label: 'Importar Nota Fiscal',
          key: 'produtos-importar',
          icon: 'pi pi-fw pi-upload',
          command: () => navigate('/produtos/importar')
        }
      ].filter(Boolean)
    },

    has([
      PERMISSOES.USUARIOS?.VISUALIZAR,
      PERMISSOES.PERFIS?.VISUALIZAR,
      PERMISSOES.PERMISSOES?.VISUALIZAR,
      PERMISSOES.CATEGORIAS?.VISUALIZAR,
      PERMISSOES.FORNECEDORES?.VISUALIZAR,
      PERMISSOES.PARCEIROS?.VISUALIZAR
    ]) && {
      label: 'Administração',
      key: 'administracao',
      icon: 'pi pi-fw pi-briefcase',
      items: [
        has(PERMISSOES.USUARIOS?.VISUALIZAR) && {
          label: 'Usuários',
          key: 'admin-usuarios',
          icon: 'pi pi-fw pi-users',
          command: () => navigate('/usuarios')
        },
        has(PERMISSOES.PERFIS?.VISUALIZAR) && {
          label: 'Perfis',
          key: 'admin-perfis',
          icon: 'pi pi-fw pi-id-card',
          command: () => navigate('/perfis')
        },
        has(PERMISSOES.PERMISSOES?.VISUALIZAR) && {
          label: 'Permissões',
          key: 'admin-permissoes',
          icon: 'pi pi-fw pi-lock',
          command: () => navigate('/permissoes')
        },
        has(PERMISSOES.CATEGORIAS?.VISUALIZAR) && {
          label: 'Categorias',
          key: 'admin-categorias',
          icon: 'pi pi-fw pi-sitemap',
          command: () => navigate('/categorias')
        },
        has(PERMISSOES.FORNECEDORES?.VISUALIZAR) && {
          label: 'Fornecedores',
          key: 'admin-fornecedores',
          icon: 'pi pi-fw pi-truck',
          command: () => navigate('/fornecedores')
        },
        has(PERMISSOES.PARCEIROS?.VISUALIZAR) && {
          label: 'Parceiros',
          key: 'admin-parceiros',
          icon: 'pi pi-fw pi-briefcase',
          command: () => navigate('/parceiros')
        }
      ].filter(Boolean)
    },

    has(PERMISSOES.RELATORIOS?.VISUALIZAR) && {
      label: 'Relatórios',
      key: 'relatorios',
      icon: 'pi pi-fw pi-file',
      command: () => navigate('/relatorios')
    },

    has(PERMISSOES.ASSISTENCIAS?.VISUALIZAR) && {
      label: 'Assistências',
      key: 'assistencias',
      icon: 'pi pi-fw pi-wrench',
      items: [
        {
          label: 'Chamados',
          key: 'assistencias-chamados',
          icon: 'pi pi-fw pi-list',
          command: () => navigate('/assistencias')
        },
        has(PERMISSOES.ASSISTENCIAS?.GERENCIAR) && {
          label: 'Autorizadas',
          key: 'assistencias-autorizadas',
          icon: 'pi pi-fw pi-verified',
          command: () => navigate('/assistencias/autorizadas')
        },
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
