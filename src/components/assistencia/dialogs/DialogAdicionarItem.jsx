import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';

import ProdutoSelect from '../selects/ProdutoSelect';
import VariacaoSelect from '../selects/VariacaoSelect';
import DefeitoSelect from '../selects/DefeitoSelect';
import DepositoSelect from '../selects/DepositoSelect';
import PedidoItemSelect from '../selects/PedidoItemSelect';
import apiEstoque from '../../../services/apiEstoque';

/**
 * Dialog para adicionar item ao chamado.
 * Quando houver pedido vinculado ao chamado, mostra um único select (produto + variação) restrito ao pedido.
 *
 * @param {{
 *  chamadoId: number,
 *  visible: boolean,
 *  onHide: () => void,
 *  onAdded?: (data: any) => void
 * }} props
 */
export default function DialogAdicionarItem({ chamadoId, visible, onHide, onAdded }) {
  const toast = useRef(null);
  const [pedidoResumo, setPedidoResumo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para fallback (sem pedido): produto + variação separados
  const [produto, setProduto] = useState(null);
  const [variacao, setVariacao] = useState(null);

  // Estado para fluxo com pedido: um único select que retorna {produto_id, variacao_id, label}
  const [pedidoItem, setPedidoItem] = useState(null);

  const [defeito, setDefeito] = useState(null);
  const [depositoOrigem, setDepositoOrigem] = useState(null);

  const [form, setForm] = useState({
    numero_serie: '',
    lote: '',
    nota_numero: '',
    observacoes: '',
    prazo_finalizacao: null,
  });

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const { data } = await apiEstoque.get(`/assistencias/chamados/${chamadoId}`);
          const cham = data?.data || data;
          if (cham?.pedido) setPedidoResumo(cham.pedido);
        } catch {
          setPedidoResumo(null);
        }
      })();
    } else {
      // reset
      setProduto(null);
      setVariacao(null);
      setPedidoItem(null);
      setDefeito(null);
      setDepositoOrigem(null);
      setForm({ numero_serie: '', lote: '', nota_numero: '', observacoes: '', prazo_finalizacao: null });
    }
  }, [visible, chamadoId]);

  async function submit() {
    setLoading(true);
    try {
      // Quando houver pedido vinculado, usamos o item selecionado (único select)
      const hasPedido = !!pedidoResumo?.id;
      const produtoId  = hasPedido ? (pedidoItem?.produto_id ?? null) : (produto?.id ?? null);
      const variacaoId = hasPedido ? (pedidoItem?.variacao_id ?? null) : (variacao?.id ?? null);

      const payload = {
        produto_id: produtoId,
        variacao_id: variacaoId,
        numero_serie: form.numero_serie || null,
        lote: form.lote || null,
        defeito_id: defeito?.id ?? null,
        deposito_origem_id: depositoOrigem?.id ?? null,
        observacoes: form.observacoes || null,
        // Novos:
        nota_numero: form.nota_numero || null,
        prazo_finalizacao: form.prazo_finalizacao ? form.prazo_finalizacao.toISOString().slice(0, 10) : null,
      };

      const response = await apiEstoque.post(`/assistencias/chamados/${chamadoId}/itens`, payload);
      onAdded?.(response.data?.data || response.data);
      onHide();
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar item', life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  const hasPedido = !!pedidoResumo?.id;

  return (
    <Dialog header="Adicionar Item ao Chamado" visible={visible} style={{ width: 860 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid formgrid p-fluid gap-3">

        {hasPedido ? (
          <div className="col-12">
            <label className="block mb-2">Produto</label>
            <PedidoItemSelect
              pedidoId={pedidoResumo.id}
              value={pedidoItem}
              onChange={setPedidoItem}
              placeholder="Selecione o item do pedido (produto + variação)"
            />
            {!!pedidoResumo?.numero && (
              <small className="text-500">
                Pedido #{pedidoResumo.numero} · {pedidoResumo.data ? new Date(pedidoResumo.data).toLocaleDateString() : '—'}
              </small>
            )}
          </div>
        ) : (
          <>
            <div className="col-12 md:col-6">
              <label className="block mb-2">Produto</label>
              <ProdutoSelect
                value={produto}
                onChange={setProduto}
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block mb-2">Variação</label>
              <VariacaoSelect produto={produto} value={variacao} onChange={setVariacao} />
            </div>
          </>
        )}

        <div className="col-12 md:col-6">
          <label className="block mb-2">Defeito (catálogo)</label>
          <DefeitoSelect value={defeito} onChange={setDefeito} />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Depósito de Origem</label>
          <DepositoSelect value={depositoOrigem} onChange={setDepositoOrigem} />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Número da Nota</label>
          <InputText value={form.nota_numero} onChange={(e) => setForm(f => ({ ...f, nota_numero: e.target.value }))} />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2">Prazo de Finalização</label>
          <Calendar value={form.prazo_finalizacao} onChange={(e) => setForm(f => ({ ...f, prazo_finalizacao: e.value }))} dateFormat="dd/mm/yy" showIcon />
        </div>

        <div className="col-12">
          <label className="block mb-2">Observações</label>
          <InputTextarea rows={2} value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
        </div>

        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Adicionar" icon="pi pi-check" loading={loading} onClick={submit} />
        </div>
      </div>
    </Dialog>
  );
}
