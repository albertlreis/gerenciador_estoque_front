import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import api from '../../services/apiEstoque';

const statusTag = (status) => {
  const cor = {
    pendente: 'warning',
    aceita: 'success',
    devolvida: 'info',
    vencida: 'danger'
  }[status] || 'secondary';

  return <Tag value={status} severity={cor} />;
};

const ConsignacaoModal = ({ id, visible, onHide }) => {
  const [consignacao, setConsignacao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toastRef = React.useRef(null);

  useEffect(() => {
    if (visible && id) {
      carregar();
    }
  }, [id, visible]);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/consignacoes/${id}`);
      setConsignacao(data);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (status) => {
    setSaving(true);
    try {
      await api.put(`/consignacoes/${id}`, { status });
      toastRef.current.show({ severity: 'success', summary: 'Sucesso', detail: `Status alterado para "${status}"` });
      await carregar();
    } catch (e) {
      toastRef.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar status' });
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        label="Registrar Devolução"
        icon="pi pi-undo"
        severity="info"
        disabled={saving || consignacao?.status !== 'pendente'}
        onClick={() => atualizarStatus('devolvida')}
      />
      <Button
        label="Confirmar Compra"
        icon="pi pi-check"
        severity="success"
        disabled={saving || consignacao?.status !== 'pendente'}
        onClick={() => atualizarStatus('aceita')}
      />
      <Button
        label="Fechar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toastRef} />
      <Dialog
        header={`Detalhes da Consignação #${id}`}
        visible={visible}
        onHide={onHide}
        style={{ width: '40vw' }}
        modal
        footer={footer}
      >
        {loading || !consignacao ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <div className="p-fluid">
            <div className="mb-3"><strong>Cliente:</strong><p>{consignacao.cliente_nome}</p></div>
            <div className="mb-3"><strong>Produto:</strong><p>{consignacao.produto_nome}</p></div>
            <div className="mb-3"><strong>Quantidade:</strong><p>{consignacao.quantidade}</p></div>
            <div className="mb-3"><strong>Data de Envio:</strong><p>{consignacao.data_envio}</p></div>
            <div className="mb-3"><strong>Prazo para Resposta:</strong><p>{consignacao.prazo_resposta}</p></div>
            <div className="mb-3"><strong>Status:</strong><p>{statusTag(consignacao.status)}</p></div>
            {consignacao.observacoes && (
              <div className="mb-3"><strong>Observações:</strong><p>{consignacao.observacoes}</p></div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default ConsignacaoModal;
