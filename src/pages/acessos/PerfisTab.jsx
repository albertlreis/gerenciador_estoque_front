import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
import { OverlayPanel } from 'primereact/overlaypanel';
import { Tooltip } from 'primereact/tooltip';

import apiAuth from '../../services/apiAuth';
import PerfilForm from '../../components/PerfilForm';
import TableActions from '../../components/TableActions';
import { useCrudPage } from '../../hooks/useCrudPage';

import AuthApi from '../../api/authApi';
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

const truncate = (text, max = 70) => (!text ? '-' : text.length > max ? `${text.slice(0, max)}...` : text);

export default function PerfisTab() {
  const crud = useCrudPage({
    api: apiAuth,
    resourceSingular: 'Perfil',
    endpoints: {
      list: AUTH_ENDPOINTS.perfis.base,
      create: AUTH_ENDPOINTS.perfis.base,
      update: AUTH_ENDPOINTS.perfis.byId,
      remove: AUTH_ENDPOINTS.perfis.byId,
    },
  });

  const [permissoesOptions, setPermissoesOptions] = useState([]);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [moduloFilter, setModuloFilter] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    modulosText: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const loadedRef = useRef({ list: false, permissoes: false });

  // Overlay de permissões
  const permsOpRef = useRef(null);
  const [opRow, setOpRow] = useState(null);
  const [opSearch, setOpSearch] = useState('');

  useEffect(() => {
    if (loadedRef.current.list) return;
    loadedRef.current.list = true;
    crud.reload();
  }, [crud.reload]);

  useEffect(() => {
    if (loadedRef.current.permissoes) return;
    loadedRef.current.permissoes = true;

    (async () => {
      try {
        const res = await AuthApi.permissoes.listar({ ativo: true });
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setPermissoesOptions(list);
      } catch (err) {
        console.error(err);
        crud.toastRef.current?.show?.({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar permissões',
          life: 3000,
        });
      }
    })();
  }, [crud.toastRef]);

  const rows = useMemo(() => {
    const items = Array.isArray(crud.items) ? crud.items : [];
    return items.map((r) => {
      const perms = Array.isArray(r.permissoes) ? r.permissoes : [];
      const modSet = new Set(perms.map((p) => getModuloFromSlug(p?.slug)));
      const modulos = Array.from(modSet).sort((a, b) => a.localeCompare(b));
      return {
        ...r,
        permissoesCount: perms.length,
        permissoesText: perms.map((p) => p?.nome).filter(Boolean).join(', '),
        modulos,
        modulosText: modulos.join(', '),
      };
    });
  }, [crud.items]);

  const modulosOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => (r.modulos || []).forEach((m) => set.add(m)));
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map((m) => ({ label: m, value: m }));
  }, [rows]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({ ...prev, global: { ...prev.global, value } }));
  };

  const onModuloFilterChange = (value) => {
    setModuloFilter(value);
    setFilters((prev) => ({
      ...prev,
      modulosText: { ...prev.modulosText, value: value || null },
    }));
  };

  const clearFilters = () => {
    setGlobalFilterValue('');
    setModuloFilter(null);
    setOpSearch('');
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      modulosText: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const permissoesBody = (row) => {
    const count = row?.permissoesCount || 0;
    const full = row?.permissoesText || 'Sem permissões';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tag value={`${count}`} severity={count ? 'info' : 'warning'} />
        <span title={full} style={{ flex: 1, minWidth: 0 }}>
          {truncate(full, 60)}
        </span>
        <Button
          type="button"
          className="p-button-text p-button-sm"
          icon="pi pi-eye"
          label="Ver"
          disabled={!count}
          onClick={(e) => {
            setOpRow(row);
            setOpSearch('');
            permsOpRef.current?.toggle(e);
          }}
        />
      </div>
    );
  };

  const modulosBody = (row) => {
    const mods = Array.isArray(row?.modulos) ? row.modulos : [];
    if (!mods.length) return <span className="p-text-secondary">-</span>;
    const title = mods.join(', ');
    const display = mods.slice(0, 3);

    return (
      <div title={title} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {display.map((m) => (
          <Tag key={m} value={m} />
        ))}
        {mods.length > 3 && <Tag value={`+${mods.length - 3}`} severity="secondary" />}
      </div>
    );
  };

  const descricaoBody = (row) => {
    const full = row?.descricao || '-';
    return <span title={full}>{truncate(full, 70)}</span>;
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
              placeholder="Buscar por nome, descrição, permissões..."
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
          <Button label="Novo Perfil" icon="pi pi-plus" className="p-button-success" onClick={crud.openNew} />
        </div>
      </div>
    ),
    [crud.openNew, crud.reload, crud.loadingList, globalFilterValue, moduloFilter, modulosOptions, rows.length]
  );

  const overlayPermissoes = useMemo(() => {
    const perms = Array.isArray(opRow?.permissoes) ? opRow.permissoes : [];
    const q = opSearch.trim().toLowerCase();

    const filtered = !q
      ? perms
      : perms.filter((p) => {
        const nome = String(p?.nome || '').toLowerCase();
        const slug = String(p?.slug || '').toLowerCase();
        const desc = String(p?.descricao || '').toLowerCase();
        return nome.includes(q) || slug.includes(q) || desc.includes(q);
      });

    const groups = new Map();
    filtered.forEach((p) => {
      const m = getModuloFromSlug(p?.slug);
      if (!groups.has(m)) groups.set(m, []);
      groups.get(m).push(p);
    });

    const ordered = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    ordered.forEach(([, list]) => list.sort((a, b) => String(a?.nome || '').localeCompare(String(b?.nome || ''))));

    return { filtered, ordered, total: perms.length };
  }, [opRow, opSearch]);

  return (
    <>
      <Toast ref={crud.toastRef} />
      <ConfirmPopup />
      <Tooltip target=".p-button[tooltip]" />

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
        emptyMessage="Nenhum perfil encontrado."
        filters={filters}
        globalFilterFields={['nome', 'descricao', 'permissoesText', 'modulosText']}
        stripedRows
        showGridlines
        size="small"
        removableSort
      >
        <Column field="id" header="ID" sortable style={{ width: 90 }} />
        <Column field="nome" header="Nome" sortable />
        <Column field="descricao" header="Descrição" body={descricaoBody} sortable />
        <Column field="modulosText" header="Módulos" body={modulosBody} style={{ minWidth: 220 }} />
        <Column field="permissoesCount" header="Permissões" body={permissoesBody} sortable style={{ minWidth: 360 }} />
        <Column
          header="Ações"
          body={(rowData) => (
            <TableActions rowData={rowData} onEdit={crud.openEdit} onDelete={crud.confirmDelete} />
          )}
          style={{ width: 140 }}
        />
      </DataTable>

      {/* Overlay: visualização rápida das permissões do perfil */}
      <OverlayPanel ref={permsOpRef} style={{ width: 520, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
            <div style={{ fontWeight: 700, lineHeight: 1.2 }}>
              {opRow?.nome || 'Perfil'}{' '}
              <span className="p-text-secondary" style={{ fontWeight: 400 }}>
                ({overlayPermissoes.filtered.length}/{overlayPermissoes.total})
              </span>
            </div>
            <Button
              type="button"
              className="p-button-text p-button-sm"
              icon="pi pi-pencil"
              label="Editar"
              onClick={() => {
                permsOpRef.current?.hide?.();
                crud.openEdit(opRow);
              }}
            />
          </div>

          <div className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={opSearch}
              onChange={(e) => setOpSearch(e.target.value)}
              placeholder="Buscar (nome, slug, descrição)..."
              className="w-full"
            />
          </div>

          <div style={{ maxHeight: 360, overflow: 'auto', paddingRight: 6 }}>
            {overlayPermissoes.ordered.length === 0 ? (
              <div className="p-text-secondary">Sem permissões.</div>
            ) : (
              overlayPermissoes.ordered.map(([mod, list]) => (
                <div key={mod} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Tag value={mod} />
                    <small className="p-text-secondary">{list.length}</small>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {list.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid var(--surface-border)',
                          borderRadius: 8,
                        }}
                        title={p.descricao || ''}
                      >
                        <div style={{ fontWeight: 700 }}>{p.nome}</div>
                        <small className="p-text-secondary">{p.slug}</small>
                        {!!p.descricao && (
                          <div className="p-text-secondary" style={{ marginTop: 4, fontSize: 12 }}>
                            {truncate(p.descricao, 120)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </OverlayPanel>

      <Dialog
        header={crud.dialogTitle}
        visible={crud.visible}
        modal
        style={{ width: '95%' }}
        breakpoints={{ '960px': '95vw', '640px': '100vw' }}
        onHide={crud.closeDialog}
      >
        <PerfilForm
          initialData={crud.editing || {}}
          permissoesOptions={permissoesOptions}
          onSubmit={crud.save}
          onCancel={crud.closeDialog}
          saving={crud.saving}
        />
      </Dialog>
    </>
  );
}
