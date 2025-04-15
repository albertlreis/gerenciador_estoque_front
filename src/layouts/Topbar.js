import React from 'react';
import { Button } from 'primereact/button';
import './Topbar.css';

const Topbar = ({ onToggleMenu }) => {
  return (
    <div className="layout-topbar">
      {/* Botão 'hambúrguer' para abrir/recolher o menu lateral */}
      <Button
        className="layout-menu-button p-link"
        onClick={onToggleMenu}
        icon="pi pi-bars"
        aria-label="Menu"
      />

      {/* Logo ou título */}
      <div className="layout-topbar-logo">
        <img
          src="/logo.png"
          alt="Sakai Logo"
          className="topbar-logo-img"
        />
      </div>

    </div>
  );
};

export default Topbar;
