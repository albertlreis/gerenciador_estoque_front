import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { useProdutoForm } from './produto/useProdutoForm';
import ProdutoVariacoes from './produto/ProdutoVariacoes';
import ProdutoImagens from './produto/ProdutoImagens';
import OutletFormDialog from './OutletFormDialog';
import apiEstoque from "../services/apiEstoque";

const ProdutoForm = ({ initialData = {}, onSubmit, onCancel }) => {
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
  } = useProdutoForm(initialData);

  const [showOutletDialog, setShowOutletDialog] = React.useState(false);
  const [variacaoSelecionada, setVariacaoSelecionada] = React.useState(null);

  const abrirDialogOutlet = (variacao) => {
    setVariacaoSelecionada(variacao);
    setShowOutletDialog(true);
  };

  const atualizarVariacoes = async () => {
    if (!variacaoSelecionada?.id) return;
    try {
      const response = await apiEstoque.get(`/variacoes/${variacaoSelecionada.id}`);
      const nova = response.data;
      const novas = [...variacoes];
      const index = novas.findIndex((v) => v.id === nova.id);
      if (index !== -1) {
        novas[index] = { ...novas[index], ...nova };
        setVariacoes(novas);
      }
      toastRef.current?.show({
        severity: 'success',
        summary: 'Outlet atualizado',
        detail: 'Os dados da variação foram atualizados.',
        life: 3000
      });
    } catch {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível atualizar a variação.',
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
        id_categoria: idCategoria?.id || null,
        id_fornecedor: idFornecedor || null,
        variacoes
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

          {/* Variações */}
          <ProdutoVariacoes
            variacoes={variacoes}
            setVariacoes={setVariacoes}
            abrirDialogOutlet={abrirDialogOutlet}
          />

          {/* Imagens */}
          {initialData.id && (
            <ProdutoImagens
              produtoId={initialData.id}
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
        onHide={() => setShowOutletDialog(false)}
        variacao={variacaoSelecionada}
        onSuccess={atualizarVariacoes}
      />
    </>
  );
};

export default ProdutoForm;
