import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Lógica simplificada de autenticação (substitua pela sua lógica real)
    if(username && password) {
      localStorage.setItem('user', JSON.stringify({ username }));
      navigate('/');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <span className="p-float-label">
          <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="username">Usuário</label>
        </span>
        <br/>
        <span className="p-float-label">
          <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label htmlFor="password">Senha</label>
        </span>
        <br/>
        <Button label="Entrar" type="submit" />
      </form>
    </div>
  );
};

export default Login;
