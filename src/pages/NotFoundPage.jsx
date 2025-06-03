import React from 'react';
import ErrorLayout from '../layouts/ErrorLayout';

/**
 * Página 404 - rota não encontrada.
 */
const NotFoundPage = () => {
  return (
    <ErrorLayout
      title="Página não encontrada"
      message="A URL que você tentou acessar não existe ou foi removida."
      icon="pi pi-ban"
    />
  );
};

export default NotFoundPage;
