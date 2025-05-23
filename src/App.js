import React from 'react';
import {Routes, Route} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import Categorias from './pages/Categorias';
import Produtos from './pages/Produtos';
import Usuarios from './pages/Usuarios';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import ProdutoVariacoes from './pages/ProdutoVariacoes';
import Perfis from './pages/Perfis';
import Permissoes from './pages/Permissoes';
import Depositos from './pages/Depositos';
import EstoqueMovimentacoes from './pages/EstoqueMovimentacoes';
import CatalogoProdutos from './pages/CatalogoProdutos';
import ImportacaoPage from './pages/ImportacaoProdutos';
import ProdutosOutlet from './pages/ProdutosOutlet';
import ConfiguracaoOutlet from './pages/ConfiguracaoOutlet';

import PrivateRoute from './routes/PrivateRoute';
import PermissaoRoute from './routes/PermissaoRoute';
import FinalizarPedido from "./pages/FinalizarPedido";
import ImportacaoPedidos from "./pages/ImportacaoPedidos";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/pedidos/importar" element={<ImportacaoPedidos/>}/>

      <Route path="/" element={<PrivateRoute element={<HomePage/>}/>}/>
      <Route path="/clientes" element={<PrivateRoute
        element={<PermissaoRoute element={<Clientes/>} permissoes="clientes.visualizar"/>}/>}/>
      <Route path="/usuarios" element={<PrivateRoute
        element={<PermissaoRoute element={<Usuarios/>} permissoes="usuarios.visualizar"/>}/>}/>
      <Route path="/categorias" element={<PrivateRoute
        element={<PermissaoRoute element={<Categorias/>} permissoes="categorias.visualizar"/>}/>}/>
      <Route path="/produtos" element={<PrivateRoute
        element={<PermissaoRoute element={<Produtos/>} permissoes="produtos.visualizar"/>}/>}/>
      <Route path="/produtos/importar" element={<PrivateRoute
        element={<PermissaoRoute element={<ImportacaoPage/>} permissoes="produtos.importar"/>}/>}/>
      <Route path="/produtos-outlet" element={<PrivateRoute
        element={<PermissaoRoute element={<ProdutosOutlet/>} permissoes="produtos.outlet"/>}/>}/>
      <Route path="/configuracao-outlet" element={<PrivateRoute
        element={<PermissaoRoute element={<ConfiguracaoOutlet/>} permissoes="produtos.configurar_outlet"/>}/>}/>
      <Route path="/catalogo" element={<PrivateRoute
        element={<PermissaoRoute element={<CatalogoProdutos/>} permissoes="produtos.catalogo"/>}/>}/>
      <Route path="/pedidos" element={<PrivateRoute
        element={<PermissaoRoute element={<Pedidos/>} permissoes="pedidos.visualizar"/>}/>}/>
      <Route path="/produto-variacoes" element={<PrivateRoute
        element={<PermissaoRoute element={<ProdutoVariacoes/>} permissoes="produtos.variacoes"/>}/>}/>
      <Route path="/perfis"
             element={<PrivateRoute element={<PermissaoRoute element={<Perfis/>} permissoes="perfis.visualizar"/>}/>}/>
      <Route path="/permissoes" element={<PrivateRoute
        element={<PermissaoRoute element={<Permissoes/>} permissoes="permissoes.visualizar"/>}/>}/>
      <Route path="/depositos" element={<PrivateRoute
        element={<PermissaoRoute element={<Depositos/>} permissoes="depositos.visualizar"/>}/>}/>
      <Route path="/estoque/movimentacao" element={<PrivateRoute
        element={<PermissaoRoute element={<EstoqueMovimentacoes/>} permissoes="estoque.movimentacao"/>}/>}/>
      <Route path="/depositos/:depositoId/movimentacoes" element={<PrivateRoute
        element={<PermissaoRoute element={<EstoqueMovimentacoes/>} permissoes="estoque.movimentacao"/>}/>}/>

      <Route path="/finalizar-pedido/:id" element={<PrivateRoute
        element={<PermissaoRoute element={<FinalizarPedido/>} permissoes="carrinho.finalizar"/>}/>}/>

    </Routes>
  );
};

export default App;
