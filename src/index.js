import React from 'react';
import ReactDOM from 'react-dom/client';
import './config/primeLocale';
import App from './App';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';
import 'primeflex/themes/primeone-light.css';

import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { MenuStateProvider } from './context/MenuStateContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MenuStateProvider>
          <App />
        </MenuStateProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
