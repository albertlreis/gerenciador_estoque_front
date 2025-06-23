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
      const response = await api.get('/carrinhos');
      const lista = response.data?.data || [];
      setCarrinhos(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.error('Erro ao listar carrinhos', e);
      setCarrinhos([]);
    }
  };

  const carregarCarrinho = async (id) => {
    try {
      const response = await api.get(`/carrinhos/${id}`);
      const carrinho = response.data?.data || {};
      setCarrinhoAtual(carrinho);
      setItens(Array.isArray(carrinho.itens) ? carrinho.itens : []);
    } catch (e) {
      console.error('Erro ao carregar carrinho', e);
      setCarrinhoAtual(null);
      setItens([]);
    }
  };

  const criarCarrinho = async (id_cliente) => {
    try {
      const response = await api.post('/carrinhos', { id_cliente });
      const novoCarrinho = response.data?.data || response.data;
      await carregarCarrinho(novoCarrinho.id);
      await listarCarrinhos();
    } catch (e) {
      console.error('Erro ao criar carrinho', e);
      return null;
    }
  };

  const atualizarCarrinho = async (id, dados) => {
    try {
      const response = await api.put(`/carrinhos/${id}`, dados);
      const carrinhoAtualizado = response.data?.data || response.data;
      setCarrinhoAtual(carrinhoAtualizado);
    } catch (e) {
      console.error('Erro ao atualizar carrinho', e);
      return null;
    }
  };

  const adicionarItem = async ({ id_variacao, quantidade, preco_unitario, subtotal, outlet_id }) => {
    if (!carrinhoAtual?.id) return;

    try {
      await api.post('/carrinho-itens', {
        id_carrinho: carrinhoAtual.id,
        id_variacao,
        quantidade,
        preco_unitario,
        subtotal: subtotal ?? preco_unitario * quantidade,
        outlet_id
      });
      await carregarCarrinho(carrinhoAtual.id);
    } catch (e) {
      console.error('Erro ao adicionar item', e);
    }
  };

  const removerItem = async (id) => {
    try {
      await api.delete(`/carrinho-itens/${id}`);
      await carregarCarrinho(carrinhoAtual.id);
    } catch (e) {
      console.error('Erro ao remover item', e);
    }
  };

  const limparCarrinho = async () => {
    if (!carrinhoAtual?.id) return;
    try {
      await api.delete(`/carrinho-itens/limpar/${carrinhoAtual.id}`);
      await carregarCarrinho(carrinhoAtual.id);
    } catch (e) {
      console.error('Erro ao limpar carrinho', e);
    }
  };

  const finalizarPedido = async ({ id_parceiro, observacoes, id_usuario }) => {
    try {
      const response = await api.post('/pedidos', {
        id_carrinho: carrinhoAtual.id,
        id_cliente: carrinhoAtual.id_cliente,
        id_parceiro,
        observacoes,
        id_usuario
      });
      setCarrinhoAtual(null);
      setItens([]);
      await listarCarrinhos();
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      console.error('Erro ao finalizar pedido', error);

      const message =
        error.response?.data?.message ||
        'Erro inesperado ao finalizar o pedido.';

      return {
        success: false,
        message,
        status: error.response?.status,
      };
    }
  };

  const cancelarCarrinho = async () => {
    if (!carrinhoAtual?.id) return;
    try {
      await api.post(`/carrinhos/${carrinhoAtual.id}/cancelar`);
      setCarrinhoAtual(null);
      setItens([]);
      await listarCarrinhos();
    } catch (e) {
      console.error('Erro ao cancelar carrinho', e);
    }
  };

  const quantidadeTotal = (itens || []).reduce((sum, item) => sum + Number(item.quantidade || 0), 0);

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
