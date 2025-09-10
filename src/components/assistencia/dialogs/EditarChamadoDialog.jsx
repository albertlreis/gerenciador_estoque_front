import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import apiEstoque from '../../../services/apiEstoque';
import { PRIORIDADES, LOCAIS_REPARO, CUSTO_RESP } from '../../../utils/assistencia';
import PedidoSearchSelect from '../selects/PedidoSearchSelect';

/**
 * Dialog de edição de Chamado de Assistência.
 *
 * @param {{ chamadoId: number|string, onHide?: () => void, onSaved?: () => void }} props
 * @returns {JSX.Element}
 */
export default function EditarChamadoDialog({ chamadoId, onHide, onSaved }) {
  const toast = useRef(null);

  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [pedidoSel, setPedidoSel] = useState(null);
  const [pedidoResumo, setPedidoResumo] = useState(null);

  const [form, setForm] = useState({
    origem_tipo: 'pedido',
    origem_id: '',
    pedido_id: null,
    assistencia_id: null,
    prioridade: 'media',
    observacoes: '',
    local_reparo: null,
    custo_responsavel: null,
  });

  useEffect(() => {
    async function fetchChamado() {
      if (!chamadoId) return;
      try {
        setCarregando(true);
        const resp = await apiEstoque.get(`/assistencias/chamados/${chamadoId}`);
        const data = resp.data?.data || resp.data;

        const assistenciaId = data.assistencia_id != null
          ? Number(data.assistencia_id)
          : (data.assistencia?.id != null ? Number(data.assistencia.id) : null);

        const pedido = data.pedido ?? null;
        const pedidoId = (pedido?.id ?? data.pedido_id ?? data.origem_id) ?? null;
        const pedidoLabel = pedido
          ? `#${pedido.numero ?? pedido.id} - ${pedido.cliente ?? 'Cliente não informado'}`
          : (pedidoId ? `#${pedidoId}` : '');

        setPedidoSel(pedidoId ? { id: Number(pedidoId), label: pedidoLabel, raw: pedido } : null);
        setPedidoResumo(pedido || null);

        setForm({
          origem_tipo: data.origem_tipo ?? 'pedido',
          origem_id: pedidoId ?? '',
          pedido_id: pedidoId ? Number(pedidoId) : null,
          assistencia_id: assistenciaId,
          prioridade: data.prioridade ?? 'media',
          observacoes: data.observacoes ?? '',
          local_reparo: data.local_reparo ?? null,
          custo_responsavel: data.custo_responsavel ?? null,
        });
      } catch (e) {
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar chamado', life: 3000 });
      } finally {
        setCarregando(false);
      }
    }

    fetchChamado();
  }, [chamadoId]);

  /**
   * Ao trocar o pedido, atualiza resumo e define origem/pedido no form.
   * @param {{id:number,label:string,raw?:any}|null} val
   */
  async function handlePedidoChange(val) {
    setPedidoSel(val);
    if (val?.id) {
      const { data } = await apiEstoque.get(`/assistencias/pedidos/${val.id}/produtos`);
      setPedidoResumo(data.pedido || null);
      setForm(f => ({
        ...f,
        origem_tipo: 'pedido',
        origem_id: val.id,
        pedido_id: Number(val.id),
      }));
    } else {
      setPedidoResumo(null);
      setForm(f => ({ ...f, origem_id: '', pedido_id: null }));
    }
  }

  /** Salva a edição. */
  async function handleSave() {
    setLoading(true);
    try {
      const payload = {
        origem_tipo: form.origem_tipo || 'pedido',
        origem_id: form.origem_id ? Number(form.origem_id) : (pedidoSel?.id ?? null),
        pedido_id: form.pedido_id ?? (pedidoSel?.id ?? null),
        assistencia_id: form.assistencia_id ?? null,
        prioridade: form.prioridade || null,
        observacoes: form.observacoes || null,
        local_reparo: form.local_reparo || null,
        custo_responsavel: form.custo_responsavel || null,
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

        {/* Pedido */}
        <div className="col-12 md:col-8">
          <label className="block mb-2">Pedido</label>
          <PedidoSearchSelect value={pedidoSel} onChange={handlePedidoChange} disabled={carregando} />
          {pedidoResumo && (
            <div className="mt-2 text-600 text-sm">
              <div>Cliente: <b>{pedidoResumo.cliente ?? '—'}</b></div>
              <div>Número: <b>#{pedidoResumo.numero ?? pedidoResumo.id}</b> · Data: {pedidoResumo.data ? new Date(pedidoResumo.data).toLocaleDateString() : '—'}</div>
              {Array.isArray(pedidoResumo?.pedidos_fabrica) && pedidoResumo.pedidos_fabrica.length > 0 && (
                <div className="mt-1">
                  {pedidoResumo.pedidos_fabrica.map((pf) => (
                    <div key={pf.id}>
                      Pedido Fábrica: <b>#{pf.id}</b> · Status: <b>{pf.status}</b> ·
                      {' '}Previsto: {pf.data_previsao_entrega ? new Date(pf.data_previsao_entrega).toLocaleDateString() : '—'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-12 md:col-4">
          <label className="block mb-2">Prioridade</label>
          <Dropdown
            value={form.prioridade}
            options={PRIORIDADES}
            onChange={(e) => setForm((f) => ({ ...f, prioridade: e.value }))}
            disabled={carregando}
            placeholder="Selecione"
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Local do Reparo</label>
          <Dropdown
            value={form.local_reparo}
            options={LOCAIS_REPARO}
            onChange={(e) => setForm((f) => ({ ...f, local_reparo: e.value }))}
            disabled={carregando}
            placeholder="Selecione"
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Custo do Reparo por</label>
          <Dropdown
            value={form.custo_responsavel}
            options={CUSTO_RESP}
            onChange={(e) => setForm((f) => ({ ...f, custo_responsavel: e.value }))}
            disabled={carregando}
            placeholder="Selecione"
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
