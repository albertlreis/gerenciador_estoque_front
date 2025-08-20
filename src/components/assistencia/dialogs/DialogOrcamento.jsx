import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiEstoque from '../../../services/apiEstoque';

export default function DialogOrcamento({ item, visible, onHide, onSuccess }) {
  const toast = useRef(null);
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (visible) setValor(item?.valor_orcado ?? ''); }, [visible, item]);

  async function submit() {
    setLoading(true);
    try {
      const response = await apiEstoque.post(`/assistencias/itens/${item.id}/orcamento`, {
        valor_orcado: Number(String(valor).replace(',', '.')),
      });
      onSuccess?.(response.data?.data || response.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar orçamento', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header={`Orçamento – Item #${item?.id}`} visible={visible} style={{ width: 520 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid p-fluid formgrid gap-3">
        <div className="col-12">
          <label className="block mb-2">Valor (R$)</label>
          <InputText value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
        </div>
        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Registrar" icon="pi pi-check" loading={loading} onClick={submit} />
        </div>
      </div>
    </Dialog>
  );
}
