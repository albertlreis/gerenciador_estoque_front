import React from 'react';
import {Routes, Route} from 'react-router-dom';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';
import ImportacaoPedidos from './pages/ImportacaoPedidos';
import Consignacoes from './pages/Consignacoes';
import Configuracoes from './pages/Configuracoes';
import AccessDeniedPage from './pages/AccessDeniedPage';
import NotFoundPage from './pages/NotFoundPage';

// Páginas privadas
import HomePage from './pages/HomePage';
import Categorias from './pages/Categorias';
import Clientes from './pages/Clientes';
import ConfiguracaoOutlet from './pages/ConfiguracaoOutlet';
import Depositos from './pages/Depositos';
import EstoqueMovimentacoes from './pages/EstoqueMovimentacoes';
import FinalizarPedido from './pages/FinalizarPedido';
import ImportacaoPage from './pages/ImportacaoProdutos';
import Perfis from './pages/Perfis';
import Permissoes from './pages/Permissoes';
import Pedidos from './pages/Pedidos';
import ProdutoVariacoes from './pages/ProdutoVariacoes';
import Produtos from './pages/Produtos';
import ProdutosOutlet from './pages/ProdutosOutlet';
import Usuarios from './pages/Usuarios';
import CatalogoProdutos from './pages/CatalogoProdutos';

// Rotas protegidas
import PrivateRoute from './routes/PrivateRoute';
import PermissaoRoute from './routes/PermissaoRoute';

/**
 * Wrapper para rotas com autenticação e permissão.
 */
const renderProtectedRoute = (element, permissoes) => (
  <PrivateRoute element={<PermissaoRoute element={element} permissoes={permissoes}/>}/>
);

const App = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/pedidos/importar" element={<ImportacaoPedidos/>}/>
      <Route path="/consignacoes" element={<Consignacoes/>}/>
      <Route path="/configuracoes" element={<Configuracoes/>}/>
      <Route path="/acesso-negado" element={<AccessDeniedPage/>}/>
      <Route path="*" element={<NotFoundPage/>}/>

      {/* Página inicial protegida */}
      <Route
        path="/"
        element={
          <PrivateRoute
            element={<PermissaoRoute element={<HomePage/>} permissoes="home.visualizar"/>}
          />
        }
      />

      {/* Rotas protegidas por permissão */}
      <Route path="/categorias" element={renderProtectedRoute(<Categorias/>, 'categorias.visualizar')}/>
      <Route path="/clientes" element={renderProtectedRoute(<Clientes/>, 'clientes.visualizar')}/>
      <Route path="/configuracao-outlet"
             element={renderProtectedRoute(<ConfiguracaoOutlet/>, 'produtos.configurar_outlet')}/>
      <Route path="/depositos" element={renderProtectedRoute(<Depositos/>, 'depositos.visualizar')}/>
      <Route path="/depositos/:depositoId/movimentacoes"
             element={renderProtectedRoute(<EstoqueMovimentacoes/>, 'estoque.movimentacao')}/>
      <Route path="/estoque/movimentacao"
             element={renderProtectedRoute(<EstoqueMovimentacoes/>, 'estoque.movimentacao')}/>
      <Route path="/finalizar-pedido/:id" element={renderProtectedRoute(<FinalizarPedido/>, 'carrinho.finalizar')}/>
      <Route path="/pedidos" element={renderProtectedRoute(<Pedidos/>, 'pedidos.visualizar')}/>
      <Route path="/perfis" element={renderProtectedRoute(<Perfis/>, 'perfis.visualizar')}/>
      <Route path="/permissoes" element={renderProtectedRoute(<Permissoes/>, 'permissoes.visualizar')}/>
      <Route path="/produto-variacoes" element={renderProtectedRoute(<ProdutoVariacoes/>, 'produtos.variacoes')}/>
      <Route path="/produtos" element={renderProtectedRoute(<Produtos/>, 'produtos.visualizar')}/>
      <Route path="/produtos/importar" element={renderProtectedRoute(<ImportacaoPage/>, 'produtos.importar')}/>
      <Route path="/produtos-outlet" element={renderProtectedRoute(<ProdutosOutlet/>, 'produtos.outlet')}/>
      <Route path="/catalogo" element={renderProtectedRoute(<CatalogoProdutos/>, 'produtos.catalogo')}/>
      <Route path="/usuarios" element={renderProtectedRoute(<Usuarios/>, 'usuarios.visualizar')}/>
    </Routes>
  );
};

export default App;
