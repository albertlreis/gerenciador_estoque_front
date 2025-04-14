import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import "../Login.css";
import apiAuth from '../services/apiAuth';
import { InputText } from 'primereact/inputtext';


const Login = () => {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

    const handleLogin = async () => {
      try {
        const response = await apiAuth.post('/login', {
          email,
          senha,
        });

        // Exemplo: salva o token (ou qualquer info retornada)
        localStorage.setItem('token', response.data.token);

        // Redireciona para a página principal
        navigate('/');
      } catch (err) {
        setErro('E-mail ou senha inválidos');
        console.error(err);
      }
    };

    return (
      <div className="auth-layout">
        <div className="auth-content">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="Logo" style={{ height: 60 }} />
          </div>

          <h2 className="text-center mb-4">Bem-vindo!!</h2>

          {erro && <p style={{ color: 'red' }}>{erro}</p>}

          <label htmlFor="email">E-mail</label>
          <div className="input-icon">
            <FiMail className="icon" />
            <InputText
              placeholder="Digite seu e-mail"
              keyfilter="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label htmlFor="password">Senha</label>
          <div className="input-icon">
            <FiLock className="icon" />
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={senha}
              className="p-inputtext p-component p-filled"
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <button className="login-button" onClick={handleLogin}>Entrar</button>
        </div>
      </div>
    );
  };

  export default Login;
