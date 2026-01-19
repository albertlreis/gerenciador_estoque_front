import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';

import apiAuth from '../../services/apiAuth';
import PermissaoForm from '../../components/PermissaoForm';
import TableActions from '../../components/TableActions';
import { useCrudPage } from '../../hooks/useCrudPage';

import AUTH_ENDPOINTS from '../../constants/endpointsAuth';

const toTitleCase = (s) =>
  String(s || '')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const getModuloFromSlug = (slug) => {
  const s = String(slug || '').toLowerCase();

  const rules = [
    ['contas.pagar.', 'Contas a Pagar'],
    ['contas.receber.', 'Contas a Receber'],
    ['financeiro.', 'Financeiro'],
    ['despesas_recorrentes.', 'Despesas Recorrentes'],
    ['comunicacao.', 'Comunicação'],
    ['produto_variacoes.', 'Variações'],
    ['produtos.outlet.', 'Outlet'],
    ['pedidos_fabrica.', 'Pedidos Fábrica'],
  ];

  for (const [prefix, label] of rules) {
    if (s.startsWith(prefix)) return label;
  }

  const first = String(slug || '').split('.')[0];
  return first ? toTitleCase(first) : 'Outros';
};

const truncate = (text, max = 80) => (!text ? '-' : text.length > max ? `${text.slice(0, max)}...` : text);

export default function PermissoesTab() {
  const crud = useCrudPage({
    api: apiAuth,
    resourceSingular: 'Permissão',
    endpoints: {
      list: AUTH_ENDPOINTS.permissoes.base,
      create: AUTH_ENDPOINTS.permissoes.base,
      update: AUTH_ENDPOINTS.permissoes.byId,
      remove: AUTH_ENDPOINTS.permissoes.byId,
    },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [moduloFilter, setModuloFilter] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    modulo: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    crud.reload();
  }, [crud.reload]);

  const rows = useMemo(() => {
    const items = Array.isArray(crud.items) ? crud.items : [];
    return items.map((p) => ({
      ...p,
      modulo: getModuloFromSlug(p?.slug),
    }));
  }, [crud.items]);

  const modulosOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => set.add(r.modulo));
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map((m) => ({ label: m, value: m }));
  }, [rows]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({ ...prev, global: { ...prev.global, value } }));
  };

  const onModuloFilterChange = (value) => {
    setModuloFilter(value);
    setFilters((prev) => ({ ...prev, modulo: { ...prev.modulo, value: value || null } }));
  };

  const clearFilters = () => {
    setGlobalFilterValue('');
    setModuloFilter(null);
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      modulo: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const slugBody = (row) => {
    const slug = row?.slug || '-';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <code title={slug} style={{ fontSize: 12 }}>{truncate(slug, 40)}</code>
        {slug !== '-' && (
          <Button
            type="button"
            className="p-button-text p-button-sm copy-slug-btn"
            icon="pi pi-copy"
            tooltip="Copiar slug"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(slug);
                crud.toastRef.current?.show?.({
                  severity: 'success',
                  summary: 'Copiado',
                  detail: 'Slug copiado para a área de transferência',
                  life: 2000,
                });
              } catch (e) {
                console.error(e);
              }
            }}
          />
        )}
      </div>
    );
  };

  const moduloBody = (row) => <Tag value={row?.modulo || 'Outros'} />;

  const descricaoBody = (row) => {
    const full = row?.descricao || '-';
    return <span title={full}>{truncate(full, 90)}</span>;
  };

  const header = useMemo(
    () => (
      <div className="p-d-flex p-jc-between p-ai-center" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div className="p-d-flex p-ai-center" style={{ gap: 10, flexWrap: 'wrap', flex: 1 }}>
          <div className="p-input-icon-left" style={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Buscar por nome, slug, descrição..."
              className="w-full"
            />
          </div>

          <Dropdown
            value={moduloFilter}
            options={modulosOptions}
            onChange={(e) => onModuloFilterChange(e.value)}
            placeholder="Filtrar por módulo..."
            showClear
            style={{ minWidth: 240 }}
          />

          <div className="p-text-secondary" style={{ fontSize: 12 }}>
            Total: <b>{rows.length}</b>
          </div>
        </div>

        <div className="p-d-flex p-ai-center" style={{ gap: 8 }}>
          <Button
            type="button"
            icon="pi pi-refresh"
            className="p-button-text"
            tooltip="Atualizar"
            onClick={crud.reload}
            disabled={crud.loadingList}
          />
          <Button
            type="button"
            icon="pi pi-filter-slash"
            className="p-button-text"
            tooltip="Limpar filtros"
            onClick={clearFilters}
            disabled={crud.loadingList}
          />
          <Button label="Nova Permissão" icon="pi pi-plus" className="p-button-success" onClick={crud.openNew} />
        </div>
      </div>
    ),
    [crud.openNew, crud.reload, crud.loadingList, globalFilterValue, moduloFilter, modulosOptions, rows.length]
  );

  return (
    <>
      <Toast ref={crud.toastRef} />
      <ConfirmPopup />
      <Tooltip target=".p-button[tooltip], .copy-slug-btn" />

      <Divider />

      <DataTable
        value={rows}
        loading={crud.loadingList}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
        dataKey="id"
        responsiveLayout="scroll"
        emptyMessage="Nenhuma permissão encontrada."
        filters={filters}
        globalFilterFields={['nome', 'slug', 'descricao', 'modulo']}
        stripedRows
        showGridlines
        size="small"
        removableSort
      >
        <Column field="id" header="ID" sortable style={{ width: 90 }} />
        <Column field="nome" header="Nome" sortable style={{ minWidth: 260 }} />
        <Column field="modulo" header="Módulo" body={moduloBody} sortable style={{ width: 220 }} />
        <Column field="slug" header="Slug" body={slugBody} sortable style={{ minWidth: 260 }} />
        <Column field="descricao" header="Descrição" body={descricaoBody} sortable />
        <Column
          header="Ações"
          body={(rowData) => (
            <TableActions rowData={rowData} onEdit={crud.openEdit} onDelete={crud.confirmDelete} />
          )}
          style={{ width: 140 }}
        />
      </DataTable>

      <Dialog
        header={crud.dialogTitle}
        visible={crud.visible}
        modal
        style={{ width: '560px' }}
        breakpoints={{ '960px': '95vw', '640px': '100vw' }}
        onHide={crud.closeDialog}
      >
        <PermissaoForm
          initialData={crud.editing || {}}
          onSubmit={crud.save}
          onCancel={crud.closeDialog}
          saving={crud.saving}
        />
      </Dialog>
    </>
  );
}
