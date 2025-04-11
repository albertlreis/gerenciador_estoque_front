import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SakaiLayout from '../layouts/SakaiLayout';
import ProdutoVariacaoForm from '../components/ProdutoVariacaoForm';
import apiEstoque from '../services/apiEstoque';

const ProdutoVariacoes = () => {
  const [variacoes, setVariacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingVariacao, setEditingVariacao] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');

  useEffect(() => {
    fetchVariacoes();
    fetchProdutos();
  }, []);

  const fetchVariacoes = async () => {
    try {
      const response = await apiEstoque.get('/produto-variacoes');
      setVariacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar variações:', error.response?.data || error.message);
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

  // Abre o diálogo para cadastrar nova variação
  const openNewVariacaoDialog = () => {
    setEditingVariacao(null);
    setDialogTitle('Cadastrar Variação');
    setShowDialog(true);
  };

  // Abre o diálogo para editar variação existente
  const openEditVariacaoDialog = (variacao) => {
    setEditingVariacao(variacao);
    setDialogTitle('Editar Variação');
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta variação?')) {
      try {
        await apiEstoque.delete(`/produto-variacoes/${id}`);
        fetchVariacoes();
      } catch (error) {
        console.error('Erro ao deletar variação:', error.response?.data || error.message);
      }
    }
  };

  const handleFormSubmit = async (variacaoData) => {
    try {
      if (editingVariacao) {
        // Atualiza variação
        await apiEstoque.put(`/produto-variacoes/${editingVariacao.id}`, variacaoData);
      } else {
        // Cria nova variação
        await apiEstoque.post('/produto-variacoes', variacaoData);
      }
      setShowDialog(false);
      fetchVariacoes();
    } catch (error) {
      console.error('Erro ao salvar variação:', error.response?.data || error.message);
      alert('Erro ao salvar variação!');
    }
  };

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        label="Editar"
        icon="pi pi-pencil"
        className="p-button-rounded p-button-info p-mr-2"
        onClick={() => openEditVariacaoDialog(rowData)}
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => handleDelete(rowData.id)}
      />
    </>
  );

  // Exibe o nome do produto relacionado à variação
  const produtoBodyTemplate = (rowData) => {
    const prod = produtos.find(p => p.id === rowData.id_produto);
    return prod ? prod.nome : 'N/D';
  };

  // Formata os valores monetários
  const valorBodyTemplate = (rowData, field) => {
    const valor = rowData[field];
    return valor !== undefined && valor !== null
      ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'R$ 0,00';
  };

  return (
    <SakaiLayout>
      <div className="produto-variacao-gestao" style={{ margin: '2rem' }}>
        <h2>Gestão de Variações dos Produtos</h2>
        <Button
          label="Nova Variação"
          icon="pi pi-plus"
          className="p-button-success p-mb-3"
          onClick={openNewVariacaoDialog}
        />
        <DataTable value={variacoes} paginator rows={10} dataKey="id" responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column header="Produto" body={produtoBodyTemplate} sortable />
          <Column field="sku" header="SKU" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column header="Preço" body={(rowData) => valorBodyTemplate(rowData, 'preco')} sortable />
          <Column header="Custo" body={(rowData) => valorBodyTemplate(rowData, 'custo')} sortable />
          <Column field="peso" header="Peso" sortable />
          <Column field="altura" header="Altura" sortable />
          <Column field="largura" header="Largura" sortable />
          <Column field="profundidade" header="Profundidade" sortable />
          <Column field="codigo_barras" header="Código de Barras" />
          <Column header="Ações" body={actionBodyTemplate} />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '600px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <ProdutoVariacaoForm
          initialData={editingVariacao || {}}
          produtos={produtos}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />
      </Dialog>
    </SakaiLayout>
  );
};

export default ProdutoVariacoes;
