import React, { useState, useEffect } from 'react';
import { Timeline } from 'primereact/timeline';
import { format } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
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
  const [historico, setHistorico] = useState([]);

  const carregarHistorico = async () => {
    try {
      const { data } = await api.get(`/pedidos/${pedido.id}/historico-status`);
      setHistorico(data.map((item, index, arr) => ({
        ...item,
        isUltimo: index === arr.length - 1
      })));
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar histórico',
        detail: err.response?.data?.message || err.message
      });
    }
  };

  useEffect(() => {
    if (visible && pedido?.id) carregarHistorico();
  }, [visible, pedido]);

  const salvar = async () => {
    if (!status) return;
    try {
      setLoading(true);
      await api.patch(`/pedidos/${pedido.id}/status`, { status, observacoes });
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

  const excluirStatus = async (idStatus) => {
    try {
      await api.delete(`/pedidos/status/${idStatus}`);
      toast.current.show({ severity: 'success', summary: 'Status removido com sucesso' });
      const atualizados = historico.filter((h) => h.id !== idStatus);
      setHistorico(atualizados.map((item, index, arr) => ({
        ...item,
        isUltimo: index === arr.length - 1
      })));
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro ao remover status',
        detail: err.response?.data?.message || err.message
      });
    }
  };

  return (
    <Dialog header="Atualizar Status" visible={visible} onHide={onHide} style={{ width: '35vw' }} modal>
      <div className="flex flex-column gap-3">
        <Dropdown
          value={status}
          options={opcoesStatus}
          onChange={(e) => setStatus(e.value)}
          placeholder="Selecione o novo status"
          className="w-full"
        />
        <InputTextarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={4}
          placeholder="Observações (opcional)"
          className="w-full"
        />
        <Button label="Salvar" icon="pi pi-save" loading={loading} onClick={salvar} />
      </div>

      <Timeline
        value={historico}
        opposite={(item) => format(new Date(item.data_status), 'dd/MM/yyyy HH:mm')}
        content={(item) => (
          <div className="mb-3">
            <div className="font-semibold flex justify-between align-items-center">
              <span>{item.label}</span>
              {item.podeRemover && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger p-button-sm"
                  onClick={() => excluirStatus(item.id)}
                  tooltip="Remover status"
                />
              )}
            </div>
            {item.observacoes && <p className="text-sm text-gray-600">{item.observacoes}</p>}
            {item.usuario && <span className="text-xs text-gray-500">Por: {item.usuario}</span>}
          </div>
        )}
        marker={(item) => (
          <span
            className="p-tag"
            style={{
              backgroundColor: item.cor,
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: item.isUltimo ? '0 0 0 3px rgba(40, 167, 69, 0.5)' : 'none'
            }}
          >
            <i className={item.icone} style={{ color: 'white' }}></i>
          </span>
        )}
        className="mt-4"
      />
    </Dialog>
  );
};

export default PedidoStatusDialog;
