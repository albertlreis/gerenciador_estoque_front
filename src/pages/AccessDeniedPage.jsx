import React from 'react';
import ErrorLayout from '../layouts/ErrorLayout';

/**
 * Página 403 - acesso negado.
 */
const AccessDeniedPage = () => {
  return (
    <ErrorLayout
      title="Acesso Negado"
      message="Você não tem permissão para acessar esta página."
      icon="pi pi-lock"
    />
  );
};

export default AccessDeniedPage;
