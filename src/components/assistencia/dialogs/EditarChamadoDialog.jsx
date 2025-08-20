// src/components/assistencia/dialogs/EditarChamadoDialog.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import apiEstoque from '../../../services/apiEstoque';
import { PRIORIDADES } from '../../../utils/assistencia';
import ClienteSelect from '../selects/ClienteSelect';
import AssistenciaSelect from '../selects/AssistenciaSelect';

export default function EditarChamadoDialog({ chamadoId, onHide, onSaved }) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [form, setForm] = useState({
    origem_tipo: 'pedido',
    origem_id: '',
    cliente_id: null,
    fornecedor_id: '',
    assistencia_id: null,
    prioridade: 'media',
    canal_abertura: 'loja',
    observacoes: '',
  });

  useEffect(() => {
    async function fetchChamado() {
      try {
        setCarregando(true);
        const resp = await apiEstoque.get(`/assistencias/chamados/${chamadoId}`);
        const data = resp.data?.data || resp.data;

        const clienteId = data.cliente_id != null ? Number(data.cliente_id) : null;
        // usa assistencia_id do resource; se não vier, usa o id do objeto carregado
        const assistenciaId = data.assistencia_id != null
          ? Number(data.assistencia_id)
          : (data.assistencia?.id != null ? Number(data.assistencia.id) : null);

        setForm({
          origem_tipo: data.origem_tipo ?? 'pedido',
          origem_id: data.origem_id ?? '',
          cliente_id: clienteId,
          fornecedor_id: data.fornecedor_id ?? '',
          assistencia_id: assistenciaId,
          prioridade: data.prioridade ?? 'media',
          canal_abertura: data.canal_abertura ?? 'loja',
          observacoes: data.observacoes ?? '',
        });
      } catch (e) {
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar chamado', life: 3000 });
      } finally {
        setCarregando(false);
      }
    }
    if (chamadoId) fetchChamado();
  }, [chamadoId]);

  async function handleSave() {
    setLoading(true);
    try {
      const payload = {
        origem_tipo: form.origem_tipo || null,
        origem_id: form.origem_id ? Number(form.origem_id) : null,
        cliente_id: form.cliente_id ?? null,
        fornecedor_id: form.fornecedor_id ? Number(form.fornecedor_id) : null,
        assistencia_id: form.assistencia_id ?? null,
        prioridade: form.prioridade || null,
        canal_abertura: form.canal_abertura || null,
        observacoes: form.observacoes || null,
      };

      await apiEstoque.put(`/assistencias/chamados/${chamadoId}`, payload);
      toast.current?.show({ severity: 'success', summary: 'Atualizado', detail: 'Chamado atualizado com sucesso', life: 2500 });
      onSaved?.();
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar alterações', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
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
            disabled={carregando}
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-2">Origem ID</label>
          <InputText
            value={form.origem_id}
            onChange={(e) => setForm((f) => ({ ...f, origem_id: e.target.value }))}
            placeholder="Opcional"
            disabled={carregando}
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-2">Cliente</label>
          {/* key força o remount quando o ID chega do GET */}
          <ClienteSelect
            key={`cli-${form.cliente_id ?? 'null'}`}
            value={form.cliente_id}                // ID
            onChange={(id) => setForm((f) => ({ ...f, cliente_id: id }))}
            disabled={carregando}
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Assistência</label>
          <AssistenciaSelect
            key={`ass-${form.assistencia_id ?? 'null'}`}
            value={form.assistencia_id}            // ID
            onChange={(id) => setForm((f) => ({ ...f, assistencia_id: id }))}
            disabled={carregando}
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Prioridade</label>
          <Dropdown
            value={form.prioridade}
            options={PRIORIDADES}
            onChange={(e) => setForm((f) => ({ ...f, prioridade: e.value }))}
            disabled={carregando}
          />
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
            disabled={carregando}
          />
        </div>

        <div className="col-12">
          <label className="block mb-2">Observações</label>
          <InputTextarea
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
            disabled={carregando}
          />
        </div>

        <div className="col-12 flex justify-end gap-2 mt-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Salvar" icon="pi pi-check" loading={loading} onClick={handleSave} disabled={carregando} />
        </div>
      </div>
    </div>
  );
}
