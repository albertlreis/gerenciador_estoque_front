import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import apiEstoque from '../../../services/apiEstoque';
import DepositoSelect from '../selects/DepositoSelect';
import { toYmd } from '../../../utils/assistencia';

export default function DialogRetorno({ item, visible, onHide, onSuccess }) {
  const toast = useRef(null);
  const [depositoRet, setDepositoRet] = useState(null);
  const [form, setForm] = useState({ rastreio_retorno: '', data_retorno: null });
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        deposito_retorno_id: depositoRet?.id,
        rastreio_retorno: form.rastreio_retorno || null,
        data_retorno: toYmd(form.data_retorno),
      };
      const response = await apiEstoque.post(`/assistencias/itens/${item.id}/retorno`, payload);
      onSuccess?.(response.data?.data || response.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar retorno', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header={`Registrar Retorno – Item #${item?.id}`} visible={visible} style={{ width: 640 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid formgrid p-fluid gap-3">
        <div className="col-12">
          <label className="block mb-2">Depósito de Retorno</label>
          <DepositoSelect value={depositoRet} onChange={setDepositoRet} />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Rastreio (retorno)</label>
          <InputText value={form.rastreio_retorno} onChange={(e) => setForm((f) => ({ ...f, rastreio_retorno: e.target.value }))} />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Data de Retorno</label>
          <Calendar value={form.data_retorno} onChange={(e) => setForm((f) => ({ ...f, data_retorno: e.value }))} showIcon dateFormat="dd/mm/yy" />
        </div>
        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Salvar" icon="pi pi-check" loading={loading} onClick={submit} />
        </div>
      </div>
    </Dialog>
  );
}
