import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Categorias from './pages/Categorias';
import Produtos from './pages/Produtos';
import Usuarios from "./pages/Usuarios";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import ProdutoVariacoes from "./pages/ProdutoVariacoes";

const App = () => {
  const isAuthenticated = localStorage.getItem('user');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/clientes" element={isAuthenticated ? <Clientes /> : <Navigate to="/login" />} />
        <Route path="/usuarios" element={isAuthenticated ? <Usuarios /> : <Navigate to="/login" />} />
        <Route path="/categorias" element={isAuthenticated ? <Categorias /> : <Navigate to="/login" />} />
        <Route path="/produtos" element={isAuthenticated ? <Produtos /> : <Navigate to="/login" />} />
        <Route path="/pedidos" element={isAuthenticated ? <Pedidos /> : <Navigate to="/login" />} />
        <Route path="/produto-variacoes" element={isAuthenticated ? <ProdutoVariacoes /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
