import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useCarrinho } from '../context/CarrinhoContext';
import api from '../services/apiEstoque';

const NovoPedido = () => {
  const { itens, limparCarrinho } = useCarrinho();
  const [cliente, setCliente] = useState(null);
  const [parceiro, setParceiro] = useState(null);
  const [observacoes, setObservacoes] = useState('');

  const handleFinalizar = async () => {
    await api.post('/pedidos', {
      id_cliente: cliente?.id,
      id_parceiro: parceiro?.id,
      observacoes
    });
    limparCarrinho();
    alert('Pedido finalizado com sucesso!');
  };

  return (
    <div className="p-4">
      <h2>Finalizar Pedido</h2>
      <Dropdown value={cliente} onChange={(e) => setCliente(e.value)} options={[]} optionLabel="nome" placeholder="Selecione o cliente" />
      <Dropdown value={parceiro} onChange={(e) => setParceiro(e.value)} options={[]} optionLabel="nome" placeholder="Selecione o parceiro (opcional)" />
      <textarea rows="4" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full mt-2" placeholder="Observações..." />
      <Button label="Finalizar Pedido" className="mt-3" onClick={handleFinalizar} disabled={!cliente || itens.length === 0} />
    </div>
  );
};

export default NovoPedido;
