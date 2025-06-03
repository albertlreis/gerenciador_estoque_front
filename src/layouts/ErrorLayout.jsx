import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

/**
 * Layout reutilizável para páginas de erro (ex: 403, 404).
 */
const ErrorLayout = ({ title, message, icon = 'pi-exclamation-triangle' }) => {
  const navigate = useNavigate();

  return (
    <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '100vh', flexDirection: 'column' }}>
      <i className={`pi ${icon}`} style={{ fontSize: '3rem', color: '#f44336', marginBottom: '1rem' }} />
      <h2 style={{ fontSize: '2rem', color: '#f44336' }}>{title}</h2>
      <p style={{ marginBottom: '2rem', maxWidth: '90%', textAlign: 'center' }}>{message}</p>
      <Button
        label="Voltar ao Início"
        icon="pi pi-home"
        className="p-button-raised"
        onClick={() => navigate('/')}
      />
    </div>
  );
};

export default ErrorLayout;
