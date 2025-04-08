import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Chamada ao endpoint de login
      const response = await api.post('/login', { email, senha });
      const { user, token } = response.data;
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error.response?.data || error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <span className="p-float-label">
          <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="email">Email</label>
        </span>
        <br />
        <span className="p-float-label">
          <InputText id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <label htmlFor="senha">Senha</label>
        </span>
        <br />
        <Button label="Entrar" type="submit" />
      </form>
    </div>
  );
};

export default Login;
