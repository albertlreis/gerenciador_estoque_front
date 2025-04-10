// src/pages/UsuarioGestao.jsx
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import UsuarioForm from '../components/UsuarioForm';
import apiAuth from '../services/apiAuth';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [perfisOptions, setPerfisOptions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchUsuarios();
    fetchPerfis();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await apiAuth.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error.response?.data || error.message);
    }
  };

  const fetchPerfis = async () => {
    try {
      const response = await apiAuth.get('/perfis');
      setPerfisOptions(response.data);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error.response?.data || error.message);
    }
  };

  const openNewDialog = () => {
    setEditingUsuario(null);
    setDialogTitle('Cadastrar Usuário');
    setShowDialog(true);
  };

  const openEditDialog = (usuario) => {
    setEditingUsuario(usuario);
    setDialogTitle('Editar Usuário');
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await apiAuth.delete(`/usuarios/${id}`);
        fetchUsuarios();
      } catch (error) {
        console.error('Erro ao deletar usuário:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (usuarioData) => {
    try {
      if (editingUsuario) {
        await apiAuth.put(`/usuarios/${editingUsuario.id}`, usuarioData);
      } else {
        await apiAuth.post('/usuarios', usuarioData);
      }
      setShowDialog(false);
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error.response?.data || error.message);
      alert('Erro ao salvar usuário!');
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
      <div className="usuario-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Usuários</h2>
        <Button label="Novo Usuário" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={openNewDialog} />
        <DataTable value={usuarios} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="ativo" header="Ativo" body={(rowData) => rowData.ativo ? 'Sim' : 'Não'} />
          <Column
            field="perfis"
            header="Perfis"
            body={(rowData) => rowData.perfis ? rowData.perfis.map(perfil => perfil.nome).join(', ') : ''}
          />
          <Column header="Ações" body={actionTemplate} />
        </DataTable>
      </div>
      <Dialog header={dialogTitle} visible={showDialog} style={{ width: '500px' }} modal onHide={() => setShowDialog(false)}>
        <UsuarioForm
          initialData={editingUsuario || {}}
          perfisOptions={perfisOptions}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Usuarios;
