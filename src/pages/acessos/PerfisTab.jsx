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

import apiAuth from '../../services/apiAuth';
import PerfilForm from '../../components/PerfilForm';
import TableActions from '../../components/TableActions';
import { useCrudPage } from '../../hooks/useCrudPage';

import AuthApi from '../../api/authApi';
import AUTH_ENDPOINTS from '../../constants/endpointsAuth';

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
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const loadedRef = useRef({ list: false, permissoes: false });

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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({ ...prev, global: { ...prev.global, value } }));
  };

  const truncate = (text, max = 60) => (!text ? '-' : text.length > max ? `${text.slice(0, max)}...` : text);

  const permissoesBody = (row) => {
    const full = row?.permissoes?.length ? row.permissoes.map((p) => p.nome).join(', ') : 'Sem permissões';
    return <span title={full}>{truncate(full, 60)}</span>;
  };

  const header = useMemo(
    () => (
      <div className="p-d-flex p-jc-between p-ai-center" style={{ gap: 12 }}>
        <div className="p-input-icon-left" style={{ flex: 1, maxWidth: 420 }}>
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar por nome, descrição..."
            className="w-full"
          />
        </div>

        <Button label="Novo Perfil" icon="pi pi-plus" className="p-button-success" onClick={crud.openNew} />
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
        emptyMessage="Nenhum perfil encontrado."
        filters={filters}
        globalFilterFields={['nome', 'descricao']}
      >
        <Column field="id" header="ID" sortable style={{ width: 90 }} />
        <Column field="nome" header="Nome" sortable />
        <Column field="descricao" header="Descrição" sortable />
        <Column header="Permissões" body={permissoesBody} />
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
