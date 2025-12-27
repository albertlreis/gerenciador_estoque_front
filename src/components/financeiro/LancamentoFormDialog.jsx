import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

import apiFinanceiro from '../../services/apiFinanceiro';
import { useFinanceiroCatalogos } from '../../hooks/useFinanceiroCatalogos';

const empty = {
  descricao: '',
  tipo: 'despesa',
  status: 'confirmado',
  valor: 0,
  data_movimento: new Date(),
  competencia: null, // opcional
  data_pagamento: null, // opcional (se você quiser manter)
  categoria_id: null,
  conta_id: null,
  observacoes: '',
};

export default function LancamentoFormDialog({ visible, onHide, onSaved, lancamento }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(empty);

  const { loadCategorias, loadContas } = useFinanceiroCatalogos();
  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      setContas(await loadContas());
    })();

    if (lancamento) {
      setForm({
        descricao: lancamento.descricao || '',
        tipo: lancamento.tipo || 'despesa',
        status: (lancamento?.status?.value || lancamento.status || 'confirmado').toString().toLowerCase(),
        valor: Number(lancamento.valor || 0),
        data_movimento: lancamento.data_movimento ? new Date(lancamento.data_movimento) : new Date(),
        competencia: lancamento.competencia ? new Date(lancamento.competencia) : null,
        data_pagamento: lancamento.data_pagamento ? new Date(lancamento.data_pagamento) : null,
        categoria_id: lancamento?.categoria?.id || lancamento?.categoria_id || null,
        conta_id: lancamento?.conta?.id || lancamento?.conta_id || null,
        observacoes: lancamento.observacoes || '',
      });
    } else {
      setForm(empty);
    }
  }, [visible, lancamento, loadContas]);

  // sempre que mudar tipo, recarrega categorias (limitando por tipo)
  useEffect(() => {
    if (!visible) return;
    (async () => {
      setCategorias(await loadCategorias({ tipo: form?.tipo || undefined }));
    })();
    // eslint-disable-next-line
  }, [visible, form?.tipo]);

  const tipos = useMemo(() => ([
    { label: 'Receita', value: 'receita' },
    { label: 'Despesa', value: 'despesa' },
  ]), []);

  const status = useMemo(() => ([
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'Cancelado', value: 'cancelado' },
  ]), []);

  const salvar = async () => {
    setSaving(true);
    try {
      const payload = {
        descricao: form.descricao?.trim(),
        tipo: form.tipo,
        status: form.status,
        valor: form.valor,

        data_movimento: form.data_movimento ? form.data_movimento.toISOString() : null,
        competencia: form.competencia ? form.competencia.toISOString().slice(0, 10) : null, // YYYY-MM-DD
        data_pagamento: form.data_pagamento ? form.data_pagamento.toISOString() : null,

        categoria_id: form.categoria_id || null,
        conta_id: form.conta_id || null,
        observacoes: form.observacoes || null,
      };

      if (lancamento?.id) {
        await apiFinanceiro.put(`/financeiro/lancamentos/${lancamento.id}`, payload);
      } else {
        await apiFinanceiro.post('/financeiro/lancamentos', payload);
      }

      onSaved?.();
      onHide?.();
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" outlined onClick={onHide} disabled={saving} />
      <Button label={lancamento?.id ? 'Salvar' : 'Criar'} icon="pi pi-check" onClick={salvar} loading={saving} />
    </div>
  );

  return (
    <Dialog
      header={lancamento?.id ? `Editar Lançamento #${lancamento.id}` : 'Novo Lançamento'}
      visible={visible}
      style={{ width: 'min(820px, 96vw)' }}
      modal
      onHide={onHide}
      footer={footer}
    >
      <div className="grid">
        <div className="col-12">
          <label className="block text-sm mb-1">Descrição</label>
          <InputText className="w-full" value={form.descricao} onChange={(e) => setForm((s) => ({ ...s, descricao: e.target.value }))} />
        </div>

        <div className="col-12 md:col-4">
          <label className="block text-sm mb-1">Tipo</label>
          <Dropdown
            className="w-full"
            value={form.tipo}
            options={tipos}
            onChange={(e) => setForm((s) => ({ ...s, tipo: e.value, categoria_id: null }))}
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="block text-sm mb-1">Status</label>
          <Dropdown className="w-full" value={form.status} options={status} onChange={(e) => setForm((s) => ({ ...s, status: e.value }))} />
        </div>

        <div className="col-12 md:col-4">
          <label className="block text-sm mb-1">Valor</label>
          <InputNumber
            className="w-full"
            value={form.valor}
            onValueChange={(e) => setForm((s) => ({ ...s, valor: e.value || 0 }))}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block text-sm mb-1">Categoria</label>
          <Dropdown
            className="w-full"
            value={form.categoria_id || null}
            options={categorias}
            onChange={(e) => setForm((s) => ({ ...s, categoria_id: e.value }))}
            placeholder="Selecione"
            showClear
            filter
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block text-sm mb-1">Conta</label>
          <Dropdown
            className="w-full"
            value={form.conta_id || null}
            options={contas}
            onChange={(e) => setForm((s) => ({ ...s, conta_id: e.value }))}
            placeholder="Selecione"
            showClear
            filter
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block text-sm mb-1">Movimento</label>
          <Calendar
            className="w-full"
            value={form.data_movimento}
            onChange={(e) => setForm((s) => ({ ...s, data_movimento: e.value }))}
            showIcon
            showTime
            hourFormat="24"
            dateFormat="dd/mm/yy"
          />
          <small className="text-500">Data/hora do lançamento no ledger.</small>
        </div>

        <div className="col-12 md:col-6">
          <label className="block text-sm mb-1">Competência (opcional)</label>
          <Calendar
            className="w-full"
            value={form.competencia}
            onChange={(e) => setForm((s) => ({ ...s, competencia: e.value }))}
            showIcon
            view="month"
            dateFormat="mm/yy"
          />
          <small className="text-500">Use para relatórios por competência (mês/ano).</small>
        </div>

        <div className="col-12">
          <label className="block text-sm mb-1">Observações</label>
          <InputText className="w-full" value={form.observacoes} onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))} />
        </div>
      </div>
    </Dialog>
  );
}
