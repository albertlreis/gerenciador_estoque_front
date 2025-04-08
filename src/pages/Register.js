import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import api from '../services/api';

const Register = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Chamada ao endpoint de registro
      await api.post('/register', { nome, email, senha });
      navigate('/login');
    } catch (error) {
      console.error('Erro ao registrar:', error.response?.data || error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <span className="p-float-label">
          <InputText id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <label htmlFor="nome">Nome</label>
        </span>
        <br />
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
        <Button label="Registrar" type="submit" />
      </form>
    </div>
  );
};

export default Register;
