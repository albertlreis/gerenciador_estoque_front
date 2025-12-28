import React, { useEffect, useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiFinanceiro from '../../services/apiFinanceiro';

const STATUS = [
  { label: 'Aberta', value: 'ABERTA' },
  { label: 'Parcial', value: 'PARCIAL' },
  { label: 'Paga', value: 'PAGA' },
  { label: 'Cancelada', value: 'CANCELADA' },
];
const FORMAS = [
  { label: 'PIX', value: 'PIX' },
  { label: 'Boleto', value: 'BOLETO' },
  { label: 'TED', value: 'TED' },
  { label: 'Dinheiro', value: 'DINHEIRO' },
  { label: 'Cartão', value: 'CARTAO' },
];

export default function ContaPagarForm({ visible, onHide, onSaved, conta }) {
  const isEdicao = !!conta?.id;
  const toast = useRef(null);

  const [form, setForm] = useState({
    descricao: '',
    numero_documento: '',
    data_emissao: null,
    data_vencimento: null,
    valor_bruto: 0,
    desconto: 0,
    juros: 0,
    multa: 0,
    status: 'ABERTA',
    forma_pagamento: null,
    centro_custo: '',
    categoria: '',
    observacoes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (conta?.id) {
      setForm({
        ...form,
        ...conta,
        data_emissao: conta.data_emissao ? new Date(conta.data_emissao) : null,
        data_vencimento: conta.data_vencimento ? new Date(conta.data_vencimento) : null,
      });
    } else {
      setForm((p) => ({ ...p, status: 'ABERTA' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conta?.id, visible]);

  const salvar = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        data_emissao: form.data_emissao ? form.data_emissao.toISOString().slice(0,10) : null,
        data_vencimento: form.data_vencimento ? form.data_vencimento.toISOString().slice(0,10) : null,
      };
      if (isEdicao) await apiFinanceiro.put(`/financeiro/contas-pagar/${conta.id}`, payload);
      else await apiFinanceiro.post('/financeiro/contas-pagar', payload);
      onSaved?.();
      onHide();
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog header={isEdicao ? 'Editar Conta' : 'Nova Conta'} visible={visible} style={{ width: '720px' }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid p-fluid">
        <div className="col-12">
          <label className="font-bold">Descrição *</label>
          <InputText value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} />
        </div>
        <div className="col-6">
          <label>Nº Documento</label>
          <InputText value={form.numero_documento} onChange={(e) => setForm((p) => ({ ...p, numero_documento: e.target.value }))} />
        </div>
        <div className="col-3">
          <label>Emissão</label>
          <Calendar value={form.data_emissao} onChange={(e) => setForm((p) => ({ ...p, data_emissao: e.value }))} dateFormat="dd/mm/yy" showIcon readOnlyInput/>
        </div>
        <div className="col-3">
          <label>Vencimento *</label>
          <Calendar value={form.data_vencimento} onChange={(e) => setForm((p) => ({ ...p, data_vencimento: e.value }))} dateFormat="dd/mm/yy" showIcon readOnlyInput/>
        </div>

        <div className="col-3">
          <label>Valor Bruto *</label>
          <InputNumber value={form.valor_bruto} onValueChange={(e) => setForm((p) => ({ ...p, valor_bruto: e.value || 0 }))} mode="currency" currency="BRL" locale="pt-BR" min={0} />
        </div>
        <div className="col-3">
          <label>Desconto</label>
          <InputNumber value={form.desconto} onValueChange={(e) => setForm((p) => ({ ...p, desconto: e.value || 0 }))} mode="currency" currency="BRL" locale="pt-BR" min={0} />
        </div>
        <div className="col-3">
          <label>Juros</label>
          <InputNumber value={form.juros} onValueChange={(e) => setForm((p) => ({ ...p, juros: e.value || 0 }))} mode="currency" currency="BRL" locale="pt-BR" min={0} />
        </div>
        <div className="col-3">
          <label>Multa</label>
          <InputNumber value={form.multa} onValueChange={(e) => setForm((p) => ({ ...p, multa: e.value || 0 }))} mode="currency" currency="BRL" locale="pt-BR" min={0} />
        </div>

        <div className="col-4">
          <label>Status *</label>
          <Dropdown value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.value }))} options={STATUS} className="w-full" />
        </div>
        <div className="col-4">
          <label>Forma de Pagamento</label>
          <Dropdown value={form.forma_pagamento} onChange={(e) => setForm((p) => ({ ...p, forma_pagamento: e.value }))} options={FORMAS} className="w-full" showClear/>
        </div>
        <div className="col-4">
          <label>Centro de Custo</label>
          <InputText value={form.centro_custo} onChange={(e) => setForm((p) => ({ ...p, centro_custo: e.target.value }))} />
        </div>

        <div className="col-6">
          <label>Categoria</label>
          <InputText value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} />
        </div>
        <div className="col-12">
          <label>Observações</label>
          <InputTextarea rows={3} autoResize value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-2">
          <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={saving} />
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" onClick={onHide} outlined />
        </div>
      </div>
    </Dialog>
  );
}
