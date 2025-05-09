import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import SakaiLayout from '../layouts/SakaiLayout';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <SakaiLayout>
      <div className="home-container">
        <h2>Bem-vindo à Home</h2>
        <Button label="Sair" onClick={handleLogout} />
      </div>
    </SakaiLayout>
  );
};

export default Home;
