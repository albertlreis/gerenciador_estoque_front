import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import SakaiLayout from '../layouts/SakaiLayout';

/**
 * Página 403 - acesso negado, com layout padrão do sistema.
 */
const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <SakaiLayout>
      <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
        <i className="pi pi-lock" style={{ fontSize: '3rem', color: '#f44336', marginBottom: '1rem' }} />
        <h2 style={{ color: '#f44336' }}>Acesso Negado</h2>
        <p className="text-center mb-4" style={{ maxWidth: 500 }}>
          Você não tem permissão para acessar esta página.
        </p>
        <Button
          label="Voltar ao Início"
          icon="pi pi-home"
          className="p-button-raised"
          onClick={() => navigate('/')}
        />
      </div>
    </SakaiLayout>
  );
};

export default AccessDeniedPage;
