import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';
import 'primeflex/themes/primeone-light.css';
import {CarrinhoProvider} from "./context/CarrinhoContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CarrinhoProvider>
      <App />
    </CarrinhoProvider>
  </React.StrictMode>
);
