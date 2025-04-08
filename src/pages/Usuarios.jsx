import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import UsuarioForm from '../components/UsuarioForm';
import apiAuth from '../services/apiAuth'; // Usando a instância da API de autenticação

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await apiAuth.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error.response?.data || error.message);
    }
  };

  const openNewUsuarioDialog = () => {
    setEditingUsuario(null);
    setDialogTitle('Cadastrar Usuário');
    setShowDialog(true);
  };

  const openEditUsuarioDialog = (usuario) => {
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
        // Atualiza usuário (se a senha estiver em branco, pode-se optar por não atualizá-la, dependendo da lógica do backend)
        await apiAuth.put(`/usuarios/${editingUsuario.id}`, usuarioData);
      } else {
        // Cria novo usuário
        await apiAuth.post('/usuarios', usuarioData);
      }
      setShowDialog(false);
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error.response?.data || error.message);
      alert('Erro ao salvar usuário!');
    }
  };

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        label="Editar"
        icon="pi pi-pencil"
        className="p-button-rounded p-button-info p-mr-2"
        onClick={() => openEditUsuarioDialog(rowData)}
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => handleDelete(rowData.id)}
      />
    </>
  );

  return (
    <SakaiLayout>
      <div className="usuario-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Usuários</h2>
        <Button
          label="Novo Usuário"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewUsuarioDialog}
        />
        <DataTable value={usuarios} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="ativo" header="Ativo" body={(rowData) => (rowData.ativo ? 'Sim' : 'Não')} />
          <Column header="Ações" body={actionBodyTemplate} />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '450px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <UsuarioForm
          initialData={editingUsuario || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Usuarios;
