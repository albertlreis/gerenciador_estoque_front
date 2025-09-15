import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';

import {
  listarParceiros,
  criarParceiro,
  atualizarParceiro,
  excluirParceiro,
  restaurarParceiro,
  formatDocumento
} from '../services/parceiros';

import { ParceiroForm } from '../components/ParceiroForm';
import { PERMISSOES } from '../constants/permissoes';
import usePermissions from '../hooks/usePermissions';
import SakaiLayout from '../layouts/SakaiLayout';

const STATUS_FILTROS = [
  { label: 'Todos', value: '' },
  { label: 'Ativos', value: 1 },
  { label: 'Inativos', value: 0 },
];

export default function Parceiros() {
  const toast = useRef(null);
  const abortRef = useRef(null);
  const { has } = usePermissions();

  const [loading, setLoading] = useState(false);
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);

  const [page, setPage]         = useState(0);
  const [rows, setRows]         = useState(10);
  const [sortField, setSortField] = useState('nome');
  const [sortOrder, setSortOrder] = useState(1);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [withTrashed, setWithTrashed] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (override = {}) => {
    setLoading(true);
    try { abortRef.current?.abort(); } catch (_) {}
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = {
        q: q || undefined,
        status: status !== '' ? status : undefined,
        with_trashed: withTrashed ? 'true' : undefined,
        order_by: sortField,
        order_dir: sortOrder === 1 ? 'asc' : 'desc',
        per_page: rows,
        page: page + 1,
        ...override,
      };

      const { items: list, meta } = await listarParceiros(params, { signal: controller.signal });
      setItems(list || []);
      setTotal(meta?.total ?? list?.length ?? 0);
    } catch (e) {
      const aborted = e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED' || e?.message === 'canceled';
      if (!aborted) {
        console.error(e);
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar parceiros.' });
      }
    } finally {
      setLoading(false);
    }
  }, [q, status, withTrashed, sortField, sortOrder, rows, page]);

  useEffect(() => { fetchData(); }, [page, rows, sortField, sortOrder, status, withTrashed, fetchData]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(0); fetchData({ page: 1 }); }, 400);
    return () => clearTimeout(t);
  }, [q, fetchData]);

  useEffect(() => () => { try { abortRef.current?.abort(); } catch (_) {} }, []);

  const onSubmitForm = async (payload) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await atualizarParceiro(editing.id, payload);
        toast.current?.show({ severity: 'success', summary: 'Parceiro', detail: 'Atualizado com sucesso.' });
      } else {
        await criarParceiro(payload);
        toast.current?.show({ severity: 'success', summary: 'Parceiro', detail: 'Criado com sucesso.' });
      }
      setFormVisible(false);
      setEditing(null);
      setPage(0);
      await fetchData({ page: 1 });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Falha ao salvar parceiro.';
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: msg });
    } finally {
      setSaving(false);
    }
  };

  const remover = async (row) => {
    try {
      await excluirParceiro(row.id);
      toast.current?.show({ severity: 'success', summary: 'Parceiro', detail: 'Removido (soft delete).' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover.' });
    }
  };

  const restaurar = async (row) => {
    try {
      await restaurarParceiro(row.id);
      toast.current?.show({ severity: 'success', summary: 'Parceiro', detail: 'Restaurado com sucesso.' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao restaurar.' });
    }
  };

  const canCriar   = has(PERMISSOES.PARCEIROS?.CRIAR ?? true);
  const canEditar  = has(PERMISSOES.PARCEIROS?.EDITAR ?? true);
  const canExcluir = has(PERMISSOES.PARCEIROS?.EXCLUIR ?? true);

  const confirmarExclusao = (event, row) => {
    confirmPopup({
      target: event.currentTarget,
      message: `Remover o parceiro "${row?.nome}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => remover(row),
    });
  };

  const statusBody = (row) => (
    <Tag value={row.status === 1 ? 'Ativo' : 'Inativo'} severity={row.status === 1 ? 'success' : 'danger'} rounded />
  );
  const docBody = (row) => <span>{formatDocumento(row.documento)}</span>;
  const acoesBody = (row) => {
    const isDeleted = !!row.deleted_at;
    return (
      <div className="flex gap-2">
        {canEditar && (
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-button-text"
            onClick={() => { setEditing(row); setFormVisible(true); }}
            tooltip="Editar"
          />
        )}
        {!isDeleted ? (
          canExcluir && (
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-text p-button-danger"
              onClick={(e) => confirmarExclusao(e, row)}
              tooltip="Remover"
            />
          )
        ) : (
          canEditar && (
            <Button
              icon="pi pi-refresh"
              className="p-button-rounded p-button-text"
              onClick={() => restaurar(row)}
              tooltip="Restaurar"
            />
          )
        )}
      </div>
    );
  };

  const handleClear = () => {
    setQ('');
    setStatus('');
    setWithTrashed(false);
    setPage(0);
    fetchData({ page: 1 });
  };

  const header = (
    <div className="flex flex-column md:flex-row md:align-items-end md:justify-content-between gap-3">
      <div className="flex flex-column md:flex-row gap-2 md:align-items-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Buscar por nome, e-mail, telefone, documento…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { setPage(0); fetchData({ page: 1 }); }
            }}
            style={{ minWidth: 320 }}
          />
        </span>
        <Dropdown
          options={STATUS_FILTROS}
          value={status}
          onChange={(e) => { setStatus(e.value); setPage(0); fetchData({ page: 1 }); }}
          optionLabel="label"
          optionValue="value"
          className="w-12rem"
          placeholder="Status"
        />
        <div className="flex align-items-center gap-2">
          <input
            id="withTrashed"
            type="checkbox"
            className="mr-1"
            checked={withTrashed}
            onChange={(e) => { setWithTrashed(e.target.checked); setPage(0); fetchData({ page: 1 }); }}
          />
          <label htmlFor="withTrashed" className="cursor-pointer">Mostrar removidos</label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button label="Limpar" icon="pi pi-filter-slash" className="p-button-text" onClick={handleClear} />
        {canCriar && (
          <Button label="Novo parceiro" icon="pi pi-plus" onClick={() => { setEditing(null); setFormVisible(true); }} />
        )}
      </div>
    </div>
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />

      <div className="surface-section p-4 md:p-6">
        <h2 className="text-2xl mb-3">Parceiros</h2>

        <Panel header="Gestão de Parceiros" toggleable collapsed={false} className="mb-3">
          <p className="m-0 text-600">Cadastre e gerencie parceiros (lojistas, arquitetos, representantes, etc.).</p>
        </Panel>

        <div className="card">
          <DataTable
            value={items}
            lazy
            loading={loading}
            header={header}
            paginator
            first={page * rows}
            rows={rows}
            totalRecords={total}
            onPage={(e) => { setPage(e.first / e.rows); setRows(e.rows); }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={(e) => { setSortField(e.sortField); setSortOrder(e.sortOrder); }}
            removableSort
            emptyMessage="Nenhum parceiro encontrado."
            responsiveLayout="scroll"
          >
            <Column field="nome" header="Nome" sortable style={{ minWidth: '240px' }} />
            <Column field="tipo" header="Tipo" sortable style={{ minWidth: '120px' }} />
            <Column field="documento" header="Documento" body={docBody} style={{ minWidth: '170px' }} />
            <Column field="email" header="E-mail" style={{ minWidth: '220px' }} />
            <Column field="telefone" header="Telefone" style={{ minWidth: '150px' }} />
            <Column field="status" header="Status" body={statusBody} sortable style={{ width: '140px' }} />
            <Column
              field="updated_at"
              header="Atualizado em"
              sortable
              style={{ minWidth: '180px' }}
              body={(row) => (row.updated_at ? new Date(row.updated_at).toLocaleString() : '')}
            />
            <Column header="Ações" body={acoesBody} style={{ width: '160px' }} exportable={false} />
          </DataTable>
        </div>
      </div>

      <ParceiroForm
        visible={formVisible}
        onHide={() => { setFormVisible(false); setEditing(null); }}
        initialData={editing}
        onSubmit={onSubmitForm}
        loading={saving}
      />
    </SakaiLayout>
  );
}
