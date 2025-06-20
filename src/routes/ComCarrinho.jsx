import React from 'react';
import { CarrinhoProvider } from '../context/CarrinhoContext';

const ComCarrinho = ({ children }) => (
  <CarrinhoProvider>
    {children}
  </CarrinhoProvider>
);

export default ComCarrinho;
