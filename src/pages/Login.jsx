import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import apiAuth from '../services/apiAuth';
import apiEstoque from '../services/apiEstoque';
import { isTokenValid } from '../helper';
import { useAuth } from '../context/AuthContext';
import '../Login.css';
import InputWithIcon from "../components/InputWithIcon";

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isTokenValid()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const response = await apiAuth.post('/login', { email, senha });
      const { access_token, expires_in, user } = response.data;

      if (!access_token || !user) return setErro('Credenciais inválidas');
      if (!user.ativo) return setErro('Usuário inativo, contate o administrador');

      const expiresAt = new Date().getTime() + expires_in * 1000;
      login({ token: access_token, expiresAt, ...user });

      // Cabeçalho de permissões na API de estoque
      apiEstoque.defaults.headers.common['X-Permissoes'] = JSON.stringify(user.permissoes || []);

      navigate('/');
    } catch (err) {
      setErro('E-mail ou senha inválidos');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-content">
        <div style={{textAlign: 'center', marginBottom: '1rem'}}>
          <img src="/logo.png" alt="Logo" style={{height: 100}}/>
        </div>
        <h2 className="text-center mb-4">Bem-vindo!!</h2>
        {erro && <p style={{color: 'red'}}>{erro}</p>}
        <label htmlFor="email">E-mail</label>
        <InputWithIcon
          icon={FiMail}
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu e-mail"
        />

        <label htmlFor="senha">Senha</label>
        <InputWithIcon
          icon={FiLock}
          type="password"
          name="senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
        />

        <button className="login-button" onClick={handleLogin}>Entrar</button>
      </div>
    </div>
  );
};

export default Login;
