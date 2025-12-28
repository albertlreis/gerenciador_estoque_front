import React, { useState, useEffect, useRef } from 'react';
import { Timeline } from 'primereact/timeline';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { OPCOES_STATUS } from '../constants/statusPedido';
import api from '../services/apiEstoque';
import {formatarDataIsoParaBR} from "../utils/formatarData";

const PedidoStatusDialog = ({ visible, onHide, pedido, onSalvo, toast }) => {
  const [status, setStatus] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [statusParaExcluir, setStatusParaExcluir] = useState(null);
  const [opcoesStatus, setOpcoesStatus] = useState([]);
  const confirmDialogRef = useRef(null);

  const carregarHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const { data } = await api.get(`/pedidos/${pedido.id}/status/historico`);
      setHistorico(data);
      return data;
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar histórico',
        detail: err.response?.data?.message || err.message
      });
      return [];
    } finally {
      setLoadingHistorico(false);
    }
  };

  const carregarFluxoStatus = async (historicoUsado) => {
    try {
      const { data } = await api.get(`/pedidos/${pedido.id}/status/fluxo`);
      const usados = historicoUsado.map(h => h.status);
      const filtrados = OPCOES_STATUS.filter((opt) => data.includes(opt.value) && !usados.includes(opt.value));
      setOpcoesStatus(filtrados);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao carregar fluxo de status',
        detail: err.response?.data?.message || err.message
      });
    }
  };

  useEffect(() => {
    if (visible && pedido?.id) {
      setStatus(null);
      setObservacoes('');
      setLoading(false);
      setHistorico([]);
      setOpcoesStatus([]);

      const carregarDados = async () => {
        const historicoCarregado = await carregarHistorico();
        await carregarFluxoStatus(historicoCarregado);
      };

      carregarDados();
    }
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

  const confirmarExclusaoStatus = (idStatus) => {
    setStatusParaExcluir(idStatus);
    confirmDialogRef.current.show();
  };

  const excluirStatus = async () => {
    if (!statusParaExcluir) return;
    try {
      await api.delete(`/pedidos/${pedido.id}/status-historicos/${statusParaExcluir}`);
      toast.current.show({ severity: 'success', summary: 'Status removido com sucesso' });
      const atualizados = historico.filter((h) => h.id !== statusParaExcluir);
      setHistorico(atualizados);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro ao remover status',
        detail: err.response?.data?.message || err.message
      });
    } finally {
      setStatusParaExcluir(null);
    }
  };

  return (
    <>
      <ConfirmDialog
        ref={confirmDialogRef}
        header="Confirmar remoção"
        message="Deseja realmente remover este status?"
        icon="pi pi-exclamation-triangle"
        accept={excluirStatus}
        reject={() => setStatusParaExcluir(null)}
      />

      <Dialog header="Atualizar Status" visible={visible} onHide={onHide} style={{ width: '35vw' }} modal>
        <div className="flex flex-column gap-3">
          <Dropdown
            value={status}
            options={opcoesStatus}
            onChange={(e) => setStatus(e.value)}
            placeholder="Selecione o novo status"
            className="w-full"
            disabled={loading || loadingHistorico || opcoesStatus.length === 0}
          />
          <InputTextarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            placeholder="Observações (opcional)"
            className="w-full"
            disabled={loading || loadingHistorico}
          />

          {historico.length > 0 && opcoesStatus.length > 0 && (
            <div className="text-sm text-gray-700">
              Próximo status sugerido:{' '}
              <strong>
                {opcoesStatus[0]?.label || 'Nenhum'}
              </strong>
            </div>
          )}

          <Button
            label="Salvar"
            icon="pi pi-save"
            loading={loading}
            onClick={salvar}
            disabled={loading || loadingHistorico || !status}
          />
        </div>

        <div className="mt-4">
          {loadingHistorico ? (
            <div className="flex justify-content-center my-5">
              <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
            </div>
          ) : (
            <Timeline
              value={historico}
              opposite={(item) => formatarDataIsoParaBR(item.data_status)}
              content={(item) => (
                <div className={`mb-3 p-3 border-round ${item.ehPrevisao ? 'status-previsto' : ''}`}>
                  <div className="font-semibold flex justify-between align-items-center">
                    <span>
                      {item.ehPrevisao && <i className="pi pi-clock mr-1 text-gray-500" title="Previsão automática"/>}
                      {item.label}
                    </span>
                    {!item.ehPrevisao && item.ultimoReal && (
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-sm ml-3"
                        onClick={() => confirmarExclusaoStatus(item.id)}
                        tooltip="Remover status"
                        disabled={loading}
                      />
                    )}
                  </div>

                  <p className={`text-sm ${item.ehPrevisao ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                    {item.observacoes || (item.ehPrevisao ? 'Status previsto automaticamente.' : '')}
                  </p>

                  {item.usuario && (
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="pi pi-user mr-1"/> Por: {item.usuario}
                    </p>
                  )}
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
                    boxShadow: item.ultimoReal
                      ? '0 0 0 3px rgba(40, 167, 69, 0.5)'
                      : item.ehPrevisao
                        ? '0 0 0 2px rgba(100, 100, 100, 0.4)' // borda para previsão
                        : 'none',
                    opacity: item.ehPrevisao ? 0.4 : 1,
                    cursor: item.ehPrevisao ? 'help' : 'default'
                  }}
                  title={item.ehPrevisao ? 'Previsão automática com base nos prazos' : ''}
                >
                  <i className={item.icone} style={{ color: 'white' }}></i>
                </span>
              )}
              className="mt-4"
            />
          )}
        </div>
      </Dialog>
    </>
  );
};

export default PedidoStatusDialog;
