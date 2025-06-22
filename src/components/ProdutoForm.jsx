import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import isEqual from 'lodash/isEqual';

import { useProdutoForm } from './produto/useProdutoForm';
import ProdutoVariacoes from './produto/ProdutoVariacoes';
import ProdutoImagens from './produto/ProdutoImagens';
import OutletFormDialog from './OutletFormDialog';
import apiEstoque from '../services/apiEstoque';

const ProdutoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [produto, setProduto] = useState(initialData);
  const [showOutletDialog, setShowOutletDialog] = useState(false);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [outletSelecionado, setOutletSelecionado] = useState(null);

  const {
    nome, setNome,
    descricao, setDescricao,
    idCategoria, setIdCategoria,
    idFornecedor, setIdFornecedor,
    categorias,
    fornecedores,
    variacoes, setVariacoes,
    existingImages, setExistingImages,
    loading, setLoading,
    totalSize, setTotalSize,
    toastRef,
    fileUploadRef,
    atualizarDados,
  } = useProdutoForm(produto);

  useEffect(() => {
    if (!isEqual(produto, initialData)) {
      setProduto(initialData);
    }
  }, [initialData]);

  const abrirDialogOutlet = (variacao, outlet = null) => {
    setVariacaoSelecionada(variacao);
    setOutletSelecionado(outlet);
    setShowOutletDialog(true);
  };

  const fecharDialogOutlet = () => {
    setShowOutletDialog(false);
    setOutletSelecionado(null);
  };

  const confirmarExcluirOutlet = (variacao, outlet) => {
    confirmDialog({
      message: 'Tem certeza que deseja excluir este outlet?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: async () => {
        try {
          await apiEstoque.delete(`/variacoes/${variacao.id}/outlet/${outlet.id}`);
          toastRef.current?.show({ severity: 'success', summary: 'Outlet excluído', life: 3000 });
          await atualizarProduto(true);
        } catch {
          toastRef.current?.show({ severity: 'error', summary: 'Erro ao excluir outlet', life: 3000 });
        }
      }
    });
  };

  const atualizarProduto = async (silent = false) => {
    try {
      const response = await apiEstoque.get(`/produtos/${produto.id}`);
      const produtoAtualizado = response.data?.data || response.data;
      atualizarDados(produtoAtualizado);
      setProduto(produtoAtualizado);

      if (!silent) {
        toastRef.current?.show({
          severity: 'success',
          summary: 'Produto atualizado',
          detail: 'Dados recarregados com sucesso.',
          life: 3000
        });
      }
    } catch {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível recarregar o produto.',
        life: 3000
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        nome,
        descricao,
        id_categoria: typeof idCategoria === 'object' ? idCategoria.id : idCategoria,
        id_fornecedor: idFornecedor || null,
        variacoes,
      };

      await onSubmit(productData);
    } catch {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar produto',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toastRef} position="top-center" />

      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="formgrid grid">
          <div className="field md:col-8">
            <label htmlFor="nome">Nome</label>
            <InputText id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="field md:col-4">
            <label htmlFor="categoria">Categoria</label>
            <Dropdown
              id="categoria"
              value={idCategoria}
              options={categorias}
              onChange={(e) => setIdCategoria(e.value)}
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione a categoria"
              filter
            />
          </div>

          <div className="field col-12">
            <label htmlFor="descricao">Descrição</label>
            <InputTextarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="fornecedor">Fornecedor</label>
            <Dropdown
              id="fornecedor"
              value={idFornecedor}
              options={fornecedores}
              onChange={(e) => setIdFornecedor(e.value)}
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione o fornecedor"
              filter
            />
          </div>

          <ProdutoVariacoes
            variacoes={variacoes}
            setVariacoes={setVariacoes}
            abrirDialogOutlet={abrirDialogOutlet}
            confirmarExcluirOutlet={confirmarExcluirOutlet}
          />

          {produto?.id && (
            <ProdutoImagens
              produtoId={produto.id}
              existingImages={existingImages}
              setExistingImages={setExistingImages}
              toastRef={toastRef}
              fileUploadRef={fileUploadRef}
              totalSize={totalSize}
              setTotalSize={setTotalSize}
            />
          )}

          <div className="field col-12 flex justify-content-end">
            <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading} className="mr-2" />
            <Button label="Cancelar" type="button" icon="pi pi-times" className="p-button-secondary" onClick={onCancel} />
          </div>
        </div>
      </form>

      <OutletFormDialog
        visible={showOutletDialog}
        onHide={fecharDialogOutlet}
        variacao={variacaoSelecionada}
        outlet={outletSelecionado}
        onSuccess={() => atualizarProduto(true)}
      />
    </>
  );
};

export default ProdutoForm;
