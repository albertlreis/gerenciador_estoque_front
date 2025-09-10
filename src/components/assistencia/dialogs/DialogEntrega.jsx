import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import DepositoSelect from '../selects/DepositoSelect';
import apiEstoque from '../../../services/apiEstoque';

/**
 * Dialog de entrega ao cliente.
 *
 * Requer: depósito de saída. Data e observação são opcionais.
 * Movimenta: depósito -> cliente (via service: registrarSaidaEntregaCliente)
 */
export default function DialogEntrega({ item, visible, onHide, onSuccess }) {
  const toast = useRef(null);
  const [depositoSaida, setDepositoSaida] = useState(null);
  const [dataEntrega, setDataEntrega] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  function toYmd(d) {
    if (!d) return null;
    try { return new Date(d).toISOString().slice(0, 10); } catch { return null; }
  }

  function extractApiError(err) {
    return err?.response?.data?.message || err?.message || 'Falha ao registrar entrega';
  }

  async function submit() {
    if (!depositoSaida?.id) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Selecione o depósito de saída.', life: 2500 });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        deposito_saida_id: depositoSaida.id,
        data_entrega: toYmd(dataEntrega),
        observacao: observacao || null,
      };
      const { data } = await apiEstoque.post(`/assistencias/itens/${item.id}/entregar`, payload);
      onSuccess?.(data?.data || data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: extractApiError(e), life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header="Entregar ao Cliente" visible={visible} style={{ width: 640 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid formgrid p-fluid gap-3">
        <div className="col-12">
          <label className="block mb-2">Depósito de Saída</label>
          <DepositoSelect value={depositoSaida} onChange={setDepositoSaida} />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Data da Entrega</label>
          <Calendar value={dataEntrega} onChange={(e) => setDataEntrega(e.value)} showIcon dateFormat="dd/mm/yy" />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Observação</label>
          <InputText value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Entregar" icon="pi pi-check" onClick={submit} loading={loading} />
        </div>
      </div>
    </Dialog>
  );
}
