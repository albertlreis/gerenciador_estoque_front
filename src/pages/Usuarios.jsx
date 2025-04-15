import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import SakaiLayout from '../layouts/SakaiLayout';
import UsuarioForm from '../components/UsuarioForm';
import apiAuth from '../services/apiAuth';
import TableActions from "../components/TableActions";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [perfisOptions, setPerfisOptions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toast = useRef(null);

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
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários', life: 3000 });
    }
  };

  const fetchPerfis = async () => {
    try {
      const response = await apiAuth.get('/perfis');
      setPerfisOptions(response.data);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar perfis', life: 3000 });
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

  // Atualizamos a função de exclusão para usar confirmPopup.
  const handleDelete = (event, usuarioId) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar este usuário?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept: async () => {
        try {
          await apiAuth.delete(`/usuarios/${usuarioId}`);
          setUsuarios(prev => prev.filter(usuario => usuario.id !== usuarioId));
          toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário deletado', life: 3000 });
        } catch (error) {
          console.error('Erro ao deletar usuário:', error.response?.data || error.message);
          toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar usuário', life: 3000 });
        }
      },
      reject: () => {
        toast.current.show({ severity: 'warn', summary: 'Cancelado', detail: 'Operação cancelada', life: 3000 });
      }
    });
  };

  const handleFormSubmit = async (usuarioData) => {
    try {
      if (editingUsuario) {
        const response = await apiAuth.put(`/usuarios/${editingUsuario.id}`, usuarioData);
        setUsuarios(prev => prev.map(u => u.id === editingUsuario.id ? response.data : u));
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário atualizado', life: 3000 });
      } else {
        const response = await apiAuth.post('/usuarios', usuarioData);
        setUsuarios(prev => [...prev, response.data]);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário criado', life: 3000 });
      }
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar usuário', life: 3000 });
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="p-grid">
        <div className="p-col-12">
          <h2>Gestão de Usuários</h2>
        </div>
        <div className="p-col-12 p-d-flex p-jc-end p-mb-2">
          <Button
            label="Novo Usuário"
            icon="pi pi-plus"
            severity="success"
            onClick={openNewDialog}
          />
        </div>
        <div className="p-col-12">
          <Divider />
          <DataTable value={usuarios} paginator rows={10} dataKey="id" responsiveLayout="scroll">
            <Column field="id" header="ID" sortable />
            <Column field="nome" header="Nome" sortable />
            <Column field="email" header="Email" sortable />
            <Column field="ativo" header="Ativo" body={(rowData) => rowData.ativo ? 'Sim' : 'Não'} />
            <Column
              field="perfis"
              header="Perfis"
              body={(rowData) =>
                rowData.perfis ? rowData.perfis.map(perfil => perfil.nome).join(', ') : ''
              }
            />
            <Column
              header="Ações"
              body={(rowData) => (
                <TableActions
                  rowData={rowData}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              )}
            />
          </DataTable>
        </div>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        modal
        className="p-fluid"
        style={{ width: '500px' }}
        onHide={() => setShowDialog(false)}
      >
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
