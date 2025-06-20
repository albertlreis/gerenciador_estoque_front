import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';
import 'primeflex/themes/primeone-light.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CarrinhoProvider } from './context/CarrinhoContext';
import { BrowserRouter } from 'react-router-dom';
import useCheckVersion from './hooks/useCheckVersion';

const AppWithCarrinho = () => {
  const { isAuthenticated } = useAuth();
  useCheckVersion();
  
  return isAuthenticated ? (
    <CarrinhoProvider>
      <App />
    </CarrinhoProvider>
  ) : (
    <App />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppWithCarrinho />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
