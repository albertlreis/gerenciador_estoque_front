import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Importação dos estilos do PrimeReact e PrimeIcons
import 'primereact/resources/themes/saga-blue/theme.css';  // Tema (você pode escolher outro)
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css'; // Seu arquivo de estilos customizados, se houver

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
