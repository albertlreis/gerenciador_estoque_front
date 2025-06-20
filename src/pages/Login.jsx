import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import apiAuth from '../services/apiAuth';
import apiEstoque from '../services/apiEstoque';
import { isTokenValid } from '../helper';
import { useAuth } from '../context/AuthContext';
import '../Login.css';
import InputWithIcon from '../components/InputWithIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isTokenValid()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const response = await apiAuth.post('/login', { email, senha });
      const { access_token, expires_in, user } = response.data;

      if (!access_token || !user) return setErro('Credenciais inválidas');
      if (!user.ativo) return setErro('Usuário inativo, contate o administrador');

      const expiresAt = new Date().getTime() + expires_in * 1000;
      login({ token: access_token, expiresAt, ...user });

      apiEstoque.defaults.headers.common['X-Permissoes'] = JSON.stringify(user.permissoes || []);
      navigate('/');
    } catch (err) {
      setErro('E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <form className="auth-content" onSubmit={handleSubmit}>
        <div className="logo-container">
          <img src="/logo.png" alt="Logo" style={{ height: 100 }} />
        </div>

        <h2 className="text-center mb-4">Bem-vindo!!</h2>

        {erro && (
          <p className="error-message" role="alert">
            {erro}
          </p>
        )}

        <label htmlFor="email">E-mail</label>
        <InputWithIcon
          icon={FiMail}
          type="email"
          name="email"
          id="email"
          aria-label="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu e-mail"
        />

        <label htmlFor="senha">Senha</label>
        <div style={{ position: 'relative' }}>
          <InputWithIcon
            icon={FiLock}
            type={mostrarSenha ? 'text' : 'password'}
            name="senha"
            id="senha"
            aria-label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((prev) => !prev)}
            style={{
              position: 'absolute',
              top: '50%',
              right: '12px',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <i className={`pi ${mostrarSenha ? 'pi-eye-slash' : 'pi-eye'}`} style={{ fontSize: '1.2rem', color: '#666' }} />
          </button>
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
