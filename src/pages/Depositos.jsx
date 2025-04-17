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
  const [showDialog, setShowDialog] = useState(false);
  const [editingDeposito, setEditingDeposito] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    fetchDepositos();
  }, []);

  const fetchDepositos = async () => {
    try {
      const response = await apiEstoque.get('/depositos');
      setDepositos(response.data);
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar depósitos',
        life: 3000,
      });
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

  const handleDelete = (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar este depósito?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept: async () => {
        try {
          await apiEstoque.delete(`/depositos/${id}`);
          setDepositos(prev => prev.filter(deposito => deposito.id !== id));
          toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Depósito deletado',
            life: 3000,
          });
        } catch (error) {
          console.error('Erro ao deletar depósito:', error.response?.data || error.message);
          toast.current.show({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao deletar depósito',
            life: 3000,
          });
        }
      },
      reject: () => {
        toast.current.show({
          severity: 'warn',
          summary: 'Cancelado',
          detail: 'Operação cancelada',
          life: 3000,
        });
      }
    });
  };

  const handleMovimentacoes = (depositoId) => {
    // Pode-se optar por:
    // (a) Redirecionar para uma página de listagem de movimentações para esse depósito:
    window.location.href = `/depositos/${depositoId}/movimentacoes`;
    // (b) Ou abrir um diálogo com o formulário de registro (se desejar um fluxo inline).
    // Exemplo: definir estado para abrir o diálogo com o componente MovimentacaoForm
  };

  const handleFormSubmit = async (depositoData) => {
    try {
      if (editingDeposito) {
        const response = await apiEstoque.put(`/depositos/${editingDeposito.id}`, depositoData);
        setDepositos(prev =>
          prev.map(dep => (dep.id === editingDeposito.id ? response.data : dep))
        );
        toast.current.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Depósito atualizado',
          life: 3000,
        });
      } else {
        const response = await apiEstoque.post('/depositos', depositoData);
        setDepositos(prev => [...prev, response.data]);
        toast.current.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Depósito criado',
          life: 3000,
        });
      }
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao salvar depósito:', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar depósito',
        life: 3000,
      });
    }
  };

  // Adicionamos uma coluna personalizada para movimentações
  const movimentacoesColumnTemplate = (rowData) => {
    return (
      <Button
        label="Movimentações"
        icon="pi pi-exchange"
        className="p-button-info p-button-sm"
        onClick={() => handleMovimentacoes(rowData.id)}
      />
    );
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="deposito-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Depósitos</h2>
        <Button
          label="Novo Depósito"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewDepositoDialog}
        />
        <Divider type="solid" />
        <DataTable value={depositos} paginator rows={10} dataKey="id" responsiveLayout="scroll">
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
