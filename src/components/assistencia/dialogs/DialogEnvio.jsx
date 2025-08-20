import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import apiEstoque from '../../../services/apiEstoque';
import AssistenciaSelect from '../selects/AssistenciaSelect';
import DepositoSelect from '../selects/DepositoSelect';
import { toYmd } from '../../../utils/assistencia';

export default function DialogEnvio({ item, visible, onHide, onSuccess }) {
  const toast = useRef(null);
  const [assistencia, setAssistencia] = useState(null);
  const [depositoAssist, setDepositoAssist] = useState(null);
  const [form, setForm] = useState({ rastreio_envio: '', data_envio: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setAssistencia(item.assistencia_id ? { id: item.assistencia_id, label: String(item.assistencia_id) } : null);
  }, [visible, item]);

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        assistencia_id: assistencia?.id,
        deposito_assistencia_id: depositoAssist?.id,
        rastreio_envio: form.rastreio_envio || null,
        data_envio: toYmd(form.data_envio),
      };
      const response = await apiEstoque.post(`/assistencias/itens/${item.id}/enviar`, payload);
      onSuccess?.(response.data?.data || response.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao enviar item', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header={`Enviar Item #${item?.id}`} visible={visible} style={{ width: 640 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid formgrid p-fluid gap-3">
        <div className="col-12">
          <label className="block mb-2">Assistência</label>
          <AssistenciaSelect value={assistencia} onChange={setAssistencia} />
        </div>
        <div className="col-12">
          <label className="block mb-2">Depósito Assistência</label>
          <DepositoSelect value={depositoAssist} onChange={setDepositoAssist} placeholder="Buscar depósito..." />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Rastreio (envio)</label>
          <InputText value={form.rastreio_envio} onChange={(e) => setForm((f) => ({ ...f, rastreio_envio: e.target.value }))} />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Data de Envio</label>
          <Calendar value={form.data_envio} onChange={(e) => setForm((f) => ({ ...f, data_envio: e.value }))} dateFormat="dd/mm/yy" showIcon />
        </div>
        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Enviar" icon="pi pi-check" loading={loading} onClick={submit} />
        </div>
      </div>
    </Dialog>
  );
}
