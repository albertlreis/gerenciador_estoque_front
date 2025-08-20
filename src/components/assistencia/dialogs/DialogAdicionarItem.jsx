import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import ProdutoSelect from '../selects/ProdutoSelect';
import VariacaoSelect from '../selects/VariacaoSelect';
import DefeitoSelect from '../selects/DefeitoSelect';
import DepositoSelect from '../selects/DepositoSelect';
import apiEstoque from '../../../services/apiEstoque';

export default function DialogAdicionarItem({ chamadoId, visible, onHide, onAdded }) {
  const toast = useRef(null);
  const [produto, setProduto] = useState(null);
  const [variacao, setVariacao] = useState(null);
  const [defeito, setDefeito] = useState(null);
  const [depositoOrigem, setDepositoOrigem] = useState(null);
  const [form, setForm] = useState({
    numero_serie: '',
    lote: '',
    descricao_defeito_livre: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setProduto(null); setVariacao(null); setDefeito(null); setDepositoOrigem(null);
      setForm({ numero_serie: '', lote: '', descricao_defeito_livre: '', observacoes: '' });
    }
  }, [visible]);

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        produto_id: produto?.id ?? null,
        variacao_id: variacao?.id ?? null,
        numero_serie: form.numero_serie || null,
        lote: form.lote || null,
        defeito_id: defeito?.id ?? null,
        descricao_defeito_livre: form.descricao_defeito_livre || null,
        deposito_origem_id: depositoOrigem?.id ?? null,
        observacoes: form.observacoes || null,
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

  return (
    <Dialog header="Adicionar Item ao Chamado" visible={visible} style={{ width: 820 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid formgrid p-fluid gap-3">
        <div className="col-12 md:col-6"><label className="block mb-2">Produto</label><ProdutoSelect value={produto} onChange={setProduto} /></div>
        <div className="col-12 md:col-6"><label className="block mb-2">Variação</label><VariacaoSelect produto={produto} value={variacao} onChange={setVariacao} /></div>
        <div className="col-12 md:col-6"><label className="block mb-2">Defeito (catálogo)</label><DefeitoSelect value={defeito} onChange={setDefeito} /></div>
        <div className="col-12 md:col-6"><label className="block mb-2">Depósito de Origem</label><DepositoSelect value={depositoOrigem} onChange={setDepositoOrigem} /></div>
        <div className="col-12 md:col-6"><label className="block mb-2">Número de Série</label><InputText value={form.numero_serie} onChange={(e) => setForm((f) => ({ ...f, numero_serie: e.target.value }))} /></div>
        <div className="col-12 md:col-6"><label className="block mb-2">Lote</label><InputText value={form.lote} onChange={(e) => setForm((f) => ({ ...f, lote: e.target.value }))} /></div>
        <div className="col-12"><label className="block mb-2">Descrição Livre do Defeito</label><InputTextarea rows={2} value={form.descricao_defeito_livre} onChange={(e) => setForm((f) => ({ ...f, descricao_defeito_livre: e.target.value }))} placeholder="Ex.: cliente reporta rangido..." /></div>
        <div className="col-12"><label className="block mb-2">Observações</label><InputTextarea rows={2} value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} /></div>
        <div className="col-12 flex justify-end gap-2"><Button label="Cancelar" outlined onClick={onHide} /><Button label="Adicionar" icon="pi pi-check" loading={loading} onClick={submit} /></div>
      </div>
    </Dialog>
  );
}
