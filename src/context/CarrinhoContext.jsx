import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/apiEstoque';

const CarrinhoContext = createContext();

export const CarrinhoProvider = ({ children }) => {
  const [carrinhos, setCarrinhos] = useState([]);
  const [carrinhoAtual, setCarrinhoAtual] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  const listarCarrinhos = async () => {
    try {
      const { data } = await api.get('/carrinhos');
      setCarrinhos(data);
    } catch (e) {
      return null;
    }
  };

  const carregarCarrinho = async (id) => {
    try {
      const { data } = await api.get(`/carrinhos/${id}`);
      setCarrinhoAtual(data);
      setItens(data.itens);
    } catch (e) {
      return null;
    }
  };

  const criarCarrinho = async (id_cliente) => {
    try {
      const { data } = await api.post('/carrinhos', { id_cliente });
      await carregarCarrinho(data.id);
      await listarCarrinhos();
    } catch (e) {
      return null;
    }
  };

  const atualizarCarrinho = async (id, dados) => {
    try {
      const { data } = await api.put(`/carrinhos/${id}`, dados);
      setCarrinhoAtual(data);
    } catch (e) {
      return null;
    }
  };

  const adicionarItem = async ({ id_variacao, quantidade, preco_unitario }) => {
    if (!carrinhoAtual?.id) return;

    await api.post('/carrinho-itens', {
      id_carrinho: carrinhoAtual.id,
      id_variacao,
      quantidade,
      preco_unitario
    });
    await carregarCarrinho(carrinhoAtual.id);
  };

  const removerItem = async (id) => {
    await api.delete(`/carrinho-itens/${id}`);
    await carregarCarrinho(carrinhoAtual.id);
  };

  const limparCarrinho = async () => {
    if (!carrinhoAtual?.id) return;
    await api.delete(`/carrinho-itens/limpar/${carrinhoAtual.id}`);
    await carregarCarrinho(carrinhoAtual.id);
  };

  const finalizarPedido = async ({ id_parceiro, observacoes }) => {
    const { data } = await api.post('/pedidos', {
      id_carrinho: carrinhoAtual.id,
      id_cliente: carrinhoAtual.id_cliente,
      id_parceiro,
      observacoes
    });
    setCarrinhoAtual(null);
    setItens([]);
    await listarCarrinhos();
    return data;
  };

  const cancelarCarrinho = async () => {
    if (!carrinhoAtual?.id) return;
    await api.post(`/carrinhos/${carrinhoAtual.id}/cancelar`);
    setCarrinhoAtual(null);
    setItens([]);
    await listarCarrinhos();
  };

  const quantidadeTotal = itens.reduce((sum, item) => sum + Number(item.quantidade || 0), 0);

  useEffect(() => {
    listarCarrinhos();
  }, []);

  return (
    <CarrinhoContext.Provider
      value={{
        carrinhos,
        carrinhoAtual,
        itens,
        loading,
        criarCarrinho,
        carregarCarrinho,
        atualizarCarrinho,
        adicionarItem,
        removerItem,
        limparCarrinho,
        finalizarPedido,
        cancelarCarrinho,
        quantidadeTotal
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => useContext(CarrinhoContext);
