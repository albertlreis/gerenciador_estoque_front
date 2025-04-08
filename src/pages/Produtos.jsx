import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import ProdutoForm from '../components/ProdutoForm';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await apiEstoque.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error.response?.data || error.message);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await apiEstoque.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error.response?.data || error.message);
    }
  };

  const openNewProdutoDialog = () => {
    setEditingProduto(null);
    setDialogTitle('Cadastrar Produto');
    setShowDialog(true);
  };

  const openEditProdutoDialog = (produto) => {
    setEditingProduto(produto);
    setDialogTitle('Editar Produto');
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await apiEstoque.delete(`/produtos/${id}`);
        fetchProdutos();
      } catch (error) {
        console.error('Erro ao deletar produto:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (produtoData) => {
    try {
      if (editingProduto) {
        // Atualiza produto
        await apiEstoque.put(`/produtos/${editingProduto.id}`, produtoData);
      } else {
        // Cria novo produto
        await apiEstoque.post('/produtos', produtoData);
      }
      setShowDialog(false);
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error.response?.data || error.message);
      alert('Erro ao salvar produto!');
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Button
          label="Editar"
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info p-mr-2"
          onClick={() => openEditProdutoDialog(rowData)}
        />
        <Button
          label="Excluir"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => handleDelete(rowData.id)}
        />
      </>
    );
  };

  return (
    <SakaiLayout>
      <div className="produto-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Produtos</h2>
        <Button
          label="Novo Produto"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewProdutoDialog}
        />
        <DataTable value={produtos} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="descricao" header="Descrição" />
          <Column
            field="id_categoria"
            header="Categoria"
            sortable
            body={(rowData) => {
              const cat = categorias.find((c) => c.id === rowData.id_categoria);
              return cat ? cat.nome : '';
            }}
          />
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
        <ProdutoForm
          initialData={editingProduto || {}}
          categorias={categorias}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Produtos;
