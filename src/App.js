import React from 'react';
import {Routes, Route} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import ImportacaoPedidos from './pages/ImportacaoPedidos';
import Consignacoes from './pages/Consignacoes';
import Configuracoes from './pages/Configuracoes';
import AccessDeniedPage from './pages/AccessDeniedPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import Categorias from './pages/Categorias';
import Clientes from './pages/Clientes';
import Depositos from './pages/Depositos';
import MovimentacoesEstoque from './pages/MovimentacoesEstoque';
import FinalizarPedido from './pages/FinalizarPedido';
import ImportacaoPage from './pages/ImportacaoProdutos';
import Pedidos from './pages/Pedidos';
import Produtos from './pages/Produtos';
import ProdutosOutlet from './pages/ProdutosOutlet';
import CatalogoProdutos from './pages/CatalogoProdutos';
import MonitoramentoCache from './pages/MonitoramentoCache';

import PrivateRoute from './routes/PrivateRoute';
import PermissaoRoute from './routes/PermissaoRoute';
import {PERMISSOES} from './constants/permissoes';
import ComCarrinho from "./routes/ComCarrinho";
import useCheckVersion from "./hooks/useCheckVersion";
import Reservas from "./pages/Reservas";
import PedidosFabrica from "./pages/PedidosFabrica";
import Relatorios from "./pages/Relatorios";
import Assistencias from "./pages/Assistencias";
import AssistenciasAutorizadas from "./pages/AssistenciasAutorizadas";
import LeituraEstoque from "./pages/LeituraEstoque";
import Fornecedores from "./pages/Fornecedores";
import Parceiros from "./pages/Parceiros";
import ContasPagar from './pages/ContasPagar';
import ComunicacaoDashboard from "./pages/ComunicacaoDashboard";
import ComunicacaoTemplates from "./pages/ComunicacaoTemplates";
import ComunicacaoTemplateForm from "./pages/ComunicacaoTemplateForm";
import ComunicacaoRequests from "./pages/ComunicacaoRequests";
import ComunicacaoRequestShow from "./pages/ComunicacaoRequestShow";
import ComunicacaoMessages from "./pages/ComunicacaoMessages";
import ComunicacaoMessageShow from "./pages/ComunicacaoMessageShow";
import ContasReceber from "./pages/ContasReceber";
import FinanceiroDashboard from "./pages/FinanceiroDashboard";
import FinanceiroLancamentos from "./pages/FinanceiroLancamentos";
import FinanceiroDespesasRecorrentes from "./pages/FinanceiroDespesasRecorrentes";
import Acessos from "./pages/Acessos";
import UsuariosTab from "./pages/acessos/UsuariosTab";
import PerfisTab from "./pages/acessos/PerfisTab";
import PermissoesTab from "./pages/acessos/PermissoesTab";
import AcessosIndex from "./pages/acessos/AcessosIndex";
import CentrosCusto from "./pages/financeiro/CentrosCusto";
import CategoriasFinanceiras from "./pages/financeiro/CategoriasFinanceiras";
import ContasFinanceiras from "./pages/financeiro/ContasFinanceiras";
import TransferenciasEntreContas from "./pages/financeiro/TransferenciasEntreContas";

const renderProtectedRoute = (element, permissoes) => (
  <PrivateRoute element={<PermissaoRoute element={element} permissoes={permissoes}/>}/>
);

