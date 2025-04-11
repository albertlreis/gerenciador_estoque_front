import React from "react";
import { FiMail, FiLock } from "react-icons/fi"; // Ícones
import "../Login.css"; // Seu CSS personalizado

const Login = () => {
  return (
    <div className="auth-layout">
      <div className="auth-content">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img src="/logo.png" alt="Logo" style={{ height: 60 }} />
        </div>
        <h2 className="text-center mb-4">Bem-vindo!!</h2>
        {/* Email */}
        <label htmlFor="email">Email</label>
        <div className="input-icon" style={{marginBottom: "1rem" }}>
          <FiMail className="icon" />
          <input type="email" id="email" placeholder="Digite seu e-mail" />
        </div>
        {/* Senha */}
        <label htmlFor="password">Senha</label>
        <div className="input-icon">
          <FiLock className="icon" />
          <input type="password" id="password" placeholder="Digite sua senha" />
        </div>

        <div className="remember-me">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember"> Lembre-se de mim</label>
          <a href="#" className="forgot">
            Esqueceu a senha?
          </a>
        </div>

        <button className="login-button">Entrar</button>
      </div>
    </div>
  );
};

export default Login;
