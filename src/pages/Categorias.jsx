import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import CategoriaForm from '../components/CategoriaForm';
import apiEstoque from '../services/apiEstoque';
import {Divider} from "primereact/divider";
import TableActions from "../components/TableActions";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await apiEstoque.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error.response?.data || error.message);
    }
  };

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

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        await apiEstoque.delete(`/categorias/${id}`);
        fetchCategorias();
      } catch (error) {
        console.error('Erro ao deletar categoria:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (categoriaData) => {
    try {
      if (editingCategoria) {
        // Atualiza categoria existente
        await apiEstoque.put(`/categorias/${editingCategoria.id}`, categoriaData);
      } else {
        // Cria nova categoria
        await apiEstoque.post('/categorias', categoriaData);
      }
      setShowDialog(false);
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error.response?.data || error.message);
      alert('Erro ao salvar categoria!');
    }
  };

  return (
    <SakaiLayout>
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
          <Column field="nome" header="Nome" sortable />
          <Column field="descricao" header="Descrição" />
          <Column header="Ações" body={(rowData) => (
            <TableActions rowData={rowData} onEdit={openEditDialog} onDelete={handleDelete} />
          )} />
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
