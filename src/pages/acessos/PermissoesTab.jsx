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
import PermissaoForm from '../../components/PermissaoForm';
import TableActions from '../../components/TableActions';
import { useCrudPage } from '../../hooks/useCrudPage';

import AUTH_ENDPOINTS from '../../constants/endpointsAuth';

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
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    crud.reload();
  }, [crud.reload]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters((prev) => ({ ...prev, global: { ...prev.global, value } }));
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

        <Button label="Nova Permissão" icon="pi pi-plus" className="p-button-success" onClick={crud.openNew} />
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
        emptyMessage="Nenhuma permissão encontrada."
        filters={filters}
        globalFilterFields={['nome', 'descricao']}
      >
        <Column field="id" header="ID" sortable style={{ width: 90 }} />
        <Column field="nome" header="Nome" sortable />
        <Column field="descricao" header="Descrição" sortable />
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
        style={{ width: '520px' }}
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
