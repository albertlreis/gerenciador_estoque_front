import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';

import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import AssistenciaForm from '../components/assistencia/AssistenciaForm';

const AssistenciasAutorizadas = () => {
  const toast = useRef(null);

  const [itens, setItens] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazy, setLazy] = useState({ first: 0, rows: 10, page: 0 });
  const [loading, setLoading] = useState(false);

  const [filtroNome, setFiltroNome] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [editing, setEditing] = useState(null);

  const onPage = (e) => setLazy(e);

  const fetchLista = async () => {
    setLoading(true);
    try {
      const params = {
        page: lazy.page + 1,
        per_page: lazy.rows,
      };
      if (filtroNome?.trim()) params.nome = filtroNome.trim();

      // REST padrão: /assistencias (autorizadas)
      const resp = await apiEstoque.get('/assistencias', { params });
      const { data, meta } = resp.data?.data ? resp.data : { data: resp.data, meta: { total: resp.data?.length || 0 } };
      setItens(data);
      setTotalRecords(meta?.total || 0);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar assistências', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLista(); /* eslint-disable-next-line */ }, [lazy]);

  const openNew = () => {
    setEditing(null);
    setDialogTitle('Cadastrar Assistência');
    setDialogVisible(true);
  };

  const openEdit = async (row) => {
    try {
      const resp = await apiEstoque.get(`/assistencias/${row.id}`);
      setEditing(resp.data?.data || resp.data);
      setDialogTitle('Editar Assistência');
      setDialogVisible(true);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar assistência', life: 3000 });
    }
  };

  const handleDelete = (row) => {
    confirmDialog({
      message: `Deseja realmente excluir a assistência "${row.nome}"?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await apiEstoque.delete(`/assistencias/${row.id}`);
          await fetchLista();
          toast.current?.show({ severity: 'success', summary: 'Excluída', detail: 'Assistência removida', life: 2500 });
        } catch (e) {
          const detail = e?.response?.data?.message || 'Não foi possível excluir.';
          toast.current?.show({ severity: 'error', summary: 'Erro', detail, life: 4000 });
        }
      }
    });
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing?.id) {
        await apiEstoque.put(`/assistencias/${editing.id}`, payload);
        toast.current?.show({ severity: 'success', summary: 'Atualizada', detail: 'Assistência salva', life: 2500 });
      } else {
        await apiEstoque.post('/assistencias', payload);
        toast.current?.show({ severity: 'success', summary: 'Cadastrada', detail: 'Assistência criada', life: 2500 });
      }
      setDialogVisible(false);
      await fetchLista();
    } catch (e) {
      // mensagens de validação da API
      if (e?.response?.data?.errors) {
        const erros = Object.values(e.response.data.errors).flat().join('\n');
        toast.current?.show({ severity: 'error', summary: 'Validação', detail: erros, life: 6000 });
      } else {
        const detail = e?.response?.data?.message || 'Erro ao salvar assistência';
        toast.current?.show({ severity: 'error', summary: 'Erro', detail, life: 3500 });
      }
      throw e;
    }
  };

  const leftToolbar = () => (
    <div className="flex gap-2">
      <Button label="Nova Assistência" icon="pi pi-plus" onClick={openNew} />
      <Button label="Atualizar" icon="pi pi-refresh" onClick={fetchLista} className="p-button-secondary" />
    </div>
  );

  const rightToolbar = () => (
    <div className="flex gap-2">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          placeholder="Buscar por nome"
        />
      </span>
      <Button label="Filtrar" icon="pi pi-filter" outlined onClick={() => setLazy(prev => ({ ...prev, page: 0, first: 0 }))} />
      <Button label="Limpar" icon="pi pi-times" text onClick={() => { setFiltroNome(''); setLazy(prev => ({ ...prev, page: 0, first: 0 })); }} />
    </div>
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} position="top-center" />
      <ConfirmDialog />

      <div className="p-4">
        <div className="mb-3">
          <Toolbar left={leftToolbar} right={rightToolbar} />
        </div>

        <DataTable
          value={itens}
          lazy
          paginator
          first={lazy.first}
          rows={lazy.rows}
          totalRecords={totalRecords}
          onPage={onPage}
          dataKey="id"
          loading={loading}
          responsiveLayout="scroll"
          emptyMessage="Nenhuma assistência encontrada"
        >
          <Column field="id" header="ID" />
          <Column field="nome" header="Nome" />
          <Column field="documento" header="Documento" />
          <Column field="telefone" header="Telefone" />
          <Column field="email" header="E-mail" />
          <Column field="prazo_sla_dias" header="SLA (dias)" />
          <Column
            header="Ações"
            body={(row) => (
              <div className="flex gap-2 justify-content-center">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" onClick={() => openEdit(row)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDelete(row)} />
              </div>
            )}
            style={{ width: 120, textAlign: 'center' }}
          />
        </DataTable>
      </div>

      <Dialog header={dialogTitle} visible={dialogVisible} style={{ width: 900 }} modal onHide={() => setDialogVisible(false)}>
        <AssistenciaForm
          initialData={editing || {}}
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => setDialogVisible(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default AssistenciasAutorizadas;
