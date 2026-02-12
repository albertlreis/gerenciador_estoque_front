import React, { useRef, useState } from 'react';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import SakaiLayout from '../layouts/SakaiLayout';
import FiltroLateral from '../components/FiltroLateral';
import CatalogoGrid from '../components/CatalogoGrid';
import OverlayLoading from '../components/OverlayLoading';
import CarrinhoSidebar from '../components/CarrinhoSidebar';
import SelecionarVariacaoDialog from '../components/SelecionarVariacaoDialog';
import NovoCarrinhoDialog from '../components/NovoCarrinhoDialog';
import CarrinhoAcoes from '../components/CarrinhoAcoes';
import ProdutoForm from '../components/produto/ProdutoForm';

import { useCarrinho } from '../context/CarrinhoContext';
import { useCatalogoProdutos } from '../hooks/useCatalogoProdutos';
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';
import { normalizarProdutoPayload } from '../utils/normalizarProdutoPayload';
import { getQuantidadeDisponivelVariacao } from '../utils/estoqueVariacao';
import api from '../services/apiEstoque';

const filtrosIniciais = {
  nome: '',
  categoria: [],
  ativo: null,
  outlet: null,
  atributos: {},
  estoque_status: null,
};

const CatalogoProdutos = () => {
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [dialogNovoCarrinho, setDialogNovoCarrinho] = useState(false);
  const [dialogVariacaoVisible, setDialogVariacaoVisible] = useState(false);
  const [carrinhoVisible, setCarrinhoVisible] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [dialogEditarVisible, setDialogEditarVisible] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [loadingProduto, setLoadingProduto] = useState(false);

  const toast = useRef(null);

  const { has } = usePermissions();
  const podeEditarCompleto = has([PERMISSOES.PRODUTOS.EDITAR, PERMISSOES.PRODUTOS.GERENCIAR]);
  const somenteImagens = !podeEditarCompleto;

  const {
    carrinhos,
    carrinhoAtual,
    carregarCarrinho,
    criarCarrinho,
    adicionarItem,
    quantidadeTotal
  } = useCarrinho();

  const {
    produtos,
    loading,
    sentinelaRef,
    atualizarProdutoNaLista
  } = useCatalogoProdutos(filtros);

  const handleAdicionarAoCarrinho = (produtoComVariacoesDoGrupo) => {
    if (!produtoComVariacoesDoGrupo?.variacoes?.length || !carrinhoAtual) {
      toast.current.show({
        severity: 'warn',
        summary: 'Carrinho não selecionado',
        detail: 'Escolha ou crie um carrinho.',
      });
      return;
    }

    setProdutoSelecionado(produtoComVariacoesDoGrupo);
    setVariacaoSelecionada(null);
    setDialogVariacaoVisible(true);
  };

  const handleFiltrosChange = (patch) => {
    setFiltros((prev) => ({ ...prev, ...patch }));
  };

  const resetarFiltros = () => {
    setFiltros(filtrosIniciais);
  };

  const abrirDialogCarrinho = async () => {
    const { data } = await api.get('/clientes');
    setClientes(data);
    setDialogNovoCarrinho(true);
  };

  const confirmarNovoCarrinho = async () => {
    if (!clienteSelecionado) return;
    await criarCarrinho(clienteSelecionado);
    setDialogNovoCarrinho(false);
    setClienteSelecionado(null);
  };

  const confirmarVariacao = () => {
    const quantidadeDisponivel = getQuantidadeDisponivelVariacao(variacaoSelecionada);
    if (quantidadeDisponivel <= 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Sem estoque',
        detail: 'Esta variação está esgotada no momento.',
        life: 3000,
      });
      return;
    }

    const precoBase = Number(variacaoSelecionada.preco);
    const outlet = variacaoSelecionada.outletSelecionado;
    const desconto = outlet ? outlet.percentual_desconto : 0;
    const precoFinal = precoBase * (1 - desconto / 100);

    adicionarItem({
      id_variacao: variacaoSelecionada.id,
      quantidade: 1,
      preco_unitario: precoFinal,
      subtotal: precoFinal,
      outlet_id: outlet?.id ?? null
    });

    setDialogVariacaoVisible(false);
    setAnimateCart(true);
    setCarrinhoVisible(true);
  };

  const carregarProdutoParaEdicao = async (produtoId, silent = false) => {
    if (!produtoId) return;
    try {
      const response = await api.get(`/produtos/${produtoId}`);
      const produtoAtualizado = response.data?.data || response.data;
      setProdutoEditando(produtoAtualizado);
      atualizarProdutoNaLista(produtoAtualizado);
      if (!silent) {
        toast.current?.show({
          severity: 'success',
          summary: 'Produto atualizado',
          detail: 'Dados recarregados com sucesso.',
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'N?o foi poss?vel recarregar o produto.',
        life: 3000,
      });
    }
  };

  const abrirEdicaoProduto = async (grupo) => {
    const produtoId = grupo?.produto?.id;
    if (!produtoId) return;

    setLoadingProduto(true);
    try {
      const response = await api.get(`/produtos/${produtoId}`);
      const produto = response.data?.data || response.data;
      setProdutoEditando(produto);
      setDialogEditarVisible(true);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Erro ao carregar produto para edi??o.',
        life: 3000,
      });
    } finally {
      setLoadingProduto(false);
    }
  };

  const fecharDialogEditar = () => {
    setDialogEditarVisible(false);
    setProdutoEditando(null);
  };

  const handleSubmitProduto = async (produtoData) => {
    if (!produtoEditando?.id) return;

    const payload = normalizarProdutoPayload(produtoData);

    if (!payload.nome || !payload.id_categoria) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigat?rios',
        detail: 'Preencha o nome e a categoria do produto.',
        life: 4000,
      });
      throw new Error('Campos obrigat?rios ausentes');
    }

    const formData = new FormData();
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
          summary: 'Arquivo inv?lido',
          detail: 'O manual deve ser um arquivo PDF.',
          life: 4000,
        });
        throw new Error('Arquivo de manual inv?lido');
      }
      formData.append('manual_conservacao', payload.manualArquivo);
    }

    formData.append('_method', 'PUT');

    const response = await api.post(`/produtos/${produtoEditando.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    await carregarProdutoParaEdicao(produtoEditando.id, true);
    return response;
  };

  return (
    <SakaiLayout defaultSidebarCollapsed={true}>
      <Toast ref={toast} />

      <div className="grid p-4">
        <div className="col-12 md:col-3">
          <FiltroLateral filtros={filtros} onChange={handleFiltrosChange} disabled={loading} />
        </div>

        <div className="col-12 md:col-9">
          <div className="flex justify-content-between align-items-center mb-3">
            <h2>Catálogo de Produtos</h2>
            <CarrinhoAcoes
              carrinhoAtual={carrinhoAtual}
              carrinhos={carrinhos}
              carregarCarrinho={carregarCarrinho}
              abrirDialogCarrinho={abrirDialogCarrinho}
              quantidadeTotal={quantidadeTotal}
              setCarrinhoVisible={setCarrinhoVisible}
              animateCart={animateCart}
              setAnimateCart={setAnimateCart}
            />
          </div>

          <Divider />

          <div className="flex justify-content-end mb-3">
            <button
              className="p-button p-button-sm p-button-secondary"
              onClick={resetarFiltros}
              disabled={loading}
            >
              <i className="pi pi-filter-slash mr-2" />
              Limpar Filtros
            </button>
          </div>

          <OverlayLoading visible={loading && produtos.length === 0} message="Carregando produtos do catálogo...">
            <CatalogoGrid
              produtos={produtos}
              onAdicionarAoCarrinho={handleAdicionarAoCarrinho}
              onEditarProduto={abrirEdicaoProduto}
            />
            <div ref={sentinelaRef} style={{ height: '1px', marginTop: '80px' }} />
            {loading && produtos.length > 0 && (
              <p className="text-center mt-3 mb-4">Carregando mais produtos...</p>
            )}
          </OverlayLoading>

        </div>
      </div>

      <CarrinhoSidebar visible={carrinhoVisible} onHide={() => setCarrinhoVisible(false)} />

      <NovoCarrinhoDialog
        visible={dialogNovoCarrinho}
        onHide={() => setDialogNovoCarrinho(false)}
        clientes={clientes}
        setClientes={setClientes}                   // << novo
        clienteSelecionado={clienteSelecionado}
        setClienteSelecionado={setClienteSelecionado}
        onConfirmar={confirmarNovoCarrinho}
      />

      <SelecionarVariacaoDialog
        produto={produtoSelecionado}
        visible={dialogVariacaoVisible}
        onHide={() => setDialogVariacaoVisible(false)}
        variacaoSelecionada={variacaoSelecionada}
        setVariacaoSelecionada={setVariacaoSelecionada}
        onAdicionar={confirmarVariacao}
      />

      <Dialog
        header={`Editar Produto${produtoEditando?.nome ? ` - ${produtoEditando.nome}` : ''}`}
        visible={dialogEditarVisible}
        style={{ width: '900px', maxWidth: '95vw' }}
        modal
        onHide={fecharDialogEditar}
      >
        <OverlayLoading visible={loadingProduto} message="Carregando produto...">
          {produtoEditando ? (
            <ProdutoForm
              initialData={produtoEditando}
              onSubmit={handleSubmitProduto}
              onCancel={fecharDialogEditar}
              somenteImagens={somenteImagens}
              onAlterado={() => carregarProdutoParaEdicao(produtoEditando?.id, true)}
            />
          ) : (
            <div className="p-4 text-center text-color-secondary">Produto nÃ£o encontrado.</div>
          )}
        </OverlayLoading>
      </Dialog>
    </SakaiLayout>
  );
};

export default CatalogoProdutos;
