import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import PermissaoForm from '../components/PermissaoForm';
import apiAuth from '../services/apiAuth';
import {Divider} from "primereact/divider";
import TableActions from "../components/TableActions";

const Permissoes = () => {
  const [permissoes, setPermissoes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPermissao, setEditingPermissao] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchPermissoes();
  }, []);

  const fetchPermissoes = async () => {
    try {
      const response = await apiAuth.get('/permissoes');
      setPermissoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error.response?.data || error.message);
    }
  };

  const openNewDialog = () => {
    setEditingPermissao(null);
    setDialogTitle('Cadastrar Permissão');
    setShowDialog(true);
  };

  const openEditDialog = (permissao) => {
    setEditingPermissao(permissao);
    setDialogTitle('Editar Permissão');
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta permissão?')) {
      try {
        await apiAuth.delete(`/permissoes/${id}`);
        fetchPermissoes();
      } catch (error) {
        console.error('Erro ao deletar permissão:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (permissaoData) => {
    try {
      if (editingPermissao) {
        await apiAuth.put(`/permissoes/${editingPermissao.id}`, permissaoData);
      } else {
        await apiAuth.post('/permissoes', permissaoData);
      }
      setShowDialog(false);
      fetchPermissoes();
    } catch (error) {
      console.error('Erro ao salvar permissão:', error.response?.data || error.message);
      alert('Erro ao salvar permissão!');
    }
  };

  return (
    <SakaiLayout>
      <div className="permissao-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Permissões</h2>
        <Button label="Nova Permissão" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={openNewDialog} />
        <Divider type="solid" />
        <DataTable value={permissoes} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="descricao" header="Descrição" sortable />
          <Column header="Ações" body={(rowData) => (
            <TableActions rowData={rowData} onEdit={openEditDialog} onDelete={handleDelete} />
          )} />
        </DataTable>
      </div>
      <Dialog header={dialogTitle} visible={showDialog} style={{ width: '500px' }} modal onHide={() => setShowDialog(false)}>
        <PermissaoForm
          initialData={editingPermissao || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Permissoes;
