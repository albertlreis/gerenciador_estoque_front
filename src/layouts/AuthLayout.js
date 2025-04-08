import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-header">
        <h1>Sakai - Autenticação</h1>
      </div>
      <div className="auth-content">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
