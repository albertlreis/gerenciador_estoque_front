import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiEstoque from '../../../services/apiEstoque';

/**
 * Conclusão de reparo local (depósito/cliente), sem movimentação de estoque.
 * Envia data e observação opcionais.
 */
export default function DialogConcluirReparo({ item, visible, onHide, onSuccess }) {
  const toast = useRef(null);
  const [dataConclusao, setDataConclusao] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        data_conclusao: dataConclusao ? dataConclusao.toISOString().slice(0, 10) : null,
        observacao: observacao || null,
      };
      const { data } = await apiEstoque.post(`/assistencias/itens/${item.id}/concluir-reparo`, payload);
      onSuccess?.(data?.data || data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao concluir reparo', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header={`Concluir Reparo – Item #${item?.id}`} visible={visible} style={{ width: 520 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid p-fluid formgrid gap-3">
        <div className="col-12 md:col-6">
          <label className="block mb-2">Data de Conclusão</label>
          <Calendar value={dataConclusao} onChange={(e) => setDataConclusao(e.value)} dateFormat="dd/mm/yy" showIcon />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Observação</label>
          <InputText value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Concluir" icon="pi pi-check" loading={loading} onClick={submit} />
        </div>
      </div>
    </Dialog>
  );
}
