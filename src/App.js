import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Categorias from './pages/Categorias';
import Produtos from './pages/Produtos';
import Usuarios from './pages/Usuarios';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import ProdutoVariacoes from './pages/ProdutoVariacoes';
import Perfis from './pages/Perfis';
import Permissoes from './pages/Permissoes';
import { isTokenValid } from './helper';
import Depositos from "./pages/Depositos";
import EstoqueMovimentacoes from "./pages/EstoqueMovimentacoes";

const App = () => {
  // Atualiza o localStorage se o token estiver expirado
  if (!isTokenValid()) {
    localStorage.removeItem('user');
  }
  const isAuthenticated = isTokenValid();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

        {/* Rotas protegidas */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/clientes" element={isAuthenticated ? <Clientes /> : <Navigate to="/login" />} />
        <Route path="/usuarios" element={isAuthenticated ? <Usuarios /> : <Navigate to="/login" />} />
        <Route path="/categorias" element={isAuthenticated ? <Categorias /> : <Navigate to="/login" />} />
        <Route path="/produtos" element={isAuthenticated ? <Produtos /> : <Navigate to="/login" />} />
        <Route path="/pedidos" element={isAuthenticated ? <Pedidos /> : <Navigate to="/login" />} />
        <Route path="/produto-variacoes" element={isAuthenticated ? <ProdutoVariacoes /> : <Navigate to="/login" />} />
        <Route path="/perfis" element={isAuthenticated ? <Perfis /> : <Navigate to="/login" />} />
        <Route path="/permissoes" element={isAuthenticated ? <Permissoes /> : <Navigate to="/login" />} />
        <Route path="/depositos" element={isAuthenticated ? <Depositos /> : <Navigate to="/login" />} />
        <Route path="/estoque/movimentacao" element={isAuthenticated ? <EstoqueMovimentacoes /> : <Navigate to="/login" />} />
        <Route path="/depositos/:depositoId/movimentacoes" element={isAuthenticated ? <EstoqueMovimentacoes /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
