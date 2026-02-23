import { PERMISSOES } from '../constants/permissoes';
import isDeveloperUser from './isDeveloperUser';

/**
 * Gera os itens de menu com base nas permissões do usuário.
 * @param {Function} has - Função has(permission) para validação.
 * @returns {Array} Itens de menu para o PanelMenu.
 */
const menuItems = (has, user = null) => {
  const canImportarEstoqueDev =
    has(PERMISSOES.ESTOQUE?.IMPORTAR_PLANILHA_DEV) || isDeveloperUser(user);
  return [
    {
      label: 'Dashboard',
      key: 'dashboard',
      icon: 'pi pi-fw pi-home',
      to: '/'
    },

    has([PERMISSOES.AVISOS?.VISUALIZAR, PERMISSOES.AVISOS?.GERENCIAR]) && {
      label: 'Mural',
      key: 'mural',
      icon: 'pi pi-fw pi-comments',
      to: '/mural'
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
          to: '/pedidos'
        },
        has(PERMISSOES.CONSIGNACOES?.VISUALIZAR) && {
          label: 'Consignações',
          key: 'pedidos-consignacoes',
          icon: 'pi pi-undo',
          to: '/consignacoes'
        },
        has(PERMISSOES.PEDIDOS?.IMPORTAR) && {
          label: 'Importar Pedido',
          key: 'pedidos-importar',
          icon: 'pi pi-fw pi-upload',
          to: '/pedidos/importar'
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
          to: '/clientes'
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
          to: '/catalogo'
        },
        has(PERMISSOES.PRODUTOS?.GERENCIAR) && {
          label: 'Gerenciar Produtos',
          key: 'produtos-gerenciar',
          icon: 'pi pi-fw pi-pencil',
          to: '/produtos'
        },
        has(PERMISSOES.PRODUTOS?.OUTLET) && {
          label: 'Catálogo Outlet',
          key: 'produtos-outlet',
          icon: 'pi pi-fw pi-tag',
          to: '/produtos-outlet'
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
          to: '/financeiro/dashboard'
        },
        has(PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR) && {
          label: 'Lançamentos',
          key: 'financeiro-lancamentos',
          icon: 'pi pi-fw pi-list',
          to: '/financeiro/lancamentos'
        },
        has(PERMISSOES.FINANCEIRO?.CONTAS_PAGAR?.VISUALIZAR) && {
          label: 'Contas a Pagar',
          key: 'financeiro-contas-pagar',
          icon: 'pi pi-fw pi-arrow-down-left',
          to: '/financeiro/contas-pagar'
        },
        has(PERMISSOES.FINANCEIRO?.CONTAS_RECEBER?.VISUALIZAR) && {
          label: 'Contas a Receber',
          key: 'financeiro-contas-receber',
          icon: 'pi pi-fw pi-arrow-up-right',
          to: '/financeiro/contas-receber'
        },
        has(PERMISSOES.FINANCEIRO?.DESPESAS_RECORRENTES?.VISUALIZAR) && {
          label: 'Despesas Recorrentes',
          key: 'financeiro-despesas-recorrentes',
          icon: 'pi pi-fw pi-refresh',
          to: '/financeiro/despesas-recorrentes'
        },
        has(PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR) && {
          label: 'Transferências entre Contas',
          key: 'financeiro-transferencias',
          icon: 'pi pi-fw pi-arrow-right-arrow-left',
          to: '/financeiro/transferencias'
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
              to: '/financeiro/centros-custo'
            },
            {
              label: 'Categorias Financeiras',
              key: 'financeiro-categorias-financeiras',
              icon: 'pi pi-fw pi-list',
              to: '/financeiro/categorias-financeiras'
            },
            {
              label: 'Contas Financeiras',
              key: 'financeiro-contas-financeiras',
              icon: 'pi pi-fw pi-credit-card',
              to: '/financeiro/contas-financeiras'
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
          to: '/depositos'
        },
        {
          label: 'Movimentações de Estoque',
          key: 'estoque-movimentacoes',
          icon: 'pi pi-fw pi-sort-alt',
          to: '/movimentacoes-estoque'
        },
        canImportarEstoqueDev && {
          label: 'Importar Estoque (Dev)',
          key: 'estoque-importar-planilha',
          icon: 'pi pi-fw pi-file-import',
          to: '/estoque/importar-planilha'
        },
        // has(PERMISSOES.ESTOQUE?.MOVIMENTAR) && {
        //   label: 'Leitura de Estoque',
        //   key: 'estoque-leitura',
        //   icon: 'pi pi-fw pi-barcode',
        //   to: '/estoque/leitura'
        // },
        has(PERMISSOES.ESTOQUE?.MOVIMENTAR) && {
          label: 'Transferir entre Depósitos',
          key: 'estoque-transferir',
          icon: 'pi pi-fw pi-external-link',
          to: '/estoque/leitura?mode=transfer'
        },
        // {
        //   label: 'Reservas Pendentes',
        //   key: 'estoque-reservas',
        //   icon: 'pi pi-fw pi-clock',
        //   to: '/reservas'
        // },
        // has(PERMISSOES.PRODUTOS?.IMPORTAR) && {
        //   label: 'Importar Nota Fiscal',
        //   key: 'produtos-importar',
        //   icon: 'pi pi-fw pi-upload',
        //   to: '/produtos/importar'
        // }
      ].filter(Boolean)
    },

    has([
      PERMISSOES.USUARIOS?.VISUALIZAR,
      PERMISSOES.PERFIS?.VISUALIZAR,
      PERMISSOES.PERMISSOES?.VISUALIZAR,
      PERMISSOES.CATEGORIAS?.VISUALIZAR,
      PERMISSOES.FORNECEDORES?.VISUALIZAR,
      PERMISSOES.PARCEIROS?.VISUALIZAR,
      PERMISSOES.AUDITORIA?.VISUALIZAR,
      PERMISSOES.PRODUTOS?.GERENCIAR,
      PERMISSOES.PEDIDOS?.EDITAR,
      PERMISSOES.ESTOQUE?.MOVIMENTACAO,
      PERMISSOES.FINANCEIRO?.CONTAS_PAGAR?.VISUALIZAR,
      PERMISSOES.FINANCEIRO?.CONTAS_RECEBER?.VISUALIZAR,
      PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR
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
          to: '/acessos'
        },
        has([
          PERMISSOES.AUDITORIA?.VISUALIZAR,
          PERMISSOES.PRODUTOS?.GERENCIAR,
          PERMISSOES.PEDIDOS?.EDITAR,
          PERMISSOES.ESTOQUE?.MOVIMENTACAO,
          PERMISSOES.FINANCEIRO?.CONTAS_PAGAR?.VISUALIZAR,
          PERMISSOES.FINANCEIRO?.CONTAS_RECEBER?.VISUALIZAR,
          PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR
        ]) && {
          label: 'Auditoria',
          key: 'admin-auditoria',
          icon: 'pi pi-fw pi-history',
          to: '/auditoria'
        },
        has(PERMISSOES.CATEGORIAS?.VISUALIZAR) && {
          label: 'Categorias',
          key: 'admin-categorias',
          icon: 'pi pi-fw pi-sitemap',
          to: '/categorias'
        },
        has(PERMISSOES.FORNECEDORES?.VISUALIZAR) && {
          label: 'Fornecedores',
          key: 'admin-fornecedores',
          icon: 'pi pi-fw pi-truck',
          to: '/fornecedores'
        },
        has(PERMISSOES.PARCEIROS?.VISUALIZAR) && {
          label: 'Parceiros',
          key: 'admin-parceiros',
          icon: 'pi pi-fw pi-briefcase',
          to: '/parceiros'
        }
      ].filter(Boolean)
    },

    has(PERMISSOES.RELATORIOS?.VISUALIZAR) && {
      label: 'Relatórios',
      key: 'relatorios',
      icon: 'pi pi-fw pi-file',
      to: '/relatorios'
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
          to: '/assistencias'
        },
        has(PERMISSOES.ASSISTENCIAS?.GERENCIAR) && {
          label: 'Autorizadas',
          key: 'assistencias-autorizadas',
          icon: 'pi pi-fw pi-verified',
          to: '/assistencias/autorizadas'
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
          to: '/comunicacao'
        },
        has(PERMISSOES.COMUNICACAO?.TEMPLATES) && {
          label: 'Templates',
          key: 'comunicacao-templates',
          icon: 'pi pi-fw pi-file-edit',
          to: '/comunicacao/templates'
        },
        {
          label: 'Requests',
          key: 'comunicacao-requests',
          icon: 'pi pi-fw pi-send',
          to: '/comunicacao/requests'
        },
        {
          label: 'Mensagens',
          key: 'comunicacao-messages',
          icon: 'pi pi-fw pi-inbox',
          to: '/comunicacao/messages'
        }
      ].filter(Boolean)
    },

    {
      label: 'Monitoramento',
      key: 'monitoramento',
      icon: 'pi pi-fw pi-chart-bar',
      to: '/monitoramento/cache',
      visible: has(PERMISSOES.MONITORAMENTO?.VISUALIZAR)
    },

    has(PERMISSOES.CONFIGURACOES?.VISUALIZAR) && {
      label: 'Configurações',
      key: 'configuracoes',
      icon: 'pi pi-fw pi-cog',
      to: '/configuracoes'
    }

  ].filter(Boolean);
};

export default menuItems;


