import React, { useEffect, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { useCarrinho } from '../context/CarrinhoContext';
import api from '../services/apiEstoque';

const CarrinhoSidebar = ({ visible, onHide, onFinalizar, finalizando }) => {
  const { itens, removerItem, limparCarrinho, carregarCarrinho } = useCarrinho();
  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [parceiroSelecionado, setParceiroSelecionado] = useState(null);

  const total = itens.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  useEffect(() => {
    if (visible) {
      carregarClientes();
      carregarParceiros();
    }
  }, [visible]);

  const carregarClientes = async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Erro ao carregar clientes', err);
    }
  };

  const carregarParceiros = async () => {
    try {
      const { data } = await api.get('/parceiros');
      setParceiros(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Erro ao carregar parceiros', err);
    }
  };

  const confirmarRemocaoItem = (itemId) => {
    confirmDialog({
      message: 'Deseja remover este item do carrinho?',
      header: 'Confirmação',
      icon: 'pi pi-trash',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => removerItem(itemId)
    });
  };

  const confirmarFinalizacao = () => {
    if (!clienteSelecionado) {
      alert('Selecione um cliente antes de finalizar o pedido.');
      return;
    }

    confirmDialog({
      message: 'Tem certeza que deseja finalizar este pedido?',
      header: 'Finalizar Pedido',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () =>
        onFinalizar({
          id_cliente: clienteSelecionado.id,
          id_parceiro: parceiroSelecionado?.id || null
        })
    });
  };

  const atualizarQuantidadeItem = async (item, novaQtd) => {
    if (novaQtd <= 0) {
      confirmarRemocaoItem(item.id);
      return;
    }

    try {
      await api.post('/carrinho', {
        id_variacao: item.id_variacao,
        quantidade: novaQtd,
        preco_unitario: Number(item.preco_unitario),
      });
      await carregarCarrinho();
    } catch (err) {
      console.error('Erro ao atualizar quantidade', err);
    }
  };

  return (
    <Sidebar visible={visible} onHide={onHide} position="right" showCloseIcon>
      <h3>Carrinho</h3>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Cliente <span className="text-red-500">*</span></label>
        <Dropdown
          value={clienteSelecionado}
          onChange={(e) => setClienteSelecionado(e.value)}
          options={clientes}
          optionLabel="nome"
          filter
          showClear
          placeholder="Selecione o cliente"
          className="w-full"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Parceiro (opcional)</label>
        <Dropdown
          value={parceiroSelecionado}
          onChange={(e) => setParceiroSelecionado(e.value)}
          options={parceiros}
          optionLabel="nome"
          filter
          showClear
          placeholder="Selecione o parceiro"
          className="w-full"
        />
      </div>

      {itens.length === 0 && <p>Nenhum item no carrinho.</p>}

      {itens.map((item) => (
        <div key={item.id} className="mb-3 border-bottom pb-2">
          <div><strong>{item.variacao?.nome || 'Variação'}</strong></div>
          <div className="flex align-items-center gap-2 mt-1">
            <Button icon="pi pi-minus" text onClick={() => atualizarQuantidadeItem(item, item.quantidade - 1)} />
            <span>{item.quantidade}</span>
            <Button icon="pi pi-plus" text onClick={() => atualizarQuantidadeItem(item, item.quantidade + 1)} />
            <span>x R$ {Number(item.preco_unitario).toFixed(2)}</span>
          </div>
        </div>
      ))}

      <hr />
      <div><strong>Total: R$ {total.toFixed(2)}</strong></div>

      <div className="mt-3 flex gap-2">
        <Button
          label="Finalizar"
          icon="pi pi-check"
          loading={finalizando}
          disabled={itens.length === 0 || finalizando}
          onClick={confirmarFinalizacao}
        />
        <Button
          label="Limpar"
          icon="pi pi-trash"
          severity="danger"
          disabled={itens.length === 0 || finalizando}
          onClick={() => {
            confirmDialog({
              message: 'Tem certeza que deseja limpar o carrinho?',
              header: 'Confirmação',
              icon: 'pi pi-exclamation-triangle',
              acceptLabel: 'Sim',
              rejectLabel: 'Cancelar',
              accept: limparCarrinho
            });
          }}
        />
      </div>

      <ConfirmDialog />
    </Sidebar>
  );
};

export default CarrinhoSidebar;
