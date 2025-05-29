import React, { useEffect, useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import api from '../../services/apiEstoque';

const statusCor = {
  pendente: 'warning',
  comprado: 'success',
  devolvido: 'info',
  vencido: 'danger'
};

const statusLabel = {
  pendente: 'Pendente',
  comprado: 'Comprado',
  devolvido: 'Devolvido',
  vencido: 'Vencido'
};

const statusTag = (status) => (
  <Tag value={statusLabel[status] || status} severity={statusCor[status] || 'secondary'} />
);

const ConsignacaoModal = ({ id, visible, onHide, onAtualizar }) => {
  const [consignacao, setConsignacao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    if (visible && id) carregar();
  }, [id, visible]);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/consignacoes/${id}`);

      // Verifica se está vencido (apenas para exibição)
      const hoje = new Date();
      const [dia, mes, ano] = data.prazo_resposta.split('/');
      const prazo = new Date(`${ano}-${mes}-${dia}`);
      if (data.status === 'pendente' && prazo < hoje) {
        data.status = 'vencido';
      }

      setConsignacao(data);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (status) => {
    setSaving(true);
    try {
      await api.patch(`/consignacoes/${id}`, { status });
      toastRef.current.show({ severity: 'success', summary: 'Sucesso', detail: `Status alterado para "${statusLabel[status]}"` });
      await carregar();
      onAtualizar?.();
      onHide();
    } catch (e) {
      toastRef.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar status' });
    } finally {
      setSaving(false);
    }
  };

  const confirmarAcao = (novoStatus) => {
    confirmDialog({
      message: `Tem certeza que deseja marcar esta consignação como "${statusLabel[novoStatus]}"?`,
      header: 'Confirmação',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: () => atualizarStatus(novoStatus),
    });
  };

  const footer = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button
        label="Registrar Devolução"
        icon="pi pi-undo"
        severity="info"
        disabled={saving || consignacao?.status !== 'pendente'}
        onClick={() => confirmarAcao('devolvido')}
      />
      <Button
        label="Confirmar Compra"
        icon="pi pi-check"
        severity="success"
        disabled={saving || consignacao?.status !== 'pendente'}
        onClick={() => confirmarAcao('comprado')}
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
      <ConfirmDialog />
      <Dialog
        header={`Detalhes da Consignação #${id}`}
        visible={visible}
        onHide={onHide}
        style={{ width: '45vw', maxWidth: '600px' }}
        modal
        footer={footer}
      >
        {loading || !consignacao ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <div className="p-fluid">
            <div className="mb-3">
              <small className="text-600">Cliente</small>
              <p className="text-lg font-medium">{consignacao.cliente_nome}</p>
            </div>

            <div className="mb-3">
              <small className="text-600">Produto</small>
              <div className="text-md font-semibold mb-2">{consignacao.produto_nome}</div>

              {Array.isArray(consignacao.atributos) && consignacao.atributos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {consignacao.atributos.map((attr, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-sm border-round">
                      {attr.nome}: {attr.valor}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid mt-3">
              <div className="col-6">
                <small className="text-600">Quantidade</small>
                <p>{consignacao.quantidade}</p>
              </div>
              <div className="col-6">
                <small className="text-600">Status</small>
                <p>{statusTag(consignacao.status)}</p>
              </div>

              <div className="col-6">
                <small className="text-600">Data de Envio</small>
                <p>{consignacao.data_envio}</p>
              </div>
              <div className="col-6">
                <small className="text-600">Prazo para Resposta</small>
                <p>{consignacao.prazo_resposta}</p>
              </div>

              {consignacao.data_resposta && (
                <div className="col-12">
                  <small className="text-600">Respondido em</small>
                  <p>{consignacao.data_resposta}</p>
                </div>
              )}
            </div>

            {consignacao.observacoes && (
              <div className="mt-3">
                <small className="text-600">Observações</small>
                <p>{consignacao.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default ConsignacaoModal;
