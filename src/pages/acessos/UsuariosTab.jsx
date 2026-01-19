import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Tooltip } from 'primereact/tooltip';
import { FilterMatchMode } from 'primereact/api';

import apiAuth from '../../services/apiAuth';
import UsuarioForm from '../../components/UsuarioForm';
import TableActions from '../../components/TableActions';
import { useCrudPage } from '../../hooks/useCrudPage';

import AuthApi from '../../api/authApi';
import AUTH_ENDPOINTS from '../../constants/endpointsAuth';
import {formatDatePtBR} from "../../utils/date/dateHelpers";

const resolveById = (byId, id) => {
  if (typeof byId === 'function') return byId(id);
  return String(byId || '')
    .replace(':id', String(id))
    .replace('{id}', String(id));
};

const truncate = (text, max = 70) => (!text ? '-' : text.length > max ? `${text.slice(0, max)}...` : text);

const parseDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const fmtDate = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d);
};

const fmtDateTime = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
};

export default function UsuariosTab() {
  const crud = useCrudPage({
    api: apiAuth,
    resourceSingular: 'Usuário',
    endpoints: {
      list: AUTH_ENDPOINTS.usuarios.base,
      create: AUTH_ENDPOINTS.usuarios.base,
      update: AUTH_ENDPOINTS.usuarios.byId,
      remove: AUTH_ENDPOINTS.usuarios.byId,
    },
  });

  const [perfisOptions, setPerfisOptions] = useState([]);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [statusFilter, setStatusFilter] = useState(null); // null | true | false
  const [perfisFilter, setPerfisFilter] = useState([]); // array de ids

  const loadedRef = useRef({ list: false, perfis: false });

  useEffect(() => {
    if (loadedRef.current.list) return;
    loadedRef.current.list = true;
    crud.reload();
  }, [crud.reload]);

  useEffect(() => {
    if (loadedRef.current.perfis) return;
    loadedRef.current.perfis = true;

    (async () => {
      try {
        const res = await AuthApi.perfis.listar({ ativo: true });
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setPerfisOptions(list);
      } catch (err) {
        console.error(err);
        crud.toastRef.current?.show?.({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar perfis',
          life: 3000,
        });
      }
    })();
  }, [crud.toastRef]);

  const rows = useMemo(() => {
    const items = Array.isArray(crud.items) ? crud.items : [];

    return items.map((u) => {
      const perfis = Array.isArray(u.perfis) ? u.perfis : [];
      const perfisNomes = perfis.map((p) => p?.nome).filter(Boolean);
      const perfisIds = perfis.map((p) => p?.id).filter((v) => v !== null && v !== undefined);

      // tenta cobrir variações comuns de campo
      const createdRaw = u.created_at ?? u.createdAt ?? u.criado_em ?? u.criadoEm;
      const lastLoginRaw =
        u.ultimo_login_at ??
        u.ultimoLoginAt ??
        u.last_login_at ??
        u.lastLoginAt ??
        u.last_login ??
        u.lastLogin ??
        u.ultimo_login ??
        u.ultimoLogin;

      const createdAtDate = parseDate(createdRaw);
      const lastLoginDate = parseDate(lastLoginRaw);

      return {
        ...u,
        perfisIds,
        perfisCount: perfisIds.length,
        perfisText: perfisNomes.join(', '),

        // para ordenar corretamente no DataTable
        createdAtTs: createdAtDate ? createdAtDate.getTime() : -1,
        ultimoLoginTs: lastLoginDate ? lastLoginDate.getTime() : -1,

        // para exibir e também poder filtrar pelo globalFilter se quiser
        createdAtText: fmtDate(createdAtDate),
        ultimoLoginText: fmtDateTime(lastLoginDate),

        // para tooltip com valor completo
        createdAtIso: createdAtDate ? createdAtDate.toISOString() : '',
        ultimoLoginIso: lastLoginDate ? lastLoginDate.toISOString() : '',
      };
    });
  }, [crud.items]);

  // Filtragem extra (status + perfis) antes de entrar no DataTable
  const filteredRows = useMemo(() => {
    let list = rows;

    if (statusFilter !== null) {
      list = list.filter((u) => !!u.ativo === statusFilter);
    }

    if (perfisFilter?.length) {
      const set = new Set(perfisFilter.map(String));
      list = list.filter((u) => (u.perfisIds || []).some((id) => set.has(String(id))));
    }

    return list;
  }, [rows, statusFilter, perfisFilter]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({ ...prev, global: { ...prev.global, value } }));
  };

  const clearFilters = () => {
    setGlobalFilterValue('');
    setStatusFilter(null);
    setPerfisFilter([]);
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const statusOptions = useMemo(
    () => [
      { label: 'Todos', value: null },
      { label: 'Ativos', value: true },
      { label: 'Inativos', value: false },
    ],
    []
  );

  const copyToClipboard = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        crud.toastRef.current?.show?.({
          severity: 'success',
          summary: 'Copiado',
          detail: 'Copiado para a área de transferência',
          life: 1800,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [crud.toastRef]
  );

  const toggleAtivo = useCallback(
    (event, row) => {
      const next = !row?.ativo;
      const nome = row?.nome || 'usuário';

      confirmPopup({
        target: event.currentTarget,
        message: next ? `Ativar ${nome}?` : `Desativar ${nome}?`,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: next ? 'Ativar' : 'Desativar',
        rejectLabel: 'Cancelar',
        accept: async () => {
          try {
            const url = resolveById(AUTH_ENDPOINTS.usuarios.byId, row.id);
            await apiAuth.put(url, { ativo: next });

            crud.toastRef.current?.show?.({
              severity: 'success',
              summary: 'Sucesso',
              detail: next ? 'Usuário ativado' : 'Usuário desativado',
              life: 2500,
            });

            crud.reload();
          } catch (err) {
            console.error(err);
            crud.toastRef.current?.show?.({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível alterar o status do usuário',
              life: 3000,
            });
          }
        },
      });
    },
    [crud.reload, crud.toastRef]
  );

  const ativoBody = (row) => {
    const ativo = !!row?.ativo;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag value={ativo ? 'Ativo' : 'Inativo'} severity={ativo ? 'success' : 'danger'} />
        <Button
          type="button"
          className="p-button-text p-button-sm"
          icon={ativo ? 'pi pi-ban' : 'pi pi-check'}
          tooltip={ativo ? 'Desativar' : 'Ativar'}
          onClick={(e) => toggleAtivo(e, row)}
          disabled={crud.loadingList}
        />
      </div>
    );
  };

  const perfisBody = (row) => {
    const perfis = Array.isArray(row?.perfis) ? row.perfis : [];
    const nomes = perfis.map((p) => p?.nome).filter(Boolean);
    if (!nomes.length) return <span className="p-text-secondary">-</span>;

    const title = nomes.join(', ');
    const show = nomes.slice(0, 3);

    return (
      <div title={title} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {show.map((n) => (
          <Tag key={n} value={n} />
        ))}
        {nomes.length > 3 && <Tag value={`+${nomes.length - 3}`} severity="secondary" />}
      </div>
    );
  };

  const emailBody = (row) => {
    const email = row?.email || '-';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span title={email} style={{ minWidth: 0, flex: 1 }}>
          {truncate(email, 40)}
        </span>
        {email !== '-' && (
          <Button
            type="button"
            className="p-button-text p-button-sm"
            icon="pi pi-copy"
            tooltip="Copiar e-mail"
            onClick={() => copyToClipboard(email)}
          />
        )}
      </div>
    );
  };

  const createdAtBody = (row) => {
    const text = formatDatePtBR(row?.created_at) || '-';
    const iso = row?.createdAtIso || '';
    return <span title={iso || text}>{text}</span>;
  };

  const ultimoLoginBody = (row) => {
    const text = formatDatePtBR(row?.ultimo_login) || '-';
    const iso = row?.ultimoLoginIso || '';
    return <span title={iso || text}>{text}</span>;
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
              placeholder="Buscar por nome, e-mail, perfis..."
              className="w-full"
            />
          </div>

          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => setStatusFilter(e.value)}
            placeholder="Status..."
            style={{ minWidth: 180 }}
          />

          <MultiSelect
            value={perfisFilter}
            options={perfisOptions}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setPerfisFilter(e.value || [])}
            placeholder="Filtrar por perfis..."
            display="chip"
            filter
            maxSelectedLabels={2}
            selectedItemsLabel="{0} perfis"
            style={{ minWidth: 260 }}
          />

          <div className="p-text-secondary" style={{ fontSize: 12 }}>
            Total: <b>{filteredRows.length}</b>
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
          <Button label="Novo Usuário" icon="pi pi-plus" className="p-button-success" onClick={crud.openNew} />
        </div>
      </div>
    ),
    [
      crud.openNew,
      crud.reload,
      crud.loadingList,
      globalFilterValue,
      statusFilter,
      statusOptions,
      perfisFilter,
      perfisOptions,
      filteredRows.length,
    ]
  );

  return (
    <>
      <Toast ref={crud.toastRef} />
      <ConfirmPopup />
      <Tooltip target=".p-button[tooltip]" />

      <Divider />

      <DataTable
        value={filteredRows}
        loading={crud.loadingList}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
        dataKey="id"
        responsiveLayout="scroll"
        emptyMessage="Nenhum usuário encontrado."
        filters={filters}
        globalFilterFields={['nome', 'email', 'perfisText']}
        stripedRows
        showGridlines
        size="small"
        removableSort
      >
        <Column field="id" header="ID" sortable style={{ width: 90 }} />
        <Column field="nome" header="Nome" sortable style={{ minWidth: 240 }} />
        <Column field="email" header="Email" body={emailBody} sortable style={{ minWidth: 260 }} />

        {/* NOVAS COLUNAS */}
        <Column
          field="ultimoLoginTs"
          header="Último login"
          sortable
          body={ultimoLoginBody}
          style={{ width: 170 }}
        />
        <Column
          field="createdAtTs"
          header="Criado em"
          sortable
          body={createdAtBody}
          style={{ width: 140 }}
        />

        <Column header="Status" body={ativoBody} style={{ width: 160 }} />
        <Column field="perfisCount" header="Qtd. Perfis" sortable style={{ width: 130 }} />
        <Column header="Perfis" body={perfisBody} style={{ minWidth: 260 }} />
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
        className="p-fluid"
        style={{ width: '720px' }}
        breakpoints={{ '960px': '95vw', '640px': '100vw' }}
        onHide={crud.closeDialog}
      >
        <UsuarioForm
          initialData={crud.editing || {}}
          perfisOptions={perfisOptions}
          onSubmit={crud.save}
          onCancel={crud.closeDialog}
          saving={crud.saving}
        />
      </Dialog>
    </>
  );
}
