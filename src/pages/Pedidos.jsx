import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import PedidoFormWithItems from '../components/PedidoFormWithItems';
import apiEstoque from '../services/apiEstoque';
import {Divider} from "primereact/divider";
import TableActions from "../components/TableActions";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [variacoes, setVariacoes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  // Status possíveis para o pedido
  const statusOptions = ['Pendente', 'Confirmado', 'Cancelado'];

  useEffect(() => {
    fetchPedidos();
    fetchClientes();
    fetchVariacoes();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await apiEstoque.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error.response?.data || error.message);
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

  const fetchVariacoes = async () => {
    try {
      const response = await apiEstoque.get('/produto-variacoes');
      setVariacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar variações:', error.response?.data || error.message);
    }
  };

  const openNewPedidoDialog = () => {
    setEditingPedido(null);
    setDialogTitle('Cadastrar Pedido');
    setShowDialog(true);
  };

  const openEditDialog = (pedido) => {
    setEditingPedido(pedido);
    setDialogTitle('Editar Pedido');
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este pedido?')) {
      try {
        await apiEstoque.delete(`/pedidos/${id}`);
        fetchPedidos();
      } catch (error) {
        console.error('Erro ao deletar pedido:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (pedidoData) => {
    try {
      if (editingPedido) {
        await apiEstoque.put(`/pedidos/${editingPedido.id}`, pedidoData);
      } else {
        await apiEstoque.post('/pedidos', pedidoData);
      }
      setShowDialog(false);
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error.response?.data || error.message);
      alert('Erro ao salvar pedido!');
    }
  };

  // Formata a data do pedido para exibição
  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.data_pedido).toLocaleDateString('pt-BR');
  };

  // Exibe o nome do cliente
  const clienteBodyTemplate = (rowData) => {
    const cliente = clientes.find(c => c.id === rowData.id_cliente);
    return cliente ? cliente.nome : 'N/D';
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
        <DataTable value={pedidos} paginator rows={10} dataKey="id" responsiveLayout="scroll">
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
        style={{ width: '800px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <PedidoFormWithItems
          initialData={editingPedido || {}}
          clientes={clientes}
          variacoes={variacoes}
          statusOptions={statusOptions}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Pedidos;
