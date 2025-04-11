import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import PerfilForm from '../components/PerfilForm';
import apiAuth from '../services/apiAuth';

const Perfis = () => {
  const [perfis, setPerfis] = useState([]);
  const [permissoesOptions, setPermissoesOptions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchPerfis();
    fetchPermissoes();
  }, []);

  const fetchPerfis = async () => {
    try {
      const response = await apiAuth.get('/perfis');
      setPerfis(response.data);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error.response?.data || error.message);
    }
  };

  const fetchPermissoes = async () => {
    try {
      const response = await apiAuth.get('/permissoes');
      setPermissoesOptions(response.data);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error.response?.data || error.message);
    }
  };

  const openNewDialog = () => {
    setEditingPerfil(null);
    setDialogTitle('Cadastrar Perfil');
    setShowDialog(true);
  };

  const openEditDialog = (perfil) => {
    setEditingPerfil(perfil);
    setDialogTitle('Editar Perfil');
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este perfil?')) {
      try {
        await apiAuth.delete(`/perfis/${id}`);
        fetchPerfis();
      } catch (error) {
        console.error('Erro ao deletar perfil:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (perfilData) => {
    try {
      if (editingPerfil) {
        await apiAuth.put(`/perfis/${editingPerfil.id}`, perfilData);
      } else {
        await apiAuth.post('/perfis', perfilData);
      }
      setShowDialog(false);
      fetchPerfis();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error.response?.data || error.message);
      alert('Erro ao salvar perfil!');
    }
  };

  const actionTemplate = (rowData) => (
    <>
      <Button label="Editar" icon="pi pi-pencil" className="p-button-rounded p-button-info p-mr-2" onClick={() => openEditDialog(rowData)} />
      <Button label="Excluir" icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDelete(rowData.id)} />
    </>
  );

  return (
    <SakaiLayout>
      <div className="perfil-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Perfis</h2>
        <Button label="Novo Perfil" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={openNewDialog} />
        <DataTable value={perfis} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="descricao" header="Descrição" sortable />
          <Column field="permissoes" header="Permissões" body={(rowData) => rowData.permissoes.map(p => p.nome).join(', ')} />
          <Column header="Ações" body={actionTemplate} />
        </DataTable>
      </div>
      <Dialog header={dialogTitle} visible={showDialog} style={{ width: '500px' }} modal onHide={() => setShowDialog(false)}>
        <PerfilForm
          initialData={editingPerfil || {}}
          permissoesOptions={permissoesOptions}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Perfis;
