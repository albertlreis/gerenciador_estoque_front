import React, { useEffect, useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { STATUS_CONSIGNACAO } from '../../constants/statusConsignacao';
import api from '../../services/apiEstoque';

const statusTag = (status) => {
  const info = STATUS_CONSIGNACAO[status] || { label: status, color: 'secondary' };
  return <Tag value={info.label} severity={info.color} />;
};

const ConsignacaoModal = ({ id, visible, onHide, onAtualizar }) => {
  const [consignacoes, setConsignacoes] = useState([]);
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toastRef = useRef(null);

  const [consignacaoParaDevolver, setConsignacaoParaDevolver] = useState(null);
  const [qtdDevolver, setQtdDevolver] = useState(null);
  const [obsDevolver, setObsDevolver] = useState('');
  const [depositos, setDepositos] = useState([]);
  const [depositoId, setDepositoId] = useState(null);

  useEffect(() => {
    if (visible && id) carregar();
  }, [id, visible]);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/consignacoes/pedidos/${id}`);
      setConsignacoes(data.consignacoes || []);
      setPedido(data.pedido || null);
    } finally {
      setLoading(false);
    }
  };

  const registrarDevolucaoParcial = async () => {
    if (!qtdDevolver || qtdDevolver <= 0 || !consignacaoParaDevolver || !depositoId) return;
    setSaving(true);
    try {
      await api.post(`/consignacoes/${consignacaoParaDevolver.id}/devolucoes`, {
        quantidade: qtdDevolver,
        observacoes: obsDevolver,
        deposito_id: depositoId,
      });
      toastRef.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Devolução registrada com sucesso' });
      setConsignacaoParaDevolver(null);
      setQtdDevolver(null);
      setObsDevolver('');
      setDepositoId(null);
      await carregar();
      onAtualizar?.();
    } catch (e) {
      toastRef.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar devolução' });
    } finally {
      setSaving(false);
    }
  };

  const abrirModalDevolucao = (consignacao) => {
    setConsignacaoParaDevolver(consignacao);
    setQtdDevolver(null);
    setObsDevolver('');
    setDepositoId(null);
    api.get('/depositos')
      .then(({ data }) => {
        setDepositos(data.map((d) => ({ label: d.nome, value: d.id })));
      })
      .catch(() => {
        toastRef.current.show({ severity: 'warn', summary: 'Erro', detail: 'Erro ao carregar depósitos' });
      });
  };

  const confirmarCompra = async (consignacao) => {
    setSaving(true);
    try {
      await api.patch(`/consignacoes/${consignacao.id}/status`, { status: 'comprado' });
      toastRef.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Compra confirmada com sucesso.' });
      await carregar();
      onAtualizar?.();
    } catch (err) {
      const msg = err?.response?.data?.erro || 'Não foi possível confirmar a compra.';
      toastRef.current.show({ severity: 'error', summary: 'Erro', detail: msg });
    } finally {
      setSaving(false);
    }
  };


  return (
    <>
      <Toast ref={toastRef} />
      <ConfirmDialog />

      <Dialog
        header={`Detalhes do Pedido${
          pedido?.numero_externo
            ? ` #${pedido.numero_externo}`
            : pedido?.id
              ? ` #${pedido.id}`
              : ''
        }`}
        visible={visible}
        onHide={onHide}
        style={{ width: '90vw', maxWidth: '900px' }}
        modal
      >
        {loading || !pedido ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <div className="p-fluid">
            <div className="mb-3">
              <small className="text-600">Cliente</small>
              <p className="text-lg font-medium">{pedido.cliente}</p>
            </div>

            {consignacoes.map((c) => (
              <div key={c.id} className="border-top-1 border-300 mt-3 pt-3">
                <div className="text-md font-semibold mb-2">{c.produto_nome}</div>

                {Array.isArray(c.atributos) && c.atributos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {c.atributos.map((attr, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-sm border-round">
                        {attr.nome}: {attr.valor}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid">
                  <div className="col-6"><strong>Quantidade:</strong> {c.quantidade}</div>
                  <div className="col-6"><strong>Status:</strong> {statusTag(c.status)}</div>
                  <div className="col-6"><strong>Envio:</strong> {c.data_envio}</div>
                  <div className="col-6"><strong>Prazo:</strong> {c.prazo_resposta}</div>
                  {c.data_resposta && (
                    <div className="col-12"><strong>Respondido em:</strong> {c.data_resposta}</div>
                  )}
                </div>

                {c.observacoes && (
                  <div className="mt-2"><strong>Observações:</strong> {c.observacoes}</div>
                )}

                {c.devolucoes?.length > 0 && (
                  <div className="mt-3">
                    <small className="text-600 block mb-2">Histórico de Devoluções</small>
                    <div className="overflow-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                        <tr className="text-600 border-bottom-1 border-300">
                          <th className="py-2 text-left">Qtd.</th>
                          <th className="py-2 text-left">Data</th>
                          <th className="py-2 text-left">Observações</th>
                          <th className="py-2 text-left">Responsável</th>
                        </tr>
                        </thead>
                        <tbody>
                        {c.devolucoes.map((d) => (
                          <tr key={d.id} className="border-bottom-1 border-100">
                            <td className="py-2">{d.quantidade}</td>
                            <td className="py-2">{d.data_devolucao}</td>
                            <td className="py-2">{d.observacoes || '—'}</td>
                            <td className="py-2">{d.usuario?.nome || '—'}</td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-content-end gap-2 mt-3">
                  <Button
                    label="Registrar Devolução"
                    icon="pi pi-undo"
                    severity="info"
                    disabled={saving || !['pendente', 'vencido'].includes(c.status)}
                    onClick={() => abrirModalDevolucao(c)}
                  />
                  <Button
                    label="Confirmar Compra"
                    icon="pi pi-check"
                    severity="success"
                    disabled={saving || !['pendente', 'vencido'].includes(c.status)}
                    onClick={() => confirmarCompra(c)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>

      <Dialog
        header="Registrar Devolução"
        visible={!!consignacaoParaDevolver}
        style={{ width: '400px' }}
        modal
        onHide={() => {
          setConsignacaoParaDevolver(null);
          setQtdDevolver(null);
          setObsDevolver('');
          setDepositoId(null);
        }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => {
                setConsignacaoParaDevolver(null);
                setQtdDevolver(null);
                setObsDevolver('');
                setDepositoId(null);
              }}
            />
            <Button
              label="Confirmar"
              icon="pi pi-check"
              disabled={saving || !qtdDevolver || qtdDevolver <= 0 || !depositoId}
              onClick={registrarDevolucaoParcial}
            />
          </div>
        }
      >
        {consignacaoParaDevolver && (
          <div className="p-fluid">
            <div className="mb-3">
              <label htmlFor="qtd-devolver" className="block text-600 mb-1">
                Quantidade a devolver
              </label>
              <InputNumber
                id="qtd-devolver"
                min={1}
                max={consignacaoParaDevolver.quantidade_disponivel || consignacaoParaDevolver.quantidade}
                value={qtdDevolver}
                onValueChange={(e) => setQtdDevolver(e.value)}
                inputClassName="w-full py-2"
                className="w-full"
                placeholder={`Máximo: ${consignacaoParaDevolver.quantidade_disponivel || consignacaoParaDevolver.quantidade}`}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="deposito" className="block text-600 mb-1">
                Depósito de destino
              </label>
              <Dropdown
                id="deposito"
                options={depositos}
                value={depositoId}
                onChange={(e) => setDepositoId(e.value)}
                className="w-full"
                placeholder="Selecione"
                filter
                showClear
              />
            </div>

            <div>
              <label htmlFor="obs-devolver" className="block text-600 mb-1">
                Observações (opcional)
              </label>
              <InputTextarea
                id="obs-devolver"
                value={obsDevolver}
                onChange={(e) => setObsDevolver(e.target.value)}
                autoResize
                rows={3}
                className="w-full p-inputtext"
                placeholder="Informe detalhes adicionais, se necessário"
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default ConsignacaoModal;
