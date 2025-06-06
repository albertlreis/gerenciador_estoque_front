import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import DepositoForm from '../components/DepositoForm';
import apiEstoque from '../services/apiEstoque';
import { Divider } from 'primereact/divider';
import TableActions from '../components/TableActions';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';

const Depositos = () => {
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDeposito, setEditingDeposito] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    fetchDepositos();
  }, []);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const fetchDepositos = async () => {
    setLoading(true);
    try {
      const response = await apiEstoque.get('/depositos');
      setDepositos(response.data);
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error.response?.data || error.message);
      showToast('error', 'Erro', 'Erro ao carregar depósitos');
    } finally {
      setLoading(false);
    }
  };

  const openNewDepositoDialog = () => {
    setEditingDeposito(null);
    setDialogTitle('Cadastrar Depósito');
    setShowDialog(true);
  };

  const openEditDialog = (deposito) => {
    setEditingDeposito(deposito);
    setDialogTitle('Editar Depósito');
    setShowDialog(true);
  };

  const handleDelete = async (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar este depósito?',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await apiEstoque.delete(`/depositos/${id}`);
          setDepositos((prev) => prev.filter((d) => d.id !== id));
          showToast('success', 'Sucesso', 'Depósito removido com sucesso');
        } catch (error) {
          console.error('Erro ao deletar depósito:', error.response?.data || error.message);
          showToast('error', 'Erro', 'Erro ao remover depósito');
        }
      },
      reject: () => {
        showToast('warn', 'Cancelado', 'Operação cancelada');
      }
    });
  };

  const handleMovimentacoes = (depositoId) => {
    window.location.href = `/movimentacoes-estoque?deposito=${depositoId}`;
  };

  const handleFormSubmit = async (depositoData) => {
    try {
      if (editingDeposito) {
        const response = await apiEstoque.put(`/depositos/${editingDeposito.id}`, depositoData);
        setDepositos((prev) =>
          prev.map((dep) => (dep.id === editingDeposito.id ? response.data : dep))
        );
        showToast('success', 'Sucesso', 'Depósito atualizado');
      } else {
        const response = await apiEstoque.post('/depositos', depositoData);
        setDepositos((prev) => [...prev, response.data]);
        showToast('success', 'Sucesso', 'Depósito criado');
      }
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao salvar depósito:', error.response?.data || error.message);
      showToast('error', 'Erro', 'Erro ao salvar depósito');
    }
  };

  const movimentacoesColumnTemplate = (rowData) => (
    <Button
      icon="pi pi-box"
      className="p-button-sm"
      tooltip="Ver Movimentações"
      tooltipOptions={{ position: 'top' }}
      onClick={() => handleMovimentacoes(rowData.id)}
    />
  );

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="deposito-gestao p-4 md:p-6">
        <h2 className="text-2xl mb-4">Gestão de Depósitos</h2>
        <Button
          label="Novo Depósito"
          icon="pi pi-plus"
          className="p-button-success mb-4"
          onClick={openNewDepositoDialog}
        />
        <Divider type="solid" />
        <DataTable
          value={depositos}
          loading={loading}
          paginator
          rows={10}
          dataKey="id"
          responsiveLayout="scroll"
          emptyMessage="Nenhum depósito encontrado"
          sortField="nome"
          sortOrder={1}
        >
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="endereco" header="Endereço" />
          <Column header="Movimentações" body={movimentacoesColumnTemplate} />
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
      <Dialog
        key={editingDeposito?.id || 'new'}
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '450px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <DepositoForm
          initialData={editingDeposito || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Depositos;
