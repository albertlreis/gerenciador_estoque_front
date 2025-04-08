import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <h2>Bem-vindo à Home</h2>
      <p>Apenas usuários autenticados podem ver esta página.</p>
      <Button label="Sair" onClick={handleLogout} />
    </div>
  );
};

export default Home;
