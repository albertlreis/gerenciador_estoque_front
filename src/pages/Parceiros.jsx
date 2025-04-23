import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import SakaiLayout from '../layouts/SakaiLayout';
import ParceiroForm from '../components/ParceiroForm';
import apiEstoque from '../services/apiEstoque';
import { Divider } from 'primereact/divider';
import TableActions from '../components/TableActions';

const Parceiros = () => {
  const [parceiros, setParceiros] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const toast = useRef(null);

  useEffect(() => {
    fetchParceiros();
  }, []);

  const fetchParceiros = async () => {
    setTableLoading(true);
    try {
      const response = await apiEstoque.get('/parceiros');
      setParceiros(response.data);
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar parceiros!', life: 3000 });
    } finally {
      setTableLoading(false);
    }
  };

  const openNewDialog = () => {
    setShowDialog(true);
    setEditingParceiro(null);
    setDialogTitle('Cadastrar Parceiro');
  };

  const openEditDialog = (parceiro) => {
    setShowDialog(true);
    setEditingParceiro(parceiro);
    setDialogTitle('Editar Parceiro');
  };

  const deleteParceiro = async (id) => {
    try {
      await apiEstoque.delete(`/parceiros/${id}`);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Parceiro removido com sucesso!', life: 3000 });
      fetchParceiros();
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar parceiro!', life: 3000 });
    }
  };

  const handleDelete = (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar este parceiro?',
      icon: 'pi pi-info-circle',
      accept: () => deleteParceiro(id)
    });
  };

  const handleFormSubmit = async (parceiroData) => {
    try {
      if (editingParceiro) {
        await apiEstoque.put(`/parceiros/${editingParceiro.id}`, parceiroData);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Parceiro atualizado com sucesso!', life: 3000 });
      } else {
        await apiEstoque.post('/parceiros', parceiroData);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Parceiro criado com sucesso!', life: 3000 });
      }
      fetchParceiros();
    } catch (error) {
      console.error('Erro ao salvar parceiro:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar parceiro!', life: 3000 });
    } finally {
      setShowDialog(false);
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="parceiro-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Parceiros</h2>
        <Button
          label="Novo Parceiro"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewDialog}
        />
        <Divider type="solid" />
        <DataTable value={parceiros} paginator rows={10} dataKey="id" loading={tableLoading}>
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="telefone" header="Telefone" sortable />
          <Column header="Ações" body={(rowData) => (
            <TableActions rowData={rowData} onEdit={openEditDialog} onDelete={handleDelete} />
          )} />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '600px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        {dialogLoading ? (
          <div className="flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <ProgressSpinner />
          </div>
        ) : (
          <ParceiroForm
            initialData={editingParceiro || {}}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowDialog(false)}
          />
        )}
      </Dialog>
    </SakaiLayout>
  );
};

export default Parceiros;
