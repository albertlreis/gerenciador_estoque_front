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
import Perfis from './pages/Perfis';
import Permissoes from './pages/Permissoes';
import Pedidos from './pages/Pedidos';
import Produtos from './pages/Produtos';
import ProdutosOutlet from './pages/ProdutosOutlet';
import Usuarios from './pages/Usuarios';
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

const renderProtectedRoute = (element, permissoes) => (
  <PrivateRoute element={<PermissaoRoute element={element} permissoes={permissoes}/>}/>
);

const App = () => {
  useCheckVersion();

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
      <Route path="/perfis" element={renderProtectedRoute(<Perfis/>, PERMISSOES.PERFIS.VISUALIZAR)}/>
      <Route path="/permissoes" element={renderProtectedRoute(<Permissoes/>, PERMISSOES.PERMISSOES.VISUALIZAR)}/>
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
      <Route path="/usuarios" element={renderProtectedRoute(<Usuarios/>, PERMISSOES.USUARIOS.VISUALIZAR)}/>
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
    </Routes>
  );
};

export default App;
