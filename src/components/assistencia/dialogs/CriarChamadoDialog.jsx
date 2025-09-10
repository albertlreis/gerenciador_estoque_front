import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import apiEstoque from '../../../services/apiEstoque';
import { PRIORIDADES, LOCAIS_REPARO, CUSTO_RESP } from '../../../utils/assistencia';
import PedidoSearchSelect from '../selects/PedidoSearchSelect';

/**
 * Dialog de criação de Chamado de Assistência.
 *
 * @param {{ visible: boolean, onHide: () => void, onCreated?: (data:any)=>void }} props
 */
export default function CriarChamadoDialog({ visible, onHide, onCreated }) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);

  // { id, label, raw }
  const [pedidoSel, setPedidoSel] = useState(null);
  const [pedidoResumo, setPedidoResumo] = useState(null);

  const [form, setForm] = useState({
    origem_tipo: 'pedido',
    origem_id: '',
    pedido_id: null,
    cliente: null,
    fornecedor_id: '',
    assistencia: null,
    prioridade: 'media',
    observacoes: '',
    local_reparo: null,
    custo_responsavel: null,
  });

  useEffect(() => {
    if (!visible) {
      setForm({
        origem_tipo: 'pedido',
        origem_id: '',
        pedido_id: null,
        cliente: null,
        fornecedor_id: '',
        assistencia: null,
        prioridade: 'media',
        observacoes: '',
        local_reparo: null,
        custo_responsavel: null,
      });
      setPedidoSel(null);
      setPedidoResumo(null);
    }
  }, [visible]);

  /**
   * Ao escolher o pedido, carregamos o resumo e setamos origem/pedido.
   * @param {{id:number,label:string,raw?:any}|null} val
   */
  async function handlePedidoChange(val) {
    setPedidoSel(val);
    if (val?.id) {
      const { data } = await apiEstoque.get(`/assistencias/pedidos/${val.id}/produtos`);
      setPedidoResumo(data.pedido);
      setForm(f => ({
        ...f,
        origem_tipo: 'pedido',
        origem_id: val.id,
        pedido_id: Number(val.id),
        // cliente segue apenas para exibição
        cliente: data.pedido?.cliente ? { id: null, nome: data.pedido.cliente } : f.cliente
      }));
    } else {
      setPedidoResumo(null);
      setForm(f => ({ ...f, origem_id: '', pedido_id: null }));
    }
  }

  /** Envia criação. */
  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        origem_tipo: form.origem_tipo,
        origem_id: form.origem_id ? Number(form.origem_id) : (pedidoSel?.id ?? null),
        pedido_id: form.pedido_id ?? (pedidoSel?.id ?? null),
        cliente_id: form.cliente?.id ?? null,
        fornecedor_id: form.fornecedor_id ? Number(form.fornecedor_id) : null,
        assistencia_id: form.assistencia?.id ?? null,
        prioridade: form.prioridade,
        observacoes: form.observacoes || null,
        local_reparo: form.local_reparo || null,
        custo_responsavel: form.custo_responsavel || null,
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
    <Dialog header="Novo Chamado de Assistência" visible={visible} style={{ width: 820 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid p-fluid formgrid gap-3">

        <div className="col-12 md:col-8">
          <label className="block mb-2">Pedido</label>
          <PedidoSearchSelect value={pedidoSel} onChange={handlePedidoChange} />
          {pedidoResumo && (
            <div className="mt-2 text-600 text-sm">
              <div>Cliente: <b>{pedidoResumo.cliente ?? '—'}</b></div>
              <div>Número: <b>#{pedidoResumo.numero}</b> · Data: {new Date(pedidoResumo.data).toLocaleDateString()}</div>
              {pedidoResumo?.pedidos_fabrica?.length > 0 && (
                <div className="mt-1">
                  {pedidoResumo.pedidos_fabrica.map(pf => (
                    <div key={pf.id}>
                      Pedido Fábrica: <b>#{pf.id}</b> · Status: <b>{pf.status}</b> ·
                      Previsto: {pf.data_previsao_entrega ? new Date(pf.data_previsao_entrega).toLocaleDateString() : '—'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-2">Prioridade</label>
          <Dropdown value={form.prioridade} options={PRIORIDADES} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.value }))} />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Local do Reparo</label>
          <Dropdown value={form.local_reparo} options={LOCAIS_REPARO} onChange={(e) => setForm(f => ({ ...f, local_reparo: e.value }))} placeholder="Selecione"/>
        </div>
        <div className="col-12 md:col-6">
          <label className="block mb-2">Custo do Reparo por</label>
          <Dropdown value={form.custo_responsavel} options={CUSTO_RESP} onChange={(e) => setForm(f => ({ ...f, custo_responsavel: e.value }))} placeholder="Selecione"/>
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
