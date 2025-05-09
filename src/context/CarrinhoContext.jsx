import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/apiEstoque';

const CarrinhoContext = createContext();

export const CarrinhoProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarCarrinho = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/carrinho');
      setItens(data.itens || data || []);
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = async (novoItem) => {
    try {
      const existente = itens.find(i => i.id_variacao === novoItem.id_variacao);
      const quantidade = existente ? existente.quantidade + novoItem.quantidade : novoItem.quantidade;

      await api.post('/carrinho', {
        ...novoItem,
        quantidade,
        preco_unitario: Number(novoItem.preco_unitario),
      });

      await carregarCarrinho();
    } catch (err) {
      console.error('Erro ao adicionar item ao carrinho:', err);
    }
  };

  const removerItem = async (id) => {
    try {
      await api.delete(`/carrinho/${id}`);
      await carregarCarrinho();
    } catch (err) {
      console.error('Erro ao remover item do carrinho:', err);
    }
  };

  const limparCarrinho = async () => {
    try {
      await api.delete('/carrinho');
      await carregarCarrinho();
    } catch (err) {
      console.error('Erro ao limpar carrinho:', err);
    }
  };

  const quantidadeTotal = itens.reduce((sum, item) => sum + Number(item.quantidade || 0), 0);

  useEffect(() => {
    carregarCarrinho();
  }, []);

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        loading,
        adicionarItem,
        removerItem,
        limparCarrinho,
        carregarCarrinho,
        quantidadeTotal,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => useContext(CarrinhoContext);
