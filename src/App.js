import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CategoriaGestao from './pages/CategoriaGestao';
import ProdutoGestao from './pages/ProdutoGestao';

const App = () => {
  const isAuthenticated = localStorage.getItem('user');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/categorias" element={isAuthenticated ? <CategoriaGestao /> : <Navigate to="/login" />} />
        <Route path="/produtos" element={isAuthenticated ? <ProdutoGestao /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
