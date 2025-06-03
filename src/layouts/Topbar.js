import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

/**
 * Componente superior fixo com logo, nome do usuário e botão de logout.
 */
const Topbar = ({ onToggleMenu, usuario, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="layout-topbar">
      <Button
        className="layout-menu-button p-link"
        onClick={onToggleMenu}
        icon="pi pi-bars"
        aria-label="Abrir menu lateral"
      />

      <div
        className="layout-topbar-logo"
        onClick={() => navigate('/')}
        title="Página inicial"
        style={{ cursor: 'pointer' }}
      >
        <img src="/logo.png" alt="Logo do sistema" className="topbar-logo-img" />
      </div>

      <div className="layout-topbar-user">
        <span className="usuario-nome">
          {usuario?.nome || 'Usuário'}
        </span>
        <Button
          icon="pi pi-sign-out"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={onLogout}
          aria-label="Sair do sistema"
          tooltip="Sair"
        />
      </div>
    </header>
  );
};

export default Topbar;
