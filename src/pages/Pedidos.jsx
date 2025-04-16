import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import SakaiLayout from '../layouts/SakaiLayout';
import PedidoForm from '../components/PedidoForm';
import apiEstoque from '../services/apiEstoque';
import { Divider } from 'primereact/divider';
import TableActions from '../components/TableActions';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const toast = useRef(null);

  // Status conforme o banco
  const statusOptions = ['novo', 'finalizado', 'pendente', 'cancelado'];

  // Carrega os pedidos na carga inicial
  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    setTableLoading(true);
    try {
      const response = await apiEstoque.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pedidos!', life: 3000 });
    } finally {
      setTableLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await apiEstoque.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes!', life: 3000 });
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await apiEstoque.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos!', life: 3000 });
    }
  };

  // Abre o formulário para novo pedido (carrega clientes e produtos antes de abrir)
  const openNewPedidoDialog = async () => {
    setShowDialog(true);
    await fetchClientes();
    await fetchProdutos();
    setEditingPedido(null);
    setDialogTitle('Cadastrar Pedido');
  };

  // Ao editar, busca os dados atualizados e carrega as listas
  const openEditDialog = async (pedido) => {
    setDialogLoading(true);
    setShowDialog(true);
    try {
      const response = await apiEstoque.get(`/pedidos/${pedido.id}`);
      await fetchClientes();
      await fetchProdutos();
      setEditingPedido(response.data);
      setDialogTitle('Editar Pedido');
    } catch (error) {
      console.error('Erro ao carregar detalhes do pedido:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar os detalhes do pedido!', life: 3000 });
    } finally {
      setDialogLoading(false);
    }
  };

  // Exclui o pedido com confirmPopup e exibe mensagem via Toast
  const deletePedido = async (id) => {
    try {
      await apiEstoque.delete(`/pedidos/${id}`);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Pedido removido com sucesso!', life: 3000 });
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao deletar pedido:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar pedido!', life: 3000 });
    }
  };

  const handleDelete = (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar este pedido?',
      icon: 'pi pi-info-circle',
      accept: () => deletePedido(id)
    });
  };

  // Função onSubmit que será chamada pelo PedidoForm.
  // Ela é async e aguarda todas as operações antes de fechar a modal.
  const handleFormSubmit = async (pedidoData) => {
    try {
      if (editingPedido) {
        // Atualização do cabeçalho do pedido
        await apiEstoque.put(`/pedidos/${editingPedido.id}`, pedidoData);
        // Atualiza ou cria cada item
        if (pedidoData.itens && pedidoData.itens.length > 0) {
          for (const item of pedidoData.itens) {
            if (item.id) {
              await apiEstoque.put(`/pedidos/${editingPedido.id}/itens/${item.id}`, item);
            } else {
              await apiEstoque.post(`/pedidos/${editingPedido.id}/itens`, item);
            }
          }
        }
        await fetchPedidos();
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Pedido atualizado com sucesso!', life: 3000 });
      } else {
        // Criação do pedido
        const response = await apiEstoque.post('/pedidos', pedidoData);
        const createdPedido = response.data;
        const pedidoId = createdPedido.id;

        if (pedidoData.itens && pedidoData.itens.length > 0) {
          for (const item of pedidoData.itens) {
            await apiEstoque.post(`/pedidos/${pedidoId}/itens`, item);
          }
        }
        await fetchPedidos();
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Pedido criado com sucesso!', life: 3000 });
      }
    } catch (error) {
      console.error('Erro ao salvar pedido:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar o pedido!', life: 3000 });
    } finally {
      // Modal é fechada somente no final do processamento
      setShowDialog(false);
    }
  };

  // Templates para exibição na tabela
  const dateBodyTemplate = (rowData) => new Date(rowData.data_pedido).toLocaleDateString('pt-BR');
  const clienteBodyTemplate = (rowData) => (rowData.cliente ? rowData.cliente.nome : 'N/D');

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="pedido-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Pedidos</h2>
        <Button
          label="Novo Pedido"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewPedidoDialog}
        />
        <Divider type="solid" />
        <DataTable value={pedidos} paginator rows={10} dataKey="id" loading={tableLoading}>
          <Column field="id" header="ID" sortable />
          <Column header="Cliente" body={clienteBodyTemplate} sortable />
          <Column header="Data" body={dateBodyTemplate} sortable />
          <Column field="status" header="Status" sortable />
          <Column field="observacoes" header="Observações" sortable />
          <Column header="Ações" body={(rowData) => (
            <TableActions rowData={rowData} onEdit={openEditDialog} onDelete={handleDelete} />
          )} />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '1024px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        {dialogLoading ? (
          <div className="flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <ProgressSpinner />
          </div>
        ) : (
          <PedidoForm
            initialData={editingPedido || {}}
            clientes={clientes}
            produtos={produtos}
            statusOptions={statusOptions}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowDialog(false)}
          />
        )}
      </Dialog>
    </SakaiLayout>
  );
};

export default Pedidos;
