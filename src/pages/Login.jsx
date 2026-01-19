import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';

import AuthApi from '../api/authApi';
import { isTokenValid } from '../helper/isTokenValid';
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
      const response = await AuthApi.login({ email, senha });

      // Mantém compatível com o que seu back já entrega
      const accessToken = response.data?.access_token || response.data?.token || response.data?.accessToken;
      const expiresIn = Number(response.data?.expires_in ?? response.data?.expiresIn ?? 0);
      const user = response.data?.user || response.data?.usuario;

      if (!accessToken || !user) {
        setErro('Credenciais inválidas');
        return;
      }
      if (user?.ativo === false) {
        setErro('Usuário inativo, contate o administrador');
        return;
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const exp = expiresIn ? (nowSec + expiresIn) : null;

      login({
        token: accessToken,
        exp, // <<< padrão validado pelo helper
        expiresAt: exp ? exp * 1000 : null, // opcional (ms), compat
        ...user,
      });

      navigate('/');
    } catch (err) {
      console.error(err);
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
            <i
              className={`pi ${mostrarSenha ? 'pi-eye-slash' : 'pi-eye'}`}
              style={{ fontSize: '1.2rem', color: '#666' }}
            />
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
