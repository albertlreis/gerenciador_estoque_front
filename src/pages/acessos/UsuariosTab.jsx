import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';

import apiAuth from '../../services/apiAuth';
import UsuarioForm from '../../components/UsuarioForm';
import TableActions from '../../components/TableActions';
import { useCrudPage } from '../../hooks/useCrudPage';

import AuthApi from '../../api/authApi';
import AUTH_ENDPOINTS from '../../constants/endpointsAuth';

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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({ ...prev, global: { ...prev.global, value } }));
  };

  const ativoBody = (row) =>
    row?.ativo ? <Tag value="Ativo" severity="success" /> : <Tag value="Inativo" severity="danger" />;

  const perfisBody = (row) => (row?.perfis?.length ? row.perfis.map((p) => p.nome).join(', ') : '-');

  const header = useMemo(
    () => (
      <div className="p-d-flex p-jc-between p-ai-center" style={{ gap: 12 }}>
        <div className="p-input-icon-left" style={{ flex: 1, maxWidth: 420 }}>
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar por nome, email..."
            className="w-full"
          />
        </div>

        <Button label="Novo Usuário" icon="pi pi-plus" className="p-button-success" onClick={crud.openNew} />
      </div>
    ),
    [crud.openNew, globalFilterValue]
  );

  return (
    <>
      <Toast ref={crud.toastRef} />
      <ConfirmPopup />

      <Divider />

      <DataTable
        value={crud.items}
        loading={crud.loadingList}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
        dataKey="id"
        responsiveLayout="scroll"
        emptyMessage="Nenhum usuário encontrado."
        filters={filters}
        globalFilterFields={['nome', 'email']}
      >
        <Column field="id" header="ID" sortable style={{ width: 90 }} />
        <Column field="nome" header="Nome" sortable />
        <Column field="email" header="Email" sortable />
        <Column header="Status" body={ativoBody} style={{ width: 140 }} />
        <Column header="Perfis" body={perfisBody} />
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
        style={{ width: '560px' }}
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
