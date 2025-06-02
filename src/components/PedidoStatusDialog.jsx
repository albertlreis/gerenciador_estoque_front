import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import api from '../services/apiEstoque';

const opcoesStatus = [
  { label: 'Criado', value: 'pedido_criado' },
  { label: 'Enviado à Fábrica', value: 'pedido_enviado_fabrica' },
  { label: 'Nota Emitida', value: 'nota_emitida' },
  { label: 'Previsão Embarque', value: 'previsao_embarque_fabrica' },
  { label: 'Embarcado', value: 'embarque_fabrica' },
  { label: 'Nota Recebida', value: 'nota_recebida_compra' },
  { label: 'Entrega Estoque', value: 'entrega_estoque' },
  { label: 'Envio Cliente', value: 'envio_cliente' },
  { label: 'Entrega Cliente', value: 'entrega_cliente' },
  { label: 'Consignado', value: 'consignado' },
  { label: 'Devolução Consignação', value: 'devolucao_consignacao' },
  { label: 'Finalizado', value: 'finalizado' },
];

const PedidoStatusDialog = ({ visible, onHide, pedido, onSalvo, toast }) => {
  const [status, setStatus] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const salvar = async () => {
    if (!status) return;

    try {
      setLoading(true);
      await api.patch(`/pedidos/${pedido.id}/status`, {
        status,
        observacoes
      });
      toast.current.show({ severity: 'success', summary: 'Status atualizado' });
      onSalvo();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog header="Atualizar Status" visible={visible} onHide={onHide} style={{ width: '30vw' }} modal>
      <div className="flex flex-column gap-3">
        <Dropdown value={status} options={opcoesStatus} onChange={(e) => setStatus(e.value)} placeholder="Selecione o novo status" className="w-full" />
        <InputTextarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={4} placeholder="Observações (opcional)" className="w-full" />
        <Button label="Salvar" icon="pi pi-save" loading={loading} onClick={salvar} />
      </div>
    </Dialog>
  );
};

export default PedidoStatusDialog;
