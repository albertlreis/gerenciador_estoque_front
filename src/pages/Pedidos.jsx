import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import PedidoForm from '../components/PedidoForm';
import apiEstoque from '../services/apiEstoque';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  // Define os status possíveis
  const statusOptions = ['Pendente', 'Confirmado', 'Cancelado'];

  // Carrega pedidos e clientes ao montar o componente
  useEffect(() => {
    fetchPedidos();
    fetchClientes();
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

  // Abre o diálogo para cadastro de novo pedido
  const openNewPedidoDialog = () => {
    setEditingPedido(null);
    setDialogTitle('Cadastrar Pedido');
    setShowDialog(true);
  };

  // Abre o diálogo para edição de pedido existente
  const openEditPedidoDialog = (pedido) => {
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
        // Atualiza pedido
        await apiEstoque.put(`/pedidos/${editingPedido.id}`, pedidoData);
      } else {
        // Cria novo pedido
        await apiEstoque.post('/pedidos', pedidoData);
      }
      setShowDialog(false);
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error.response?.data || error.message);
      alert('Erro ao salvar pedido!');
    }
  };

  // Template para ações de cada linha na DataTable
  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        label="Editar"
        icon="pi pi-pencil"
        className="p-button-rounded p-button-info p-mr-2"
        onClick={() => openEditPedidoDialog(rowData)}
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => handleDelete(rowData.id)}
      />
    </>
  );

  // Formata a data para exibição
  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.data).toLocaleDateString('pt-BR');
  };

  // Exibe o nome do cliente utilizando a lista de clientes buscada
  const clienteBodyTemplate = (rowData) => {
    const cliente = clientes.find((c) => c.id === rowData.id_cliente);
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
        <DataTable value={pedidos} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column header="Cliente" body={clienteBodyTemplate} sortable />
          <Column header="Data" body={dateBodyTemplate} sortable />
          <Column field="status" header="Status" sortable />
          <Column
            field="total"
            header="Total"
            body={(rowData) => rowData.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            sortable
          />
          <Column header="Ações" body={actionBodyTemplate} />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '500px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <PedidoForm
          initialData={editingPedido || {}}
          clientes={clientes}
          statusOptions={statusOptions}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Pedidos;
