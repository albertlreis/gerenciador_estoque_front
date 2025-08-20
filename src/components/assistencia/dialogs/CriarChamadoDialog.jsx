import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import apiEstoque from '../../../services/apiEstoque';
import { PRIORIDADES } from '../../../utils/assistencia';
import ClienteSelect from '../selects/ClienteSelect';
import AssistenciaSelect from '../selects/AssistenciaSelect';

export default function CriarChamadoDialog({ visible, onHide, onCreated }) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    origem_tipo: 'pedido',
    origem_id: '',
    cliente: null,
    fornecedor_id: '',
    assistencia: null,
    prioridade: 'media',
    canal_abertura: 'loja',
    observacoes: '',
  });

  useEffect(() => {
    if (!visible) {
      setForm({
        origem_tipo: 'pedido',
        origem_id: '',
        cliente: null,
        fornecedor_id: '',
        assistencia: null,
        prioridade: 'media',
        canal_abertura: 'loja',
        observacoes: '',
      });
    }
  }, [visible]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        origem_tipo: form.origem_tipo,
        origem_id: form.origem_id ? Number(form.origem_id) : null,
        cliente_id: form.cliente?.id ?? null,
        fornecedor_id: form.fornecedor_id ? Number(form.fornecedor_id) : null,
        assistencia_id: form.assistencia?.id ?? null,
        prioridade: form.prioridade,
        canal_abertura: form.canal_abertura,
        observacoes: form.observacoes || null,
      };
      const response = await apiEstoque.post('/assistencias/chamados', payload);
      const created = response.data?.data || response.data;
      onCreated?.(created);
      onHide();
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar chamado', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header="Novo Chamado de Assistência" visible={visible} style={{ width: 780 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid p-fluid formgrid gap-3">
        <div className="col-12 md:col-4">
          <label className="block mb-2">Origem</label>
          <Dropdown
            value={form.origem_tipo}
            options={[
              { label: 'Pedido', value: 'pedido' },
              { label: 'Consignação', value: 'consignacao' },
              { label: 'Estoque', value: 'estoque' },
            ]}
            onChange={(e) => setForm((f) => ({ ...f, origem_tipo: e.value }))}
            placeholder="Selecione"
          />
        </div>
        <div className="col-12 md:col-4">
          <label className="block mb-2">Origem ID</label>
          <InputText value={form.origem_id} onChange={(e) => setForm((f) => ({ ...f, origem_id: e.target.value }))} placeholder="Opcional" />
        </div>
        <div className="col-12 md:col-4">
          <label className="block mb-2">Cliente</label>
          <ClienteSelect value={form.cliente} onChange={(val) => setForm((f) => ({ ...f, cliente: val }))} />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Assistência</label>
          <AssistenciaSelect value={form.assistencia} onChange={(val) => setForm((f) => ({ ...f, assistencia: val }))} />
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Prioridade</label>
          <Dropdown value={form.prioridade} options={PRIORIDADES} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.value }))} />
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-2">Canal</label>
          <Dropdown
            value={form.canal_abertura}
            options={[
              { label: 'Loja', value: 'loja' },
              { label: 'Site', value: 'site' },
              { label: 'Telefone', value: 'telefone' },
              { label: 'WhatsApp', value: 'whatsapp' },
            ]}
            onChange={(e) => setForm((f) => ({ ...f, canal_abertura: e.value }))}
          />
        </div>

        <div className="col-12">
          <label className="block mb-2">Observações</label>
          <InputTextarea rows={3} value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
        </div>
        <div className="col-12 flex justify-end gap-2 mt-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Criar" icon="pi pi-check" loading={loading} onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
}
