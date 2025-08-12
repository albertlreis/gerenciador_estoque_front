import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiEstoque from "../../services/apiEstoque";

export default function DialogOutlet({ visible, onHide, onSalvar, variacao, onSuccess, outletEdicao = null }) {
  const toast = useRef(null);
  const [motivos, setMotivos] = useState([]);
  const [formasCatalogo, setFormasCatalogo] = useState([]);

  const [motivoId, setMotivoId] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [formasPagamento, setFormasPagamento] = useState([]);

  const [pagamentoTemp, setPagamentoTemp] = useState({ forma_pagamento_id: null, percentual_desconto: null, max_parcelas: null });
  const [loading, setLoading] = useState(false);

  // Soma de estoque e outlets
  const maxDisponivel = useMemo(() => {
    const estoqueTotal =
      variacao?.estoque_total ??
      variacao?.estoque?.quantidade ??
      0;

    const totalOutlets = (variacao?.outlets ?? []).reduce((acc, o) => acc + (o.quantidade ?? 0), 0);

    const quantidadeOutletAtual = outletEdicao?.quantidade ?? 0;

    return Math.max(0, estoqueTotal - (totalOutlets - quantidadeOutletAtual));
  }, [variacao, outletEdicao]);

  useEffect(() => {
    const loadCatalogos = async () => {
      const [m, f] = await Promise.all([
        apiEstoque.get('/outlet/motivos'),
        apiEstoque.get('/outlet/formas-pagamento')
      ]);
      setMotivos(m.data?.map(x => ({ label: x.nome, value: x.id, slug: x.slug })) ?? []);
      setFormasCatalogo(f.data?.map(x => ({ label: x.nome, value: x.id, slug: x.slug, ...x })) ?? []);
    };
    if (visible) loadCatalogos();
  }, [visible]);

  useEffect(() => {
    if (outletEdicao) {
      const motivo_id = outletEdicao.motivo_id ?? outletEdicao.motivo?.id ?? null;
      const qtd = outletEdicao.quantidade ?? 1;

      const formas = (outletEdicao.formas_pagamento ?? outletEdicao.formasPagamento ?? []).map(fp => ({
        forma_pagamento_id: fp.forma_pagamento_id ?? fp.forma_pagamento?.id ?? fp.formaPagamentoId ?? null,
        percentual_desconto: fp.percentual_desconto ?? fp.percentualDesconto ?? fp.percentual ?? null,
        max_parcelas: fp.max_parcelas ?? fp.maxParcelas ?? null
      })).filter(fp => fp.forma_pagamento_id && fp.percentual_desconto != null);

      setMotivoId(motivo_id);
      setQuantidade(qtd);
      setFormasPagamento(formas);
    } else {
      setMotivoId(null);
      setQuantidade(1);
      setFormasPagamento([]);
    }
    setPagamentoTemp({ forma_pagamento_id: null, percentual_desconto: null, max_parcelas: null });
    setLoading(false); // reset ao abrir
  }, [outletEdicao, visible]);

  const adicionarFormaPagamento = () => {
    const { forma_pagamento_id, percentual_desconto } = pagamentoTemp;
    if (!forma_pagamento_id || percentual_desconto == null) {
      toast.current?.show({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Forma e desconto são obrigatórios', life: 3000 });
      return;
    }
    if (formasPagamento.find(fp => fp.forma_pagamento_id === forma_pagamento_id)) {
      toast.current?.show({ severity: 'warn', summary: 'Duplicado', detail: 'Essa forma já foi adicionada', life: 3000 });
      return;
    }
    setFormasPagamento(prev => [...prev, pagamentoTemp]);
    setPagamentoTemp({ forma_pagamento_id: null, percentual_desconto: null, max_parcelas: null });
  };

  const removerFormaPagamento = (id) => {
    setFormasPagamento(prev => prev.filter(fp => fp.forma_pagamento_id !== id));
  };

  const salvar = async () => {
    if (!motivoId || !quantidade) {
      toast.current?.show({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Motivo e quantidade são obrigatórios.', life: 3000 });
      return;
    }
    if (quantidade > maxDisponivel) {
      toast.current?.show({ severity: 'error', summary: 'Quantidade inválida', detail: `Disponível para outlet: ${maxDisponivel}`, life: 3500 });
      return;
    }
    if (formasPagamento.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Adicione ao menos uma forma de pagamento.', life: 3000 });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        motivo_id: motivoId,
        quantidade,
        formas_pagamento: formasPagamento
      };

      const ok = await onSalvar(payload, outletEdicao ?? null);

      if (ok !== false) {
        onSuccess?.(true);
        onHide();
      } else {
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o outlet.', life: 3500 });
      }
    } catch (e) {
      const detail = e?.response?.data?.message || e?.message || 'Erro ao salvar outlet.';
      toast.current?.show({ severity: 'error', summary: 'Erro', detail, life: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={outletEdicao ? 'Editar Outlet' : 'Novo Outlet'}
      visible={visible}
      onHide={onHide}
      className="w-max md:w-50"
      closable={!loading}
      closeOnEscape={!loading}
      dismissableMask={false}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} disabled={loading}/>
          <Button label="Salvar" icon="pi pi-check" className="p-button-success" onClick={salvar} loading={loading} />
        </div>
      }
    >
      <Toast ref={toast} />

      <div className="formgrid grid">
        <div className="field md:col-6">
          <label>Motivo</label>
          <Dropdown
            value={motivoId}
            options={motivos}
            onChange={(e)=>setMotivoId(e.value)}
            filter
            placeholder="Selecione o motivo"
            disabled={loading}
          />
        </div>

        <div className="field md:col-6">
          <label>Quantidade {maxDisponivel >= 0 && `(máx ${maxDisponivel})`}</label>
          <InputNumber value={quantidade} onValueChange={(e) => setQuantidade(e.value)} min={1} max={maxDisponivel} disabled={loading}/>
        </div>
      </div>

      <h6 className="mt-4 mb-2">Formas de Pagamento</h6>

      <div className="formgrid grid">
        <div className="field md:col-4">
          <label>Forma</label>
          <Dropdown
            value={pagamentoTemp.forma_pagamento_id}
            options={formasCatalogo}
            onChange={(e)=>setPagamentoTemp(prev=>({
              ...prev,
              forma_pagamento_id: e.value,
              max_parcelas: formasCatalogo.find(x=>x.value===e.value)?.max_parcelas_default ?? null
            }))}
            placeholder="Selecione"
            disabled={loading}
          />
        </div>
        <div className="field md:col-4">
          <label>% Desconto</label>
          <InputNumber
            value={pagamentoTemp.percentual_desconto}
            onValueChange={(e) => setPagamentoTemp(prev => ({ ...prev, percentual_desconto: e.value }))}
            mode="decimal"
            min={0}
            max={100}
            suffix="%"
            disabled={loading}
          />
        </div>
        <div className="field md:col-3">
          <label>Máx Parcelas</label>
          <InputNumber
            value={pagamentoTemp.max_parcelas}
            onValueChange={(e) => setPagamentoTemp(prev => ({ ...prev, max_parcelas: e.value }))}
            min={1}
            max={36}
            disabled={loading}
          />
        </div>
        <div className="field md:col-1 flex align-items-end">
          <Button icon="pi pi-plus" className="p-button-sm" type="button" onClick={adicionarFormaPagamento} disabled={loading}/>
        </div>
      </div>

      <ul className="mt-2">
        {formasPagamento.map((fp, i) => (
          <li key={i} className="flex justify-content-between align-items-center border-bottom-1 surface-200 p-2">
            <span>
              <strong>{(formasCatalogo.find(f => f.value === fp.forma_pagamento_id)?.label) || '—'}</strong>: {fp.percentual_desconto}%
              {fp.max_parcelas && ` • até ${fp.max_parcelas}x`}
            </span>
            <Button icon="pi pi-trash" className="p-button-rounded p-button-text"
                    onClick={() => removerFormaPagamento(fp.forma_pagamento_id)} disabled={loading}/>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
