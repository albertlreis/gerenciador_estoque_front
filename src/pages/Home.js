// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Supondo que exista um endpoint para obter o perfil: /auth/profile
          const response = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
          setErrorMessage('Sessão expirada. Faça login novamente.');
          handleLogout();
        }
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <h2>Bem-vindo{user ? `, ${user.username}` : ''}</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <p>Apenas usuários autenticados podem ver esta página.</p>
      <Button label="Sair" onClick={handleLogout} />
    </div>
  );
};

export default Home;
