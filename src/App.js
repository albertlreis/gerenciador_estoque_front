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

import PrivateRoute from './routes/PrivateRoute';
import ProdutosOutlet from "./pages/ProdutosOutlet";
import ConfiguracaoOutlet from "./pages/ConfiguracaoOutlet";

const App = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>

      {/* Rotas protegidas */}
      <Route path="/" element={<PrivateRoute element={<HomePage/>}/>}/>
      <Route path="/clientes" element={<PrivateRoute element={<Clientes/>}/>}/>
      <Route path="/usuarios" element={<PrivateRoute element={<Usuarios/>}/>}/>
      <Route path="/categorias" element={<PrivateRoute element={<Categorias/>}/>}/>
      <Route path="/produtos" element={<PrivateRoute element={<Produtos/>}/>}/>
      <Route path="/produtos/importar" element={<PrivateRoute element={<ImportacaoPage/>}/>}/>
      <Route path="/produtos-outlet" element={<PrivateRoute element={<ProdutosOutlet/>}/>}/>
      <Route path="/configuracao-outlet" element={<PrivateRoute element={<ConfiguracaoOutlet/>}/>}/>
      <Route path="/catalogo" element={<PrivateRoute element={<CatalogoProdutos/>}/>}/>
      <Route path="/pedidos" element={<PrivateRoute element={<Pedidos/>}/>}/>
      <Route path="/produto-variacoes" element={<PrivateRoute element={<ProdutoVariacoes/>}/>}/>
      <Route path="/perfis" element={<PrivateRoute element={<Perfis/>}/>}/>
      <Route path="/permissoes" element={<PrivateRoute element={<Permissoes/>}/>}/>
      <Route path="/depositos" element={<PrivateRoute element={<Depositos/>}/>}/>
      <Route path="/estoque/movimentacao" element={<PrivateRoute element={<EstoqueMovimentacoes/>}/>}/>
      <Route path="/depositos/:depositoId/movimentacoes" element={<PrivateRoute element={<EstoqueMovimentacoes/>}/>}/>
    </Routes>
  );
};

export default App;
