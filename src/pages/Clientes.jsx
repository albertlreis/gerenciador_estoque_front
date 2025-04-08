import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import ClienteForm from '../components/ClienteForm';
import apiEstoque from '../services/apiEstoque';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await apiEstoque.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error.response?.data || error.message);
    }
  };

  const openNewClienteDialog = () => {
    setEditingCliente(null);
    setDialogTitle('Cadastrar Cliente');
    setShowDialog(true);
  };

  const openEditClienteDialog = (cliente) => {
    setEditingCliente(cliente);
    setDialogTitle('Editar Cliente');
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await apiEstoque.delete(`/clientes/${id}`);
        fetchClientes();
      } catch (error) {
        console.error('Erro ao deletar cliente:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (clienteData) => {
    try {
      if (editingCliente) {
        await apiEstoque.put(`/clientes/${editingCliente.id}`, clienteData);
      } else {
        await apiEstoque.post('/clientes', clienteData);
      }
      setShowDialog(false);
      fetchClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error.response?.data || error.message);
      alert('Erro ao salvar cliente!');
    }
  };

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        label="Editar"
        icon="pi pi-pencil"
        className="p-button-rounded p-button-info p-mr-2"
        onClick={() => openEditClienteDialog(rowData)}
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => handleDelete(rowData.id)}
      />
    </>
  );

  return (
    <SakaiLayout>
      <div className="cliente-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Clientes</h2>
        <Button
          label="Novo Cliente"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewClienteDialog}
        />
        <DataTable value={clientes} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="telefone" header="Telefone" sortable />
          <Column field="ativo" header="Ativo" body={(rowData) => (rowData.ativo ? 'Sim' : 'Não')} />
          <Column header="Ações" body={actionBodyTemplate} />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '450px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <ClienteForm
          initialData={editingCliente || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Clientes;
