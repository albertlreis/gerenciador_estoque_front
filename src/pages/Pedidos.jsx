import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { confirmPopup } from 'primereact/confirmpopup';
import { ProgressSpinner } from 'primereact/progressspinner';
import SakaiLayout from '../layouts/SakaiLayout';
import PedidoForm from '../components/PedidoForm';
import apiEstoque from '../services/apiEstoque';
import { Divider } from "primereact/divider";
import TableActions from "../components/TableActions";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  // Estado para controlar o loading da tabela
  const [tableLoading, setTableLoading] = useState(true);

  // Status disponíveis conforme banco: novo, finalizado, pendente e cancelado
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
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await apiEstoque.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error.response?.data || error.message);
    }
  };

  // Abre o formulário de novo pedido, carregando as listas necessárias
  const openNewPedidoDialog = async () => {
    setShowDialog(true);
    await fetchClientes();
    await fetchProdutos();
    setEditingPedido(null);
    setDialogTitle('Cadastrar Pedido');
  };

  // Ao editar, busca os dados atualizados, carrega as listas e exibe o loading
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
    } finally {
      setDialogLoading(false);
    }
  };

  // Gerencia a exclusão utilizando confirmPopup
  const deletePedido = async (id) => {
    try {
      await apiEstoque.delete(`/pedidos/${id}`);
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao deletar pedido:', error.response?.data || error.message);
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

  const handleFormSubmit = (pedidoData) => {
    if (editingPedido) {
      // Modo de edição: atualiza o pedido via PUT
      apiEstoque.put(`/pedidos/${editingPedido.id}`, pedidoData)
        .then(() => {
          setShowDialog(false);
          fetchPedidos();
        })
        .catch((error) => {
          console.error('Erro ao salvar pedido:', error.response?.data || error.message);
          alert('Erro ao salvar pedido!');
        });
    } else {
      // No modo de criação, o formulário já realizou o POST e apenas fecha o diálogo
      setShowDialog(false);
      fetchPedidos();
    }
  };

  // Formata a data do pedido para exibição
  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.data_pedido).toLocaleDateString('pt-BR');
  };

  // Exibe o nome do cliente
  const clienteBodyTemplate = (rowData) => {
    return rowData.cliente ? rowData.cliente.nome : 'N/D';
  };

  return (
    <SakaiLayout>
      <div className="pedido-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Pedidos</h2>
        <Button
          label="Novo Pedido"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewPedidoDialog}
        />
        <Divider type="solid" />
        <DataTable
          value={pedidos}
          paginator
          rows={10}
          dataKey="id"
          loading={tableLoading}
        >
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
