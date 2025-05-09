import React from 'react';

/**
 * Componente reutilizável de overlay para carregamento.
 *
 * @param {boolean} visible - Define se o overlay será exibido.
 * @param {React.ReactNode} children - Conteúdo principal.
 * @param {string} message - Mensagem personalizada exibida abaixo do spinner.
 */
const OverlayLoading = ({ visible = false, message = 'Carregando...', children }) => {
  return (
    <div style={{ position: 'relative' }}>
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.6)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px'
          }}
        >
          <div className="flex flex-column align-items-center text-center px-4">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2">{message}</p>
          </div>
        </div>
      )}

      <div style={{ opacity: visible ? 0.5 : 1, pointerEvents: visible ? 'none' : 'auto' }}>
        {children}
      </div>
    </div>
  );
};

export default OverlayLoading;
