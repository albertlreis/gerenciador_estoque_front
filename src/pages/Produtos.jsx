import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';

import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import { listarProdutos } from '../services/produtoService';
import ProdutoForm from '../components/produto/ProdutoForm';
import TableActions from '../components/TableActions';
import { normalizarProdutoPayload } from '../utils/normalizarProdutoPayload';
import { normalizarBuscaProduto } from '../utils/normalizarBuscaProduto';
import AuditoriaEntidadePanel from '../components/auditoria/AuditoriaEntidadePanel';

const Produtos = () => {
  const toast = useRef(null);

  const [produtos, setProdutos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });

  const filtrosIniciais = { nome: '', id_categoria: [], fornecedor_id: [] };
  const [filtros, setFiltros] = useState(filtrosIniciais);

  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const onPage = (event) => setLazyParams(event);

  useEffect(() => {
    fetchCategorias();
    fetchFornecedores();
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [lazyParams]);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const params = {
        page: lazyParams.page + 1,
        per_page: lazyParams.rows,
        view: 'lista',
      };

      const nomeBusca = normalizarBuscaProduto(filtros.nome);
      if (nomeBusca) {
        params.nome = nomeBusca;
      }

      if (filtros.id_categoria?.length > 0) {
        params.id_categoria = filtros.id_categoria;
      }

      if (filtros.fornecedor_id?.length) {
        params.fornecedor_id = filtros.fornecedor_id;
      }

      const response = await listarProdutos(params);
      const { data, meta } = response.data;

      setProdutos(data);
      setTotalRecords(meta.total || 0);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produtos', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const toArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.dados?.results)) return res.dados.results;
    if (Array.isArray(res?.dados)) return res.dados;
    if (Array.isArray(res?.results)) return res.results;
    return [];
  };

  const fetchCategorias = async () => {
    try {
      const response = await apiEstoque.get('/categorias');
      setCategorias(toArray(response.data));
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar categorias', life: 3000 });
    }
  };

  const fetchFornecedores = async () => {
    try {
      const response = await apiEstoque.get('/fornecedores');
      setFornecedores(toArray(response.data));
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar fornecedores', life: 3000 });
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
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar produto', life: 3000 });
    }
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: 'Tem certeza que deseja deletar este produto?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await apiEstoque.delete(`/produtos/${id}`);
          await fetchProdutos();
          toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto deletado', life: 3000 });
        } catch (error) {
          if (error.response?.status === 422 && error.response?.data?.message) {
            toast.current.show({
              severity: 'warn',
              summary: 'Não permitido',
              detail: error.response.data.message,
              life: 5000
            });
          } else {
            toast.current.show({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao deletar produto',
              life: 3000
            });
          }
        }
      }
    });
  };

  const handleFormSubmit = async (produtoData) => {
    try {
      const formData = new FormData();
      const payload = normalizarProdutoPayload(produtoData);

      // Valida????o b??sica no front-end
      if (!payload.nome || !payload.id_categoria) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Preencha o nome e a categoria do produto.',
          life: 4000
        });
        throw new Error('Campos obrigat??rios ausentes');
      }

      formData.append('nome', payload.nome);
      formData.append('descricao', payload.descricao || '');
      formData.append('id_categoria', payload.id_categoria ?? '');
      formData.append('id_fornecedor', payload.id_fornecedor ?? '');
      formData.append('altura', payload.altura ?? '');
      formData.append('largura', payload.largura ?? '');
      formData.append('profundidade', payload.profundidade ?? '');
      formData.append('peso', payload.peso ?? '');
      formData.append('ativo', payload.ativo ?? 1);
      formData.append('motivo_desativacao', payload.motivo_desativacao || '');
      formData.append('estoque_minimo', payload.estoque_minimo ?? '');

      if (payload.manualArquivo instanceof File) {
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(payload.manualArquivo.type)) {
          toast.current?.show({
            severity: 'warn',
            summary: 'Arquivo inv??lido',
            detail: 'O manual deve ser um arquivo PDF.',
            life: 4000,
          });
          throw new Error('Arquivo de manual inv??lido');
        }

        formData.append('manual_conservacao', payload.manualArquivo);
      }

      let response;

      if (editingProduto) {
        formData.append('_method', 'PUT');
        response = await apiEstoque.post(`/produtos/${editingProduto.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await apiEstoque.post('/produtos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await fetchProdutos();
      return response;
    } catch (error) {
      throw error;
    }
  };

const categoriaBodyTemplate = (rowData) =>
    categorias.find(c => c.id === rowData.id_categoria)?.nome || '—';

  const fornecedorBodyTemplate = (rowData) =>
    fornecedores.find(f => f.id === rowData.id_fornecedor)?.nome || '—';

  const aplicarFiltros = () => {
    setLazyParams(prev => ({ ...prev, page: 0, first: 0 }));
  };

  const limparFiltros = () => {
    setFiltros(filtrosIniciais);
    setLazyParams(prev => ({ ...prev, page: 0, first: 0 }));
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} position="top-center" />
      <ConfirmDialog />

      <div className="produto-gestao p-4">
        <div className="flex justify-content-between align-items-center mb-3">
          <h1 className="m-0">Gestão de Produtos</h1>
          <div className="flex gap-2">
            <Button label="Atualizar" icon="pi pi-refresh" onClick={fetchProdutos} className="p-button-secondary" />
            <Button label="Novo Produto" icon="pi pi-plus" onClick={openNewProdutoDialog} className="p-button-success" />
          </div>
        </div>

        <div className="surface-100 p-3 mb-4 border-round">
          <div className="formgrid grid">
            <div className="field col-12 md:col-4">
              <label htmlFor="filtro-nome">Nome</label>
              <InputText
                id="filtro-nome"
                value={filtros.nome}
                onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                placeholder="Filtrar por nome, referência ou código de barras"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label htmlFor="filtro-categoria">Categoria</label>
              <MultiSelect
                id="filtro-categoria"
                value={filtros.id_categoria}
                options={Array.isArray(categorias) ? categorias : []}
                onChange={(e) => setFiltros({ ...filtros, id_categoria: e.value })}
                optionLabel="nome"
                optionValue="id"
                placeholder="Todas as categorias"
                display="chip"
                className="w-full"
                filter
              />
            </div>

            <div className="field col-12 md:col-4">
              <label htmlFor="filtro-fornecedor">Fornecedor</label>
              <MultiSelect
                id="filtro-fornecedor"
                value={filtros.fornecedor_id}
                options={Array.isArray(fornecedores) ? fornecedores : []}
                optionLabel="nome"
                optionValue="id"
                onChange={(e) => setFiltros({ ...filtros, fornecedor_id: e.value })}
                placeholder="Todos"
                display="chip"
                filter
              />
            </div>

            <div className="col-12 flex justify-content-end gap-2 mt-2">
              <Button
                label="Buscar"
                icon="pi pi-search"
                className="p-button-sm"
                onClick={aplicarFiltros}
              />
              <Button
                label="Limpar Filtros"
                icon="pi pi-times"
                className="p-button-sm p-button-secondary"
                onClick={limparFiltros}
              />
            </div>
          </div>
        </div>

        <Divider className="mb-3"/>

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
          <Column field="id" header="ID"/>
          <Column field="nome" header="Nome"/>
          <Column field="fornecedor" header="Fornecedor" body={fornecedorBodyTemplate}/>
          <Column field="categoria" header="Categoria" body={categoriaBodyTemplate}/>
          <Column
            header="Ações"
            body={(rowData) => (
              <TableActions
                rowData={rowData}
                onEdit={openEditDialog}
                onDelete={() => handleDelete(rowData.id)}
              />
            )}
            style={{ textAlign: 'center', width: '120px' }}
          />
        </DataTable>
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '90vw', maxWidth: '1100px' }}
        modal
        onHide={() => setShowDialog(false)}
      >
        <ProdutoForm
          initialData={editingProduto || {}}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowDialog(false)}
        />

        {editingProduto?.id && (
          <div className="mt-4">
            <AuditoriaEntidadePanel
              auditableType="Produto"
              auditableId={editingProduto.id}
              titulo="Historico do Produto"
            />
          </div>
        )}
      </Dialog>
    </SakaiLayout>
  );
};

export default Produtos;