const App = () => {
  useCheckVersion();

  const PERMISSOES_ACESSOS_ANY = [
    PERMISSOES.USUARIOS?.VISUALIZAR,
    PERMISSOES.PERFIS?.VISUALIZAR,
    PERMISSOES.PERMISSOES?.VISUALIZAR,
  ];

  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/acesso-negado" element={<AccessDeniedPage/>}/>
      <Route path="*" element={<NotFoundPage/>}/>

      <Route
        path="/"
        element={
          <PrivateRoute
            element={<PermissaoRoute element={<HomePage/>} permissoes={PERMISSOES.HOME_VISUALIZAR}/>}
          />
        }
      />

      <Route
        path="/acessos"
        element={
          <PrivateRoute
            element={<PermissaoRoute element={<Acessos />} permissoes={PERMISSOES_ACESSOS_ANY} />}
          />
        }
      >
        <Route index element={<AcessosIndex />} />

        <Route
          path="usuarios"
          element={<PermissaoRoute element={<UsuariosTab />} permissoes={PERMISSOES.USUARIOS?.VISUALIZAR} />}
        />
        <Route
          path="perfis"
          element={<PermissaoRoute element={<PerfisTab />} permissoes={PERMISSOES.PERFIS?.VISUALIZAR} />}
        />
        <Route
          path="permissoes"
          element={<PermissaoRoute element={<PermissoesTab />} permissoes={PERMISSOES.PERMISSOES?.VISUALIZAR} />}
        />
      </Route>

      <Route path="/categorias" element={renderProtectedRoute(<Categorias/>, PERMISSOES.CATEGORIAS.VISUALIZAR)}/>
      <Route path="/clientes" element={renderProtectedRoute(<Clientes/>, PERMISSOES.CLIENTES.VISUALIZAR)}/>
      <Route path="/depositos" element={renderProtectedRoute(<Depositos/>, PERMISSOES.DEPOSITOS.VISUALIZAR)}/>
      <Route path="/movimentacoes-estoque"
             element={renderProtectedRoute(<MovimentacoesEstoque/>, PERMISSOES.ESTOQUE.MOVIMENTACAO)}/>
      <Route
        path="/finalizar-pedido/:id"
        element={renderProtectedRoute(
          <ComCarrinho>
            <FinalizarPedido/>
          </ComCarrinho>,
          PERMISSOES.CARRINHOS.FINALIZAR
        )}
      />
      <Route path="/pedidos" element={renderProtectedRoute(<Pedidos/>, PERMISSOES.PEDIDOS.VISUALIZAR)}/>
      <Route path="/pedidos/importar"
             element={renderProtectedRoute(<ImportacaoPedidos/>, PERMISSOES.PEDIDOS.IMPORTAR)}/>
      <Route
        path="/reservas"
        element={renderProtectedRoute(<Reservas />, PERMISSOES.PEDIDOS.VISUALIZAR)}
      />
      <Route
        path="/pedidos-fabrica"
        element={renderProtectedRoute(<PedidosFabrica />, PERMISSOES.PEDIDOS.VISUALIZAR)}
      />
      <Route path="/produtos" element={renderProtectedRoute(<Produtos/>, PERMISSOES.PRODUTOS.VISUALIZAR)}/>
      <Route path="/produtos/importar" element={renderProtectedRoute(<ImportacaoPage/>, PERMISSOES.PRODUTOS.IMPORTAR)}/>
      <Route path="/produtos-outlet" element={renderProtectedRoute(<ProdutosOutlet/>, PERMISSOES.PRODUTOS.OUTLET)}/>
      <Route
        path="/catalogo"
        element={renderProtectedRoute(
          <ComCarrinho>
            <CatalogoProdutos/>
          </ComCarrinho>,
          PERMISSOES.PRODUTOS.CATALOGO
        )}
      />
      <Route path="/consignacoes" element={renderProtectedRoute(<Consignacoes/>, PERMISSOES.CONSIGNACOES.VISUALIZAR)}/>
      <Route path="/configuracoes"
             element={renderProtectedRoute(<Configuracoes/>, PERMISSOES.CONFIGURACOES.VISUALIZAR)}/>
      <Route path="/monitoramento/cache"
             element={renderProtectedRoute(<MonitoramentoCache/>, PERMISSOES.MONITORAMENTO.VISUALIZAR)}/>
      <Route
        path="/relatorios"
        element={renderProtectedRoute(<Relatorios />, PERMISSOES.RELATORIOS.VISUALIZAR)}
      />
      <Route path="/assistencias" element={renderProtectedRoute(<Assistencias/>, PERMISSOES.ASSISTENCIAS.VISUALIZAR)}/>
      <Route path="/assistencias/autorizadas" element={renderProtectedRoute(<AssistenciasAutorizadas/>, PERMISSOES.ASSISTENCIAS.GERENCIAR)}/>

      <Route
        path="/estoque/leitura"
        element={renderProtectedRoute(<LeituraEstoque/>, [PERMISSOES.ESTOQUE.MOVIMENTAR])}
      />

      <Route
        path="/fornecedores"
        element={renderProtectedRoute(<Fornecedores/>, PERMISSOES.FORNECEDORES.VISUALIZAR)}
      />

      <Route
        path="/parceiros"
        element={renderProtectedRoute(<Parceiros/>, PERMISSOES.PARCEIROS.VISUALIZAR)}
      />

      <Route
        path="/financeiro/contas-pagar"
        element={renderProtectedRoute(<ContasPagar/>, PERMISSOES.FINANCEIRO.CONTAS_PAGAR.VISUALIZAR)}
      />

      <Route
        path="/financeiro/contas-receber"
        element={renderProtectedRoute(<ContasReceber/>, PERMISSOES.FINANCEIRO.CONTAS_RECEBER.VISUALIZAR)}
      />

      <Route
        path="/financeiro/dashboard"
        element={renderProtectedRoute(<FinanceiroDashboard />, PERMISSOES.FINANCEIRO.DASHBOARD.VISUALIZAR)}
      />

      <Route
        path="/financeiro/lancamentos"
        element={renderProtectedRoute(<FinanceiroLancamentos />, PERMISSOES.FINANCEIRO.LANCAMENTOS.VISUALIZAR)}
      />

      <Route
        path="/financeiro/despesas-recorrentes"
        element={renderProtectedRoute(
          <FinanceiroDespesasRecorrentes />,
          PERMISSOES.FINANCEIRO.DESPESAS_RECORRENTES.VISUALIZAR
        )}
      />

      <Route
        path="/financeiro/centros-custo"
        element={renderProtectedRoute(
          <CentrosCusto />,
          PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR
        )}
      />

      <Route
        path="/financeiro/categorias-financeiras"
        element={renderProtectedRoute(
          <CategoriasFinanceiras />,
          PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR
        )}
      />

      <Route
        path="/financeiro/contas-financeiras"
        element={renderProtectedRoute(
          <ContasFinanceiras />,
          PERMISSOES.FINANCEIRO?.LANCAMENTOS?.VISUALIZAR
        )}
      />

      <Route
        path="/financeiro/transferencias"
        element={renderProtectedRoute(
          <TransferenciasEntreContas />,
          PERMISSOES.FINANCEIRO.LANCAMENTOS.VISUALIZAR
        )}
      />

      {/* Comunicação */}
      <Route
        path="/comunicacao"
        element={renderProtectedRoute(<ComunicacaoDashboard />, PERMISSOES.COMUNICACAO?.VISUALIZAR)}
      />
      <Route
        path="/comunicacao/templates"
        element={renderProtectedRoute(<ComunicacaoTemplates />, PERMISSOES.COMUNICACAO?.TEMPLATES)}
      />
      <Route
        path="/comunicacao/templates/novo"
        element={renderProtectedRoute(<ComunicacaoTemplateForm mode="create" />, PERMISSOES.COMUNICACAO?.TEMPLATES)}
      />
      <Route
        path="/comunicacao/templates/:id"
        element={renderProtectedRoute(<ComunicacaoTemplateForm mode="edit" />, PERMISSOES.COMUNICACAO?.TEMPLATES)}
      />

      <Route
        path="/comunicacao/requests"
        element={renderProtectedRoute(<ComunicacaoRequests />, PERMISSOES.COMUNICACAO?.VISUALIZAR)}
      />
      <Route
        path="/comunicacao/requests/:id"
        element={renderProtectedRoute(<ComunicacaoRequestShow />, PERMISSOES.COMUNICACAO?.VISUALIZAR)}
      />

      <Route
        path="/comunicacao/messages"
        element={renderProtectedRoute(<ComunicacaoMessages />, PERMISSOES.COMUNICACAO?.VISUALIZAR)}
      />
      <Route
        path="/comunicacao/messages/:id"
        element={renderProtectedRoute(<ComunicacaoMessageShow />, PERMISSOES.COMUNICACAO?.VISUALIZAR)}
      />

    </Routes>
  );
};

export default App;
