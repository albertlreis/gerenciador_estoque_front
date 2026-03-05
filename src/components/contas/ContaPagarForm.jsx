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
import SelectOrCreate from '../financeiro/SelectOrCreate';

const STATUS = [
  { label: 'Aberta', value: 'ABERTA' },
  { label: 'Parcial', value: 'PARCIAL' },
  { label: 'Paga', value: 'PAGA' },
  { label: 'Cancelada', value: 'CANCELADA' },
];

const defaultForm = {
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
  centro_custo_id: null,
  categoria_id: null,
  observacoes: '',
};

export default function ContaPagarForm({ visible, onHide, onSaved, conta }) {
  const isEdicao = !!conta?.id;
  const toast = useRef(null);

  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);

  const toOption = (item) => ({
    label: item.nome,
    value: item.id,
  });

  const toFormaOption = (item) => ({
    label: item.nome,
    value: item.nome,
  });

  useEffect(() => {
    if (!visible) return;

    if (conta?.id) {
      setForm({
        ...defaultForm,
        ...conta,
        categoria_id: conta.categoria_id ?? conta.categoria?.id ?? null,
        centro_custo_id: conta.centro_custo_id ?? conta.centro_custo?.id ?? null,
        data_emissao: conta.data_emissao ? new Date(conta.data_emissao) : null,
        data_vencimento: conta.data_vencimento ? new Date(conta.data_vencimento) : null,
      });
    } else {
      setForm(defaultForm);
    }
  }, [conta?.id, visible]);

  const loadCatalogos = async () => {
    setLoadingCatalogos(true);
    try {
      const [resCategorias, resCentros, resFormas] = await Promise.all([
        apiFinanceiro.get('/financeiro/categorias-financeiras', { params: { tipo: 'despesa', ativo: true, tree: 0 } }),
        apiFinanceiro.get('/financeiro/centros-custo', { params: { ativo: true } }),
        apiFinanceiro.get('/financeiro/formas-pagamento', { params: { ativo: true } }),
      ]);

      setCategorias((resCategorias?.data?.data || []).map(toOption));
      setCentrosCusto((resCentros?.data?.data || []).map(toOption));
      setFormasPagamento((resFormas?.data?.data || []).map(toFormaOption));
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.response?.data?.message || 'Falha ao carregar catálogos do financeiro.',
      });
    } finally {
      setLoadingCatalogos(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    loadCatalogos();
  }, [visible]);

  const createCategoria = async (nome) => {
    try {
      const res = await apiFinanceiro.post('/financeiro/categorias-financeiras', { nome, tipo: 'despesa', ativo: true });
      const created = res?.data?.data;
      if (!created?.id) return form.categoria_id;

      const option = toOption(created);
      setCategorias((prev) => [...prev.filter((o) => o.value !== option.value), option]);
      toast.current?.show({ severity: 'success', summary: 'OK', detail: 'Categoria financeira cadastrada.' });
      return option.value;
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
      return form.categoria_id;
    }
  };

  const createCentroCusto = async (nome) => {
    try {
      const res = await apiFinanceiro.post('/financeiro/centros-custo', { nome, ativo: true });
      const created = res?.data?.data;
      if (!created?.id) return form.centro_custo_id;

      const option = toOption(created);
      setCentrosCusto((prev) => [...prev.filter((o) => o.value !== option.value), option]);
      toast.current?.show({ severity: 'success', summary: 'OK', detail: 'Centro de custo cadastrado.' });
      return option.value;
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
      return form.centro_custo_id;
    }
  };

  const createFormaPagamento = async (nome) => {
    try {
      const res = await apiFinanceiro.post('/financeiro/formas-pagamento', { nome, ativo: true });
      const created = res?.data?.data;
      if (!created?.nome) return form.forma_pagamento;

      const option = toFormaOption(created);
      setFormasPagamento((prev) => [...prev.filter((o) => o.value !== option.value), option]);
      toast.current?.show({ severity: 'success', summary: 'OK', detail: 'Forma de pagamento cadastrada.' });
      return option.value;
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
      return form.forma_pagamento;
    }
  };

  const salvar = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        data_emissao: form.data_emissao ? form.data_emissao.toISOString().slice(0, 10) : null,
        data_vencimento: form.data_vencimento ? form.data_vencimento.toISOString().slice(0, 10) : null,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        centro_custo_id: form.centro_custo_id ? Number(form.centro_custo_id) : null,
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
    <Dialog header={isEdicao ? 'Editar Conta' : 'Nova Conta'} visible={visible} style={{ width: '760px' }} modal onHide={onHide}>
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
          <Calendar value={form.data_emissao} onChange={(e) => setForm((p) => ({ ...p, data_emissao: e.value }))} dateFormat="dd/mm/yy" showIcon readOnlyInput />
        </div>
        <div className="col-3">
          <label>Vencimento *</label>
          <Calendar value={form.data_vencimento} onChange={(e) => setForm((p) => ({ ...p, data_vencimento: e.value }))} dateFormat="dd/mm/yy" showIcon readOnlyInput />
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
          <SelectOrCreate
            value={form.forma_pagamento}
            onChange={(value) => setForm((p) => ({ ...p, forma_pagamento: value }))}
            options={formasPagamento}
            loading={loadingCatalogos}
            placeholder="Selecione"
            createLabel="Cadastrar"
            dialogTitle="Cadastrar forma de pagamento"
            onCreate={createFormaPagamento}
          />
        </div>
        <div className="col-4">
          <label>Centro de Custo</label>
          <SelectOrCreate
            value={form.centro_custo_id}
            onChange={(value) => setForm((p) => ({ ...p, centro_custo_id: value }))}
            options={centrosCusto}
            loading={loadingCatalogos}
            placeholder="Selecione"
            createLabel="Cadastrar"
            dialogTitle="Cadastrar centro de custo"
            onCreate={createCentroCusto}
          />
        </div>

        <div className="col-6">
          <label>Categoria</label>
          <SelectOrCreate
            value={form.categoria_id}
            onChange={(value) => setForm((p) => ({ ...p, categoria_id: value }))}
            options={categorias}
            loading={loadingCatalogos}
            placeholder="Selecione"
            createLabel="Cadastrar"
            dialogTitle="Cadastrar categoria financeira"
            onCreate={createCategoria}
          />
        </div>
        <div className="col-12">
          <label>Observações</label>
          <InputTextarea rows={3} autoResize value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-2">
          <Button label="Salvar" icon="pi pi-check" onClick={salvar} loading={saving} disabled={saving || loadingCatalogos} />
          <Button label="Cancelar" icon="pi pi-times" severity="secondary" onClick={onHide} outlined disabled={saving} />
        </div>
      </div>
    </Dialog>
  );
}
