import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import CategoriaForm from '../components/CategoriaForm';
import apiEstoque from '../services/apiEstoque';
import { Divider } from 'primereact/divider';
import TableActions from '../components/TableActions';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toast = useRef(null);

  const renderCategorias = (lista, nivel = 0) => {
    return lista.flatMap((cat) => [
      { ...cat, nivel },
      ...(cat.subcategorias ? renderCategorias(cat.subcategorias, nivel + 1) : [])
    ]);
  };

  const fetchCategorias = async () => {
    try {
      const response = await apiEstoque.get('/categorias');
      const hierarquia = renderCategorias(response.data);
      setCategorias(hierarquia);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar categorias',
        life: 3000,
      });
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const openNewCategoriaDialog = () => {
    setEditingCategoria(null);
    setDialogTitle('Cadastrar Categoria');
    setShowDialog(true);
  };

  const openEditDialog = (categoria) => {
    setEditingCategoria(categoria);
    setDialogTitle('Editar Categoria');
    setShowDialog(true);
  };

  const handleDelete = (event, id) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Tem certeza que deseja deletar esta categoria?',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      accept: async () => {
        try {
          await apiEstoque.delete(`/categorias/${id}`);
          await fetchCategorias();
          toast.current.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria deletada',
            life: 3000,
          });
        } catch (error) {
          console.error('Erro ao deletar categoria:', error.response?.data || error.message);
          toast.current.show({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao deletar categoria',
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

  const handleFormSubmit = async (categoriaData) => {
    try {
      if (editingCategoria) {
        await apiEstoque.put(`/categorias/${editingCategoria.id}`, categoriaData);
      } else {
        await apiEstoque.post('/categorias', categoriaData);
      }

      await fetchCategorias();
      setShowDialog(false);

      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: editingCategoria ? 'Categoria atualizada' : 'Categoria criada',
        life: 3000,
      });
    } catch (error) {
      console.error('Erro ao salvar categoria:', error.response?.data || error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar categoria',
        life: 3000,
      });
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="categoria-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Categorias</h2>
        <Button
          label="Nova Categoria"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewCategoriaDialog}
        />
        <Divider type="solid" />
        <DataTable value={categorias} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column
            field="nome"
            header="Nome"
            sortable
            body={(rowData) => (
              <span style={{ paddingLeft: `${rowData.nivel * 20}px` }}>
                {rowData.nome}
              </span>
            )}
          />
          <Column field="descricao" header="Descrição" />
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
        <CategoriaForm
          initialData={editingCategoria || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Categorias;
