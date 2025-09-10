import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiEstoque from '../../../services/apiEstoque';

export default function DialogSaidaFabrica({ item, visible, onHide, onSuccess }) {
  const toast = useRef(null);
  const [rastreio, setRastreio] = useState('');
  const [dataEnvio, setDataEnvio] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        rastreio_retorno: rastreio || null,
        data_envio_retorno: dataEnvio ? dataEnvio.toISOString().slice(0,10) : null,
      };
      const { data } = await apiEstoque.post(`/assistencias/itens/${item.id}/saida-fabrica`, payload);
      onSuccess?.(data?.data || data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar saída da fábrica', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header="Saída da Fábrica (em trânsito)" visible={visible} style={{ width: 520 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid formgrid p-fluid gap-3">
        <div className="col-12">
          <label className="block mb-2">Rastreio</label>
          <InputText value={rastreio} onChange={(e) => setRastreio(e.target.value)} placeholder="Código de rastreio" />
        </div>
        <div className="col-12">
          <label className="block mb-2">Data de Envio</label>
          <Calendar value={dataEnvio} onChange={(e) => setDataEnvio(e.value)} showIcon dateFormat="dd/mm/yy" />
        </div>
        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Salvar" icon="pi pi-check" loading={loading} onClick={submit} />
        </div>
      </div>
    </Dialog>
  );
}
