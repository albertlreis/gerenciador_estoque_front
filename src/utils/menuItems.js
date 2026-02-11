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
      PERMISSOES.PRODUTOS?.CATALOGO,
      PERMISSOES.PRODUTOS?.OUTLET
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
        },
        has(PERMISSOES.PRODUTOS?.OUTLET) && {
          label: 'Catalogo Outlet',
          key: 'produtos-outlet',
          icon: 'pi pi-fw pi-tag',
          command: () => navigate('/produtos-outlet')
        }
      ].filter(Boolean)
    },

    (
      has([
        PERMISSOES.FINANCEIRO?.DASHBOARD?.VISUALIZAR,
        PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR,
        PERMISSOES.FINANCEIRO?.CONTAS_PAGAR?.VISUALIZAR,
        PERMISSOES.FINANCEIRO?.CONTAS_RECEBER?.VISUALIZAR,
        PERMISSOES.FINANCEIRO?.DESPESAS_RECORRENTES?.VISUALIZAR,
      ])
    ) && {
      label: 'Financeiro',
      key: 'financeiro',
      icon: 'pi pi-fw pi-wallet',
      items: [
        has(PERMISSOES.FINANCEIRO?.DASHBOARD?.VISUALIZAR) && {
          label: 'Dashboard Financeiro',
          key: 'financeiro-dashboard',
          icon: 'pi pi-fw pi-chart-line',
          command: () => navigate('/financeiro/dashboard')
        },
        has(PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR) && {
          label: 'Lançamentos',
          key: 'financeiro-lancamentos',
          icon: 'pi pi-fw pi-list',
          command: () => navigate('/financeiro/lancamentos')
        },
        has(PERMISSOES.FINANCEIRO?.CONTAS_PAGAR?.VISUALIZAR) && {
          label: 'Contas a Pagar',
          key: 'financeiro-contas-pagar',
          icon: 'pi pi-fw pi-arrow-down-left',
          command: () => navigate('/financeiro/contas-pagar')
        },
        has(PERMISSOES.FINANCEIRO?.CONTAS_RECEBER?.VISUALIZAR) && {
          label: 'Contas a Receber',
          key: 'financeiro-contas-receber',
          icon: 'pi pi-fw pi-arrow-up-right',
          command: () => navigate('/financeiro/contas-receber')
        },
        has(PERMISSOES.FINANCEIRO?.DESPESAS_RECORRENTES?.VISUALIZAR) && {
          label: 'Despesas Recorrentes',
          key: 'financeiro-despesas-recorrentes',
          icon: 'pi pi-fw pi-refresh',
          command: () => navigate('/financeiro/despesas-recorrentes')
        },
        has(PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR) && {
          label: 'Transferências entre Contas',
          key: 'financeiro-transferencias',
          icon: 'pi pi-fw pi-arrow-right-arrow-left',
          command: () => navigate('/financeiro/transferencias')
        },
        {
          label: 'Dados Básicos',
          key: 'financeiro-dados-basicos',
          icon: 'pi pi-fw pi-database',
          items: [
            {
              label: 'Centros de Custo',
              key: 'financeiro-centros-custo',
              icon: 'pi pi-fw pi-sitemap',
              command: () => navigate('/financeiro/centros-custo')
            },
            {
              label: 'Categorias Financeiras',
              key: 'financeiro-categorias-financeiras',
              icon: 'pi pi-fw pi-list',
              command: () => navigate('/financeiro/categorias-financeiras')
            },
            {
              label: 'Contas Financeiras',
              key: 'financeiro-contas-financeiras',
              icon: 'pi pi-fw pi-credit-card',
              command: () => navigate('/financeiro/contas-financeiras')
            },
          ]
        },
      ].filter(Boolean)
    },

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
        // has(PERMISSOES.ESTOQUE?.MOVIMENTAR) && {
        //   label: 'Leitura de Estoque',
        //   key: 'estoque-leitura',
        //   icon: 'pi pi-fw pi-barcode',
        //   command: () => navigate('/estoque/leitura')
        // },
        has(PERMISSOES.ESTOQUE?.MOVIMENTAR) && {
          label: 'Transferir entre Depósitos',
          key: 'estoque-transferir',
          icon: 'pi pi-fw pi-external-link',
          command: () => navigate('/estoque/leitura?mode=transfer')
        },
        // {
        //   label: 'Reservas Pendentes',
        //   key: 'estoque-reservas',
        //   icon: 'pi pi-fw pi-clock',
        //   command: () => navigate('/reservas')
        // },
        // has(PERMISSOES.PRODUTOS?.IMPORTAR) && {
        //   label: 'Importar Nota Fiscal',
        //   key: 'produtos-importar',
        //   icon: 'pi pi-fw pi-upload',
        //   command: () => navigate('/produtos/importar')
        // }
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
        has([
          PERMISSOES.USUARIOS?.VISUALIZAR,
          PERMISSOES.PERFIS?.VISUALIZAR,
          PERMISSOES.PERMISSOES?.VISUALIZAR
        ]) && {
          label: 'Acessos',
          key: 'admin-acessos',
          icon: 'pi pi-fw pi-key',
          command: () => navigate('/acessos')
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

    has(PERMISSOES.COMUNICACAO?.VISUALIZAR) && {
      label: 'Comunicação',
      key: 'comunicacao',
      icon: 'pi pi-fw pi-megaphone',
      items: [
        {
          label: 'Dashboard',
          key: 'comunicacao-dashboard',
          icon: 'pi pi-fw pi-chart-line',
          command: () => navigate('/comunicacao')
        },
        has(PERMISSOES.COMUNICACAO?.TEMPLATES) && {
          label: 'Templates',
          key: 'comunicacao-templates',
          icon: 'pi pi-fw pi-file-edit',
          command: () => navigate('/comunicacao/templates')
        },
        {
          label: 'Requests',
          key: 'comunicacao-requests',
          icon: 'pi pi-fw pi-send',
          command: () => navigate('/comunicacao/requests')
        },
        {
          label: 'Mensagens',
          key: 'comunicacao-messages',
          icon: 'pi pi-fw pi-inbox',
          command: () => navigate('/comunicacao/messages')
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
