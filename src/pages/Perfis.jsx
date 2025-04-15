import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import PerfilForm from '../components/PerfilForm';
import apiAuth from '../services/apiAuth';
import { Divider } from 'primereact/divider';
import TableActions from "../components/TableActions";
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';

const Perfis = () => {
  const [perfis, setPerfis] = useState([]);
  const [permissoesOptions, setPermissoesOptions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toast = useRef(null);

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
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar perfis', life: 3000 });
    }
  };

  const fetchPermissoes = async () => {
    try {
      const response = await apiAuth.get('/permissoes');
      setPermissoesOptions(response.data);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar permissões', life: 3000 });
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

  const handleDelete = (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar este perfil?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept: async () => {
        try {
          await apiAuth.delete(`/perfis/${id}`);
          // Atualiza o estado local eliminando o perfil deletado
          setPerfis(prev => prev.filter(perfil => perfil.id !== id));
          toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Perfil deletado', life: 3000 });
        } catch (error) {
          console.error('Erro ao deletar perfil:', error.response?.data || error.message);
          toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar perfil', life: 3000 });
        }
      },
      reject: () => {
        toast.current.show({ severity: 'warn', summary: 'Cancelado', detail: 'Operação cancelada', life: 3000 });
      }
    });
  };

  const handleFormSubmit = async (perfilData) => {
    try {
      if (editingPerfil) {
        const response = await apiAuth.put(`/perfis/${editingPerfil.id}`, perfilData);
        // Atualiza o estado local substituindo o perfil editado
        setPerfis(prev => prev.map(p => p.id === editingPerfil.id ? response.data : p));
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Perfil atualizado', life: 3000 });
      } else {
        const response = await apiAuth.post('/perfis', perfilData);
        // Adiciona o novo perfil ao estado local sem nova requisição
        setPerfis(prev => [...prev, response.data]);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Perfil criado', life: 3000 });
      }
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar perfil', life: 3000 });
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="perfil-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Perfis</h2>
        <Button label="Novo Perfil" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={openNewDialog} />
        <Divider type="solid" />
        <DataTable value={perfis} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="descricao" header="Descrição" sortable />
          <Column
            field="permissoes"
            header="Permissões"
            body={(rowData) =>
              rowData.permissoes && Array.isArray(rowData.permissoes) && rowData.permissoes.length > 0
                ? truncateText(rowData.permissoes.map(p => p.nome).join(', '), 50)
                : 'Sem permissões'
            }
          />
          <Column header="Ações" body={(rowData) => (
            <TableActions
              rowData={rowData}
              onEdit={openEditDialog}
              onDelete={handleDelete} // TableActions deverá encaminhar o event para a função onDelete
            />
          )} />
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
