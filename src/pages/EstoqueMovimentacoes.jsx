import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import ProdutoLayout from '../layouts/ProdutoLayout';
import MovimentacaoForm from '../components/MovimentacaoForm';
import apiEstoque from '../services/apiEstoque';

const EstoqueMovimentacoes = () => {
  const { depositoId } = useParams();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMovimentacao, setEditingMovimentacao] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    fetchMovimentacoes();
  }, [depositoId]);

  const fetchMovimentacoes = async () => {
    try {
      // Chamada à API usando o depósito como parâmetro:
      const response = await apiEstoque.get(`/depositos/${depositoId}/movimentacoes`);
      setMovimentacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar movimentações',
        life: 3000,
      });
    }
  };

  const openNewMovimentacaoDialog = () => {
    setEditingMovimentacao(null);
    setDialogTitle('Nova Movimentação');
    setShowDialog(true);
  };

  const openEditDialog = (movimentacao) => {
    setEditingMovimentacao(movimentacao);
    setDialogTitle('Editar Movimentação');
    setShowDialog(true);
  };

  const handleDelete = (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar esta movimentação?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept: async () => {
        try {
          await apiEstoque.delete(`/depositos/${depositoId}/movimentacoes/${id}`);
          setMovimentacoes(prev => prev.filter(m => m.id !== id));
          toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Movimentação deletada',
            life: 3000,
          });
        } catch (error) {
          console.error('Erro ao deletar movimentação:', error.response?.data || error.message);
          toast.current.show({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao deletar movimentação',
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

  const handleFormSubmit = async (movData) => {
    try {
      if (editingMovimentacao) {
        const response = await apiEstoque.put(`/depositos/${depositoId}/movimentacoes/${editingMovimentacao.id}`, movData);
        setMovimentacoes(prev =>
          prev.map(m => (m.id === editingMovimentacao.id ? response.data : m))
        );
        toast.current.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Movimentação atualizada',
          life: 3000,
        });
      } else {
        const response = await apiEstoque.post(`/depositos/${depositoId}/movimentacoes`, movData);
        setMovimentacoes(prev => [...prev, response.data]);
        toast.current.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Movimentação criada',
          life: 3000,
        });
      }
      setShowDialog(false);
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar movimentação',
        life: 3000,
      });
    }
  };

  const movimentacaoBodyTemplate = (rowData) => {
    return (
      <>
        <strong>{rowData.tipo}</strong>
        <br />
        <small>{rowData.data_movimentacao}</small>
        <br />
        <span>Qtd: {rowData.quantidade}</span>
      </>
    );
  };

  return (
    <ProdutoLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="movimentacoes-gestao" style={{ margin: '2rem' }}>
        <h2>Movimentações do Depósito</h2>
        <Button
          label="Nova Movimentação"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewMovimentacaoDialog}
        />
        <DataTable value={movimentacoes} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column header="Movimentação" body={movimentacaoBodyTemplate} />
          <Column field="observacao" header="Observação" />
          <Column
            header="Ações"
            body={(rowData) => (
              <div>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-mr-2" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={(e) => handleDelete(e, rowData.id)} />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        modal
        style={{ width: '500px' }}
        onHide={() => setShowDialog(false)}
      >
        <MovimentacaoForm
          initialData={editingMovimentacao || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </ProdutoLayout>
  );
};

export default EstoqueMovimentacoes;
