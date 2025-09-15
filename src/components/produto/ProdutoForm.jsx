// src/components/produto/ProdutoForm.jsx
import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { Panel } from 'primereact/panel';
import isEqual from 'lodash/isEqual';

import { useProdutoForm } from '../../hooks/useProdutoForm';
import ProdutoVariacoes from './ProdutoVariacoes';
import ProdutoImagens from './ProdutoImagens';
import apiEstoque from '../../services/apiEstoque';
import ProdutoManualConservacao from './ProdutoManualConservacao';
import DialogOutlet from './DialogOutlet';

const toNumberOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const ProdutoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [produto, setProduto] = useState(initialData);
  const [showOutletDialog, setShowOutletDialog] = useState(false);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [outletSelecionado, setOutletSelecionado] = useState(null);

  const [altura, setAltura] = useState(initialData.altura || '');
  const [largura, setLargura] = useState(initialData.largura || '');
  const [profundidade, setProfundidade] = useState(initialData.profundidade || '');
  const [peso, setPeso] = useState(initialData.peso || '');
  const [manualArquivo, setManualArquivo] = useState(null);

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
    toastRef,
    fileUploadRef,
    atualizarDados,
  } = useProdutoForm(produto);

  // Arrays "seguros" para os Dropdowns
  const categoriasSafe = Array.isArray(categorias) ? categorias : [];
  const fornecedoresSafe = Array.isArray(fornecedores) ? fornecedores : [];

  useEffect(() => {
    if (!isEqual(produto, initialData)) {
      setProduto((prev) => ({
        ...prev,
        ...initialData,
        ativo: initialData.ativo ?? 1,
        motivo_desativacao: initialData.motivo_desativacao || '',
        estoque_minimo: initialData.estoque_minimo || '',
      }));

      setAltura(initialData.altura || '');
      setLargura(initialData.largura || '');
      setProfundidade(initialData.profundidade || '');
      setPeso(initialData.peso || '');

      // normaliza os IDs para number|null para bater com optionValue="id"
      setIdCategoria(toNumberOrNull(initialData?.id_categoria));
      setIdFornecedor(toNumberOrNull(initialData?.id_fornecedor));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const calcularDisponivelOutlet = (variacao) => {
    const estoqueTotal = variacao?.estoque_total ?? variacao?.estoque?.quantidade ?? 0;
    const totalOutlets = (variacao?.outlets ?? []).reduce((acc, o) => acc + (o.quantidade ?? 0), 0);
    return Math.max(0, estoqueTotal - totalOutlets);
  };

  const abrirDialogOutlet = (variacao, outlet = null) => {
    // Bloqueia apenas para NOVO cadastro; edição continua liberada
    if (!outlet) {
      const disponivel = calcularDisponivelOutlet(variacao);
      if (disponivel <= 0) {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Sem disponibilidade',
          detail: 'Não há quantidade disponível para cadastrar outlet nesta variação.',
          life: 3500
        });
        return;
      }
    }

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
      setProduto((prev) => ({
        ...prev,
        ...produtoAtualizado,
      }));

      setAltura(produtoAtualizado.altura || '');
      setLargura(produtoAtualizado.largura || '');
      setProfundidade(produtoAtualizado.profundidade || '');
      setPeso(produtoAtualizado.peso || '');

      // re-normaliza IDs
      setIdCategoria(toNumberOrNull(produtoAtualizado?.id_categoria));
      setIdFornecedor(toNumberOrNull(produtoAtualizado?.id_fornecedor));

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
      const payload = {
        nome,
        descricao,
        id_categoria: toNumberOrNull(idCategoria),
        id_fornecedor: toNumberOrNull(idFornecedor),
        altura,
        largura,
        profundidade,
        peso,
        manualArquivo,
        ativo: Number(produto.ativo ?? 1),
        motivo_desativacao: produto.motivo_desativacao,
        estoque_minimo: produto.estoque_minimo,
      };

      await onSubmit(payload);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Salvo',
        detail: 'Informações gerais salvas com sucesso.',
        life: 3000
      });
    } catch (error) {
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

  const salvarOutlet = async (dados, outletEdicaoParam = null) => {
    try {
      if (outletEdicaoParam?.id) {
        await apiEstoque.put(
          `/variacoes/${variacaoSelecionada.id}/outlet/${outletEdicaoParam.id}`,
          dados
        );
        toastRef.current?.show({ severity: 'success', summary: 'Outlet atualizado com sucesso' });
      } else {
        await apiEstoque.post(`/variacoes/${variacaoSelecionada.id}/outlet`, dados);
        toastRef.current?.show({ severity: 'success', summary: 'Outlet registrado com sucesso' });
      }

      await atualizarProduto(true);
      return true;
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar outlet',
        detail: error?.response?.data?.message || 'Erro desconhecido',
        life: 4000
      });
      return false;
    }
  };

  return (
    <>
      <Toast ref={toastRef} position="top-center" />

      <form onSubmit={handleSubmit} className="p-fluid">
        <Panel header="Informações Gerais">
          <div className="formgrid grid">
            {/* Nome */}
            <div className="field md:col-12">
              <label htmlFor="nome" className="font-bold">Nome *</label>
              <InputText
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Digite o nome do produto"
              />
            </div>

            {/* Categoria */}
            <div className="field col-12 md:col-4">
              <label htmlFor="categoria" className="font-bold">Categoria *</label>
              <Dropdown
                id="categoria"
                value={idCategoria ?? null}
                options={categoriasSafe}
                onChange={(e) => setIdCategoria(toNumberOrNull(e.value))}
                optionLabel="nome"
                optionValue="id"
                placeholder="Selecione uma categoria"
                filter
                required
              />
            </div>

            {/* Fornecedor */}
            <div className="field col-12 md:col-8">
              <label htmlFor="fornecedor" className="font-bold">Fornecedor *</label>
              <Dropdown
                id="fornecedor"
                value={idFornecedor ?? null}
                options={fornecedoresSafe}
                onChange={(e) => setIdFornecedor(toNumberOrNull(e.value))}
                optionLabel="nome"
                optionValue="id"
                placeholder="Selecione um fornecedor"
                filter
                required
              />
            </div>

            {/* Descrição */}
            <div className="field col-12">
              <label htmlFor="descricao" className="font-bold">Descrição</label>
              <InputTextarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                autoResize
                placeholder="Adicione uma descrição opcional"
              />
            </div>

            {/* Dimensões e Peso */}
            <div className="field col-6 md:col-3">
              <label htmlFor="altura" className="font-bold">Altura (cm)</label>
              <InputText id="altura" value={altura} onChange={(e) => setAltura(e.target.value)} />
            </div>
            <div className="field col-6 md:col-3">
              <label htmlFor="largura" className="font-bold">Largura (cm)</label>
              <InputText id="largura" value={largura} onChange={(e) => setLargura(e.target.value)} />
            </div>
            <div className="field col-6 md:col-3">
              <label htmlFor="profundidade" className="font-bold">Profundidade (cm)</label>
              <InputText id="profundidade" value={profundidade} onChange={(e) => setProfundidade(e.target.value)} />
            </div>
            <div className="field col-6 md:col-3">
              <label htmlFor="peso" className="font-bold">Peso (kg)</label>
              <InputText id="peso" value={peso} onChange={(e) => setPeso(e.target.value)} />
            </div>

            {/* Estoque Mínimo */}
            <div className="field col-12 md:col-4">
              <label htmlFor="estoqueMinimo" className="font-bold">Estoque Mínimo</label>
              <InputText
                id="estoqueMinimo"
                value={produto.estoque_minimo || ''}
                onChange={(e) =>
                  setProduto((prev) => ({ ...prev, estoque_minimo: e.target.value }))
                }
                keyfilter="pint"
                placeholder="0"
              />
            </div>

            {/* Ativo + Motivo desativação */}
            <div className="field col-12 md:col-4">
              <label htmlFor="ativo" className="font-bold">Produto Ativo?</label>
              <Dropdown
                id="ativo"
                value={Number(produto.ativo ?? 1)}
                options={[
                  { label: 'Sim', value: 1 },
                  { label: 'Não', value: 0 }
                ]}
                onChange={(e) =>
                  setProduto((prev) => ({ ...prev, ativo: Number(e.value) }))
                }
                placeholder="Selecione"
              />
            </div>

            {Number(produto.ativo) === 0 && (
              <div className="field col-12 md:col-8">
                <label htmlFor="motivo" className="font-bold">Motivo da Desativação</label>
                <InputTextarea
                  id="motivo"
                  value={produto.motivo_desativacao || ''}
                  onChange={(e) =>
                    setProduto((prev) => ({ ...prev, motivo_desativacao: e.target.value }))
                  }
                  rows={2}
                  autoResize
                  placeholder="Ex: Produto fora de linha"
                />
              </div>
            )}

            <ProdutoManualConservacao
              produto={produto}
              manualArquivo={manualArquivo}
              setManualArquivo={setManualArquivo}
              toastRef={toastRef}
            />
          </div>

          <div className="mt-3 flex justify-content-end gap-2">
            <Button label="Salvar Dados" type="submit" icon="pi pi-check" loading={loading} />
            <Button
              label="Cancelar"
              type="button"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={onCancel}
            />
          </div>
        </Panel>

        <Panel header="Variações do Produto" className="mt-4">
          <p className="text-sm text-color-secondary mb-3">
            Um mesmo móvel pode ter diferentes variações,
            como <strong>cor</strong>, <strong>acabamento</strong> ou <strong>material</strong>.
          </p>

          <ProdutoVariacoes
            produtoId={produto?.id}
            toastRef={toastRef}
            loading={loading}
            setLoading={setLoading}
            variacoes={variacoes}
            setVariacoes={setVariacoes}
            abrirDialogOutlet={abrirDialogOutlet}
            confirmarExcluirOutlet={confirmarExcluirOutlet}
          />
        </Panel>

        {produto?.id && (
          <Panel header="Imagens do Produto" className="mt-4">
            <p className="text-sm text-color-secondary mb-3">
              As imagens são compartilhadas entre todas as variações do produto.
            </p>

            <ProdutoImagens
              produtoId={produto.id}
              existingImages={existingImages}
              setExistingImages={setExistingImages}
              toastRef={toastRef}
              fileUploadRef={fileUploadRef}
            />
          </Panel>
        )}
      </form>

      <DialogOutlet
        visible={showOutletDialog}
        onHide={fecharDialogOutlet}
        onSalvar={salvarOutlet}
        variacao={variacaoSelecionada}
        outletEdicao={outletSelecionado}
        onSuccess={() => atualizarProduto(true)}
      />
    </>
  );
};

export default ProdutoForm;
