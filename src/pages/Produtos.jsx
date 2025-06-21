import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import ProdutoForm from '../components/ProdutoForm';
import { Divider } from 'primereact/divider';
import TableActions from '../components/TableActions';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const toastTopCenter = useRef(null);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 0
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const onPage = (event) => {
    setLazyParams(event);
  };

  useEffect(() => {
    fetchProdutos();
  }, [lazyParams]);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await apiEstoque.get('/produtos', {
        params: {
          page: lazyParams.page + 1,
          per_page: lazyParams.rows
        }
      });
      const { data, meta } = response.data;
      setProdutos(data);
      setTotalRecords(meta.total || 0);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error.response?.data || error.message);
      toastTopCenter.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar produtos',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };


  const openNewProdutoDialog = () => {
    setEditingProduto(null);
    setDialogTitle('Cadastrar Produto');
    setShowDialog(true);
  };

  const openEditDialog = async (produto) => {
    try {
      const response = await apiEstoque.get(`/produtos/${produto.id}`);
      setEditingProduto(response.data.data || response.data);
      setDialogTitle('Editar Produto');
      setShowDialog(true);
    } catch (error) {
      console.error('Erro ao carregar produto para edição:', error.response?.data || error.message);
      toastTopCenter.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar produto para edição',
        life: 3000
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await apiEstoque.delete(`/produtos/${id}`);
        await fetchProdutos();
        toastTopCenter.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto deletado', life: 3000 });
      } catch (error) {
        console.error('Erro ao deletar produto:', error.response?.data || error.message);
        toastTopCenter.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao deletar produto', life: 3000 });
      }
    }
  };

  const handleFormSubmit = async (produtoData) => {
    try {
      if (editingProduto) {
        await apiEstoque.put(`/produtos/${editingProduto.id}`, produtoData);
        toastTopCenter.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto atualizado com sucesso', life: 3000 });
        setShowDialog(false);
      } else {
        const response = await apiEstoque.post('/produtos', produtoData);
        setEditingProduto(response.data.produto);
        setDialogTitle('Editar Produto');
        toastTopCenter.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto cadastrado com sucesso', life: 3000 });
      }

      await fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error.response?.data || error.message);
      toastTopCenter.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar produto', life: 3000 });
    }
  };

  const categoriaBodyTemplate = (rowData) => {
    return rowData.categoria ? rowData.categoria.nome : '';
  };

  return (
    <SakaiLayout>
      <Toast ref={toastTopCenter} position="top-center" />
      <div className="produto-gestao" style={{ margin: '2rem' }}>
        <h1>Gestão de Produtos</h1>
        <Button
          label="Novo Produto"
          aria-label="Cadastrar novo produto"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewProdutoDialog}
        />
        <Divider type="solid" />
        <DataTable
          value={produtos}
          lazy
          paginator
          first={lazyParams.first}
          rows={lazyParams.rows}
          totalRecords={totalRecords}
          onPage={onPage}
          dataKey="id"
          loading={loading}
          responsiveLayout="scroll"
          emptyMessage="Nenhum produto encontrado"
        >
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column field="categoria" header="Categoria" sortable body={categoriaBodyTemplate} />
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
        <ProdutoForm
          initialData={editingProduto || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default Produtos;
