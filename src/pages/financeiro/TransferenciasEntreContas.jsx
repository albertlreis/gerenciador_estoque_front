import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';

import SakaiLayout from '../../layouts/SakaiLayout';
import apiFinanceiro from '../../services/apiFinanceiro';
import { toIsoDate } from '../../utils/date/dateHelpers';

const empty = {
  data: null,
  conta_origem_id: null,
  conta_destino_id: null,
  valor: null,
  descricao: '',
};

export default function TransferenciasEntreContas() {
  const toast = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState([]);
  const [contas, setContas] = useState([]);

  // filtros
  const [periodo, setPeriodo] = useState(null);
  const [contaId, setContaId] = useState(null);
  const [q, setQ] = useState('');

  // modal
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...empty });

  const contasOptions = useMemo(() => {
    return (contas || []).map((c) => ({
      label: `${c.nome} (${c.moeda || 'BRL'} / ${c.tipo || '-'})`,
      value: c.id,
    }));
  }, [contas]);

  const contasMap = useMemo(() => {
    const m = new Map();
    (contas || []).forEach((c) => m.set(c.id, c));
    return m;
  }, [contas]);

  const loadContas = async () => {
    try {
      const res = await apiFinanceiro.get('/financeiro/contas-financeiras', { params: { ativo: true } });
      setContas(res?.data?.data || []);
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.response?.data?.message || e.message,
      });
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        q: q || undefined,
        conta_id: contaId || undefined,
        data_inicio: periodo?.[0] ? toIsoDate(periodo[0]) : undefined,
        data_fim: periodo?.[1] ? toIsoDate(periodo[1]) : undefined,
      };

      const res = await apiFinanceiro.get('/financeiro/transferencias', { params });
      setItems(res?.data?.data || []);
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadContas();
      await load();
    })();
    // eslint-disable-next-line
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...empty, data: new Date() });
    setVisible(true);
  };

  const openEdit = async (row) => {
    setLoading(true);
    try {
      const res = await apiFinanceiro.get(`/financeiro/transferencias/${row.id}`);
      const data = res?.data?.data || res?.data;

      setEditingId(row.id);
      setForm({
        data: data?.data ? new Date(`${data.data}T00:00:00`) : new Date(),
        conta_origem_id: data?.conta_origem_id || null,
        conta_destino_id: data?.conta_destino_id || null,
        valor: data?.valor !== null && data?.valor !== undefined ? Number(data.valor) : null,
        descricao: data?.descricao || '',
      });

      setVisible(true);
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!form.data) return 'Informe a data.';
    if (!form.conta_origem_id) return 'Selecione a conta de origem.';
    if (!form.conta_destino_id) return 'Selecione a conta de destino.';
    if (form.conta_origem_id === form.conta_destino_id) return 'Origem e destino devem ser diferentes.';
    if (!form.valor || Number(form.valor) <= 0) return 'Informe um valor válido.';
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: err });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        data: toIsoDate(form.data),
        conta_origem_id: form.conta_origem_id,
        conta_destino_id: form.conta_destino_id,
        valor: form.valor,
        descricao: form.descricao || null,
      };

      if (editingId) {
        const res = await apiFinanceiro.put(`/financeiro/transferencias/${editingId}`, payload);
        toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Atualizado.' });
      } else {
        const res = await apiFinanceiro.post('/financeiro/transferencias', payload);
        toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Criado.' });
      }

      setVisible(false);
      await load();
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: e?.response?.data?.message || e.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = (row) => {
    confirmDialog({
      message: `Remover a transferência #${row.id}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          const res = await apiFinanceiro.delete(`/financeiro/transferencias/${row.id}`);
          toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Removido.' });
          await load();
        } catch (e) {
          toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail: e?.response?.data?.message || e.message,
          });
        }
      },
    });
  };

  const money = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const contaNome = (id) => contasMap.get(id)?.nome || `#${id}`;

  const actions = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => remove(row)} />
    </div>
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 align-items-end mb-3">
          <Calendar
            value={periodo || null}
            onChange={(e) => setPeriodo(e.value)}
            selectionMode="range"
            readOnlyInput
            placeholder="Período"
            dateFormat="dd/mm/yy"
            className="w-20rem"
          />

          <Dropdown
            value={contaId}
            onChange={(e) => setContaId(e.value)}
            options={[{ label: 'Todas as contas', value: null }, ...contasOptions]}
            placeholder="Conta (origem ou destino)"
            className="w-20rem"
            filter
            showClear
          />

          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por descrição..." />
          </span>

          <Button icon="pi pi-refresh" label="Filtrar" onClick={load} loading={loading} />
          <Button icon="pi pi-plus" label="Nova Transferência" onClick={openNew} />
        </div>

        <div className="p-3 border-round surface-0 shadow-1">
          <DataTable value={items} loading={loading} rowHover responsiveLayout="scroll" emptyMessage="Nenhum registro">
            <Column field="id" header="#" style={{ width: 90 }} />
            <Column field="data" header="Data" style={{ width: 140 }} />
            <Column
              header="Origem"
              body={(r) => r?.conta_origem?.nome || contaNome(r?.conta_origem_id)}
              style={{ width: 260 }}
            />
            <Column
              header="Destino"
              body={(r) => r?.conta_destino?.nome || contaNome(r?.conta_destino_id)}
              style={{ width: 260 }}
            />
            <Column header="Valor" body={(r) => `R$ ${money(r.valor)}`} style={{ width: 160 }} />
            <Column field="descricao" header="Descrição" />
            <Column header="Ações" body={actions} style={{ width: 140 }} />
          </DataTable>
        </div>

        <Dialog
          header={editingId ? 'Editar Transferência' : 'Nova Transferência'}
          visible={visible}
          style={{ width: '900px', maxWidth: '95vw' }}
          onHide={() => setVisible(false)}
          footer={
            <div className="flex justify-content-end gap-2">
              <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setVisible(false)} />
              <Button label="Salvar" icon="pi pi-check" onClick={save} loading={saving} />
            </div>
          }
        >
          <div className="grid">
            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Data</label>
              <Calendar
                value={form.data}
                onChange={(e) => setForm((s) => ({ ...s, data: e.value }))}
                dateFormat="dd/mm/yy"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Conta de origem</label>
              <Dropdown
                className="w-full"
                value={form.conta_origem_id}
                onChange={(e) => setForm((s) => ({ ...s, conta_origem_id: e.value }))}
                options={contasOptions}
                filter
                showClear
                placeholder="Selecione"
              />
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Conta de destino</label>
              <Dropdown
                className="w-full"
                value={form.conta_destino_id}
                onChange={(e) => setForm((s) => ({ ...s, conta_destino_id: e.value }))}
                options={contasOptions}
                filter
                showClear
                placeholder="Selecione"
              />
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Valor</label>
              <InputNumber
                className="w-full"
                value={form.valor}
                onValueChange={(e) => setForm((s) => ({ ...s, valor: e.value }))}
                mode="decimal"
                minFractionDigits={2}
                maxFractionDigits={2}
              />
            </div>

            <div className="col-12 md:col-8">
              <label className="block text-500 text-sm mb-1">Descrição (opcional)</label>
              <InputText
                className="w-full"
                value={form.descricao}
                onChange={(e) => setForm((s) => ({ ...s, descricao: e.target.value }))}
              />
            </div>
          </div>
        </Dialog>
      </div>
    </SakaiLayout>
  );
}
