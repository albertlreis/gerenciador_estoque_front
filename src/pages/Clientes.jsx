import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import SakaiLayout from '../layouts/SakaiLayout';
import ClienteForm from '../components/ClienteForm';
import apiEstoque from '../services/apiEstoque';
import TableActions from '../components/TableActions';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await apiEstoque.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error.response?.data || error.message);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes', life: 3000 });
    }
  };

  const openNewClienteDialog = () => {
    setEditingCliente(null);
    setDialogTitle('Cadastrar Cliente');
    setShowDialog(true);
  };

  const openEditDialog = (cliente) => {
    setEditingCliente(cliente);
    setDialogTitle('Editar Cliente');
    setShowDialog(true);
  };

  const handleDelete = (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar este cliente?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept: async () => {
        try {
          await apiEstoque.delete(`/clientes/${id}`);
          setClientes(prev => prev.filter(cliente => cliente.id !== id));
          toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado', life: 3000 });
        } catch (error) {
          console.error('Erro ao deletar cliente:', error.response?.data || error.message);
          // Erro de delete: mantemos toast aqui porque não passa por formulário
          toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o cliente.', life: 3500 });
        }
      },
      reject: () => {
        toast.current.show({ severity: 'warn', summary: 'Cancelado', detail: 'Operação cancelada', life: 3000 });
      }
    });
  };

  // IMPORTANTE: não mostramos toast de erro aqui; o ClienteForm cuida dos erros amigáveis.
  const handleFormSubmit = async (clienteData) => {
    if (editingCliente) {
      const response = await apiEstoque.put(`/clientes/${editingCliente.id}`, clienteData);
      setClientes(prev => prev.map(c => (c.id === editingCliente.id ? response.data : c)));
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado', life: 3000 });
      setShowDialog(false);
      return response.data;
    } else {
      const response = await apiEstoque.post('/clientes', clienteData);
      setClientes(prev => [...prev, response.data]);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente criado', life: 3000 });
      setShowDialog(false);
      return response.data;
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="cliente-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Clientes</h2>
        <Button label="Novo Cliente" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={openNewClienteDialog} />
        <Divider type="solid" />
        <DataTable value={clientes} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome/Razão Social" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="telefone" header="Telefone" sortable />
          <Column field="tipo" header="Tipo" sortable body={(rowData) => rowData.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'} />
          <Column header="Ações" body={(rowData) => (
            <TableActions rowData={rowData} onEdit={openEditDialog} onDelete={handleDelete} />
          )} />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        className='w-7'
        modal onHide={() => setShowDialog(false)}
      >
        <ClienteForm initialData={editingCliente || {}} onSubmit={handleFormSubmit} onCancel={() => setShowDialog(false)} />
      </Dialog>
    </SakaiLayout>
  );
};

export default Clientes;
