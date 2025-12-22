import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';

import SakaiLayout from '../layouts/SakaiLayout';
import ClienteForm from '../components/cliente/ClienteForm';
import apiEstoque from '../services/apiEstoque';
import TableActions from '../components/TableActions';

const onlyDigits = (v) => String(v ?? '').replace(/\D/g, '');

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  // filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroDocumento, setFiltroDocumento] = useState('');

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
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes', life: 3000 });
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
          setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
          toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado', life: 3000 });
        } catch (error) {
          console.error('Erro ao deletar cliente:', error.response?.data || error.message);
          toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o cliente.', life: 3500 });
        }
      },
      reject: () => {
        toast.current?.show({ severity: 'warn', summary: 'Cancelado', detail: 'Operação cancelada', life: 2500 });
      },
    });
  };

  const clientesFiltrados = useMemo(() => {
    const nome = filtroNome.trim().toLowerCase();
    const docDigits = onlyDigits(filtroDocumento);

    return (clientes || []).filter((c) => {
      const nomeOk = !nome || String(c?.nome ?? '').toLowerCase().includes(nome);
      const docOk = !docDigits || onlyDigits(c?.documento).includes(docDigits);
      return nomeOk && docOk;
    });
  }, [clientes, filtroNome, filtroDocumento]);

  const documentoBody = (row) => {
    const d = onlyDigits(row?.documento);
    if (!d) return '-';
    // máscara simples só para exibir
    if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    return row?.documento ?? d;
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />

      <div className="cliente-gestao" style={{ margin: '2rem' }}>
        <div className="flex align-items-center justify-content-between gap-2 mb-2">
          <div>
            <h2 className="m-0">Gestão de Clientes</h2>
            <small className="text-600">Filtre por nome e documento, crie e edite clientes</small>
          </div>

          <Button label="Novo Cliente" icon="pi pi-plus" className="p-button-success" onClick={openNewClienteDialog} />
        </div>

        <Divider type="solid" />

        {/* Filtros */}
        <div className="grid mb-3">
          <div className="col-12 md:col-6">
            <label className="block mb-1">Filtro por Nome/Razão Social</label>
            <InputText
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              placeholder="Digite para filtrar..."
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-1">Filtro por Documento (CPF/CNPJ)</label>
            <InputMask
              value={filtroDocumento}
              onChange={(e) => setFiltroDocumento(e.value || e.target.value)}
              mask="999.999.999-99? 99.999.999/9999-99"
              placeholder="Digite CPF ou CNPJ..."
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-2 flex align-items-end">
            <Button
              type="button"
              label="Limpar"
              icon="pi pi-filter-slash"
              className="p-button-outlined w-full"
              onClick={() => {
                setFiltroNome('');
                setFiltroDocumento('');
              }}
            />
          </div>
        </div>

        <DataTable
          value={clientesFiltrados}
          paginator
          rows={10}
          dataKey="id"
          responsiveLayout="scroll"
          emptyMessage="Nenhum cliente encontrado."
        >
          <Column field="id" header="ID" sortable style={{ width: '90px' }} />
          <Column field="nome" header="Nome/Razão Social" sortable />
          <Column header="Documento" body={documentoBody} sortable sortField="documento" />
          <Column field="email" header="Email" sortable />
          <Column field="telefone" header="Telefone" sortable />
          <Column
            field="tipo"
            header="Tipo"
            sortable
            body={(rowData) => (rowData.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica')}
            style={{ width: '180px' }}
          />
          <Column
            header="Ações"
            body={(rowData) => <TableActions rowData={rowData} onEdit={openEditDialog} onDelete={handleDelete} />}
            style={{ width: '160px' }}
          />
        </DataTable>
      </div>

      <Dialog header={dialogTitle} visible={showDialog} className="w-7" modal onHide={() => setShowDialog(false)}>
        <ClienteForm
          initialData={editingCliente || {}}
          onSaved={(saved) => {
            setClientes((prev) => {
              const exists = prev.some((c) => c.id === saved.id);
              return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
            });
            setShowDialog(false);
          }}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Clientes;
