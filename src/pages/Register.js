import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica de registro (ex: chamada à API)
    if(username && password) {
      // Após registrar, redirecione para a página de login
      navigate('/login');
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
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
        <Button label="Registrar" type="submit" />
      </form>
    </div>
  );
};

export default Register;
