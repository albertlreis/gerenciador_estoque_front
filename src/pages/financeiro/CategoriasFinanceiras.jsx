import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

import SakaiLayout from '../../layouts/SakaiLayout';
import apiFinanceiro from '../../services/apiFinanceiro';

const empty = {
  nome: '',
  slug: '',
  tipo: 'despesa',
  categoria_pai_id: null,
  ordem: null,
  ativo: true,
  padrao: false,
};

export default function CategoriasFinanceiras() {
  const toast = useRef(null);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState(null); // null = ambos
  const [ativo, setAtivo] = useState(null); // null = todos

  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...empty });

  const mapById = useMemo(() => {
    const m = new Map();
    (items || []).forEach((it) => m.set(it.id, it));
    return m;
  }, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        q: q || undefined,
        tipo: tipo || undefined,
        ativo: ativo === null ? undefined : ativo,
        tree: 0, // garantir "flat"
      };
      const res = await apiFinanceiro.get('/financeiro/categorias-financeiras', { params });
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
    load();
    // eslint-disable-next-line
  }, []);

  const parentOptions = useMemo(() => {
    const currentId = editingId;
    const selectedTipo = form.tipo;

    // mantém pais dentro do mesmo tipo, e remove o próprio item
    return (items || [])
      .filter((it) => (selectedTipo ? it.tipo === selectedTipo : true))
      .filter((it) => (currentId ? it.id !== currentId : true))
      .map((it) => ({ label: it.nome, value: it.id }));
  }, [items, editingId, form.tipo]);

  const parentLabel = (row) => {
    const p = row?.categoria_pai_id ? mapById.get(row.categoria_pai_id) : null;
    return p?.nome || '-';
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...empty, tipo: tipo || 'despesa' });
    setVisible(true);
  };

  const openEdit = async (row) => {
    try {
      setLoading(true);
      const res = await apiFinanceiro.get(`/financeiro/categorias-financeiras/${row.id}`);
      const data = res?.data?.data || res?.data;

      setEditingId(row.id);
      setForm({
        nome: data?.nome || '',
        slug: data?.slug || '',
        tipo: data?.tipo || 'despesa',
        categoria_pai_id: data?.categoria_pai_id ?? null,
        ordem: data?.ordem ?? null,
        ativo: data?.ativo ?? true,
        padrao: data?.padrao ?? false,
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

  const sanitizePayload = (p) => {
    const payload = { ...p };

    // slug opcional
    if (!payload.slug) delete payload.slug;

    // normaliza vazios
    if (payload.categoria_pai_id === '') payload.categoria_pai_id = null;
    if (payload.ordem === '') payload.ordem = null;

    return payload;
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = sanitizePayload(form);

      if (editingId) {
        const res = await apiFinanceiro.put(`/financeiro/categorias-financeiras/${editingId}`, payload);
        toast.current?.show({ severity: 'success', summary: 'OK', detail: res?.data?.message || 'Atualizado.' });
      } else {
        const res = await apiFinanceiro.post('/financeiro/categorias-financeiras', payload);
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
          const res = await apiFinanceiro.delete(`/financeiro/categorias-financeiras/${row.id}`);
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

  const actions = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => remove(row)} />
    </div>
  );

  const tipoOptions = [
    { label: 'Despesa', value: 'despesa' },
    { label: 'Receita', value: 'receita' },
  ];

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 align-items-end mb-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
          </span>

          <Dropdown
            value={tipo}
            onChange={(e) => setTipo(e.value)}
            options={[{ label: 'Todos', value: null }, ...tipoOptions]}
            placeholder="Tipo"
            className="w-14rem"
          />

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
          <Button icon="pi pi-plus" label="Nova" onClick={openNew} />
        </div>

        <div className="p-3 border-round surface-0 shadow-1">
          <DataTable value={items} loading={loading} rowHover responsiveLayout="scroll" emptyMessage="Nenhum registro">
            <Column field="nome" header="Nome" />
            <Column field="tipo" header="Tipo" style={{ width: 140 }} />
            <Column header="Pai" body={parentLabel} style={{ width: 240 }} />
            <Column field="ordem" header="Ordem" style={{ width: 110 }} />
            <Column header="Ativo" body={(r) => (r.ativo ? 'Sim' : 'Não')} style={{ width: 100 }} />
            <Column header="Padrão" body={(r) => (r.padrao ? 'Sim' : 'Não')} style={{ width: 110 }} />
            <Column header="Ações" body={actions} style={{ width: 140 }} />
          </DataTable>
        </div>

        <Dialog
          header={editingId ? 'Editar Categoria Financeira' : 'Nova Categoria Financeira'}
          visible={visible}
          style={{ width: '820px', maxWidth: '95vw' }}
          onHide={() => setVisible(false)}
          footer={
            <div className="flex justify-content-end gap-2">
              <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setVisible(false)} />
              <Button label="Salvar" icon="pi pi-check" onClick={save} loading={saving} />
            </div>
          }
        >
          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block text-500 text-sm mb-1">Nome</label>
              <InputText
                className="w-full"
                value={form.nome}
                onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
              />
            </div>

            <div className="col-12 md:col-3">
              <label className="block text-500 text-sm mb-1">Tipo</label>
              <Dropdown
                className="w-full"
                value={form.tipo}
                onChange={(e) => {
                  const nextTipo = e.value;
                  setForm((s) => {
                    const next = { ...s, tipo: nextTipo };
                    // se mudou o tipo, evita pai inválido
                    const pai = next.categoria_pai_id
                      ? (items || []).find((it) => it.id === next.categoria_pai_id)
                      : null;
                    if (pai && pai.tipo !== nextTipo) next.categoria_pai_id = null;
                    return next;
                  });
                }}
                options={tipoOptions}
              />
            </div>

            <div className="col-12 md:col-3">
              <label className="block text-500 text-sm mb-1">Ordem</label>
              <InputNumber
                className="w-full"
                value={form.ordem}
                onValueChange={(e) => setForm((s) => ({ ...s, ordem: e.value }))}
              />
            </div>

            <div className="col-12 md:col-8">
              <label className="block text-500 text-sm mb-1">Categoria Pai</label>
              <Dropdown
                className="w-full"
                value={form.categoria_pai_id}
                onChange={(e) => setForm((s) => ({ ...s, categoria_pai_id: e.value }))}
                options={[{ label: '-', value: null }, ...parentOptions]}
                filter
                showClear
                placeholder="(opcional)"
              />
              <small className="text-500">
                Pais são filtrados automaticamente pelo mesmo tipo (Receita/Despesa).
              </small>
            </div>

            <div className="col-12 md:col-4">
              <label className="block text-500 text-sm mb-1">Slug (opcional)</label>
              <InputText
                className="w-full"
                value={form.slug}
                onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
              />
            </div>

            <div className="col-12 md:col-6">
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  checked={!!form.ativo}
                  onChange={(e) => setForm((s) => ({ ...s, ativo: e.value }))}
                />
                <span>Ativo</span>
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  checked={!!form.padrao}
                  onChange={(e) => setForm((s) => ({ ...s, padrao: e.value }))}
                />
                <span>Padrão</span>
              </div>
              <small className="text-500">
                O back garante 1 padrão por tipo. Ao marcar, as outras do mesmo tipo serão desmarcadas.
              </small>
            </div>
          </div>
        </Dialog>
      </div>
    </SakaiLayout>
  );
}
