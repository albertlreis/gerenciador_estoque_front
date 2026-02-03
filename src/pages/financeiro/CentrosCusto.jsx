import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog } from 'primereact/confirmdialog';

import SakaiLayout from '../../layouts/SakaiLayout';
import apiFinanceiro from '../../services/apiFinanceiro';

const empty = {
  nome: '',
  slug: '',
  centro_custo_pai_id: null,
  ordem: null,
  ativo: true,
  padrao: false,
};

export default function CentrosCusto() {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [ativo, setAtivo] = useState(null); // null = todos

  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const mapById = useMemo(() => {
    const m = new Map();
    (items || []).forEach((it) => m.set(it.id, it));
    return m;
  }, [items]);

  const parentOptions = useMemo(() => {
    const currentId = editing?.id;
    return (items || [])
      .filter((it) => (currentId ? it.id !== currentId : true))
      .map((it) => ({ label: it.nome, value: it.id }));
  }, [items, editing]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        q: q || undefined,
        ativo: ativo === null ? undefined : ativo,
      };
      const res = await apiFinanceiro.get('/financeiro/centros-custo', { params });
      setItems(res?.data?.data || []);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setVisible(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      nome: row.nome || '',
      slug: row.slug || '',
      centro_custo_pai_id: row.centro_custo_pai_id ?? null,
      ordem: row.ordem ?? null,
      ativo: !!row.ativo,
      padrao: !!row.padrao,
    });
    setVisible(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.slug) delete payload.slug;

      if (editing?.id) {
        const res = await apiFinanceiro.put(`/financeiro/centros-custo/${editing.id}`, payload);
        toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Atualizado.' });
      } else {
        const res = await apiFinanceiro.post('/financeiro/centros-custo', payload);
        toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Criado.' });
      }
      setVisible(false);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: msg });
    } finally {
      setSaving(false);
    }
  };

  const remove = (row) => {
    confirmDialog({
      message: `Remover "${row.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          const res = await apiFinanceiro.delete(`/financeiro/centros-custo/${row.id}`);
          toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Removido.' });
          await load();
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
        }
      }
    });
  };

  const parentLabel = (row) => {
    const p = row?.centro_custo_pai_id ? mapById.get(row.centro_custo_pai_id) : null;
    return p?.nome || '-';
  };

  const actions = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => remove(row)} />
    </div>
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 align-items-end mb-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
          </span>

          <Dropdown
            value={ativo}
            onChange={(e) => setAtivo(e.value)}
            options={[
              { label: 'Todos', value: null },
              { label: 'Ativos', value: true },
              { label: 'Inativos', value: false },
            ]}
            placeholder="Status"
            className="w-14rem"
          />

          <Button icon="pi pi-refresh" label="Filtrar" onClick={load} loading={loading} />
          <Button icon="pi pi-plus" label="Novo" onClick={openNew} />
        </div>

        <div className="p-3 border-round surface-0 shadow-1">
          <DataTable value={items} loading={loading} rowHover responsiveLayout="scroll" emptyMessage="Nenhum registro">
            <Column field="nome" header="Nome" />
            <Column header="Pai" body={parentLabel} style={{ width: 220 }} />
            <Column field="ordem" header="Ordem" style={{ width: 120 }} />
            <Column header="Ativo" body={(r) => (r.ativo ? 'Sim' : 'Não')} style={{ width: 100 }} />
            <Column header="Padrão" body={(r) => (r.padrao ? 'Sim' : 'Não')} style={{ width: 110 }} />
            <Column header="Ações" body={actions} style={{ width: 140 }} />
          </DataTable>
        </div>

        <Dialog
          header={editing ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          visible={visible}
          style={{ width: '720px', maxWidth: '95vw' }}
          onHide={() => setVisible(false)}
          footer={
            <div className="flex justify-content-end gap-2">
              <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setVisible(false)} />
              <Button label="Salvar" icon="pi pi-check" onClick={save} loading={saving} />
            </div>
          }
        >
          <div className="grid">
            <div className="col-12 md:col-8">
              <label className="block text-500 text-sm mb-1">Nome</label>
              <InputText className="w-full" value={form.nome} onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))} />
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Ordem</label>
              <InputNumber className="w-full" value={form.ordem} onValueChange={(e) => setForm((s) => ({ ...s, ordem: e.value }))} />
            </div>

            <div className="col-12 md:col-8">
              <label className="block text-500 text-sm mb-1">Centro de Custo Pai</label>
              <Dropdown
                className="w-full"
                value={form.centro_custo_pai_id}
                onChange={(e) => setForm((s) => ({ ...s, centro_custo_pai_id: e.value }))}
                options={[{ label: '-', value: null }, ...parentOptions]}
                filter
                showClear
              />
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Slug (opcional)</label>
              <InputText className="w-full" value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} />
            </div>

            <div className="col-12 md:col-6">
              <div className="flex align-items-center gap-2">
                <InputSwitch checked={!!form.ativo} onChange={(e) => setForm((s) => ({ ...s, ativo: e.value }))} />
                <span>Ativo</span>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="flex align-items-center gap-2">
                <InputSwitch checked={!!form.padrao} onChange={(e) => setForm((s) => ({ ...s, padrao: e.value }))} />
                <span>Padrão</span>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </SakaiLayout>
  );
}
