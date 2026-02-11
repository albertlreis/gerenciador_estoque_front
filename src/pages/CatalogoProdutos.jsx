import React, { useRef, useState } from 'react';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

import SakaiLayout from '../layouts/SakaiLayout';
import FiltroLateral from '../components/FiltroLateral';
import CatalogoGrid from '../components/CatalogoGrid';
import OverlayLoading from '../components/OverlayLoading';
import CarrinhoSidebar from '../components/CarrinhoSidebar';
import SelecionarVariacaoDialog from '../components/SelecionarVariacaoDialog';
import NovoCarrinhoDialog from '../components/NovoCarrinhoDialog';
import CarrinhoAcoes from '../components/CarrinhoAcoes';

import { useCarrinho } from '../context/CarrinhoContext';
import { useCatalogoProdutos } from '../hooks/useCatalogoProdutos';
import api from '../services/apiEstoque';
import ProdutoForm from '../components/produto/ProdutoForm';
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';
import { useAuth } from '../context/AuthContext';

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
  const [produtoEdicao, setProdutoEdicao] = useState(null);
  const [carregandoEdicao, setCarregandoEdicao] = useState(false);

  const toast = useRef(null);
  const { user } = useAuth();
  const { has } = usePermissions();

  const perfis = Array.isArray(user?.perfis) ? user.perfis : [];
  const isVendedor = perfis.some((p) => String(p).toLowerCase() === 'vendedor');
  const isEstoquista = perfis.some((p) => String(p).toLowerCase() === 'estoquista');
  const isAdmin = perfis.some((p) => String(p).toLowerCase() === 'administrador');
  const podeEditarCompleto =
    has([PERMISSOES.PRODUTOS.EDITAR, PERMISSOES.PRODUTOS.GERENCIAR]) || isAdmin || isEstoquista;
  const somenteImagens = isVendedor && !podeEditarCompleto;

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
    atualizarProdutoNaLista,
    refresh
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

  const abrirEdicaoProduto = async (grupo) => {
    const produtoId = grupo?.produto?.id ?? grupo?.id;
    if (!produtoId) return;

    if (!podeEditarCompleto && !isVendedor) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Sem permissão',
        detail: 'Você não tem permissão para editar este produto.',
        life: 3000,
      });
      return;
    }

    setCarregandoEdicao(true);
    try {
      const response = await api.get(`/produtos/${produtoId}`);
      const produto = response.data?.data || response.data;
      setProdutoEdicao(produto);
      setDialogEditarVisible(true);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar produto para edição.',
        life: 3000,
      });
    } finally {
      setCarregandoEdicao(false);
    }
  };

  const salvarEdicaoProduto = async (produtoData) => {
    if (!produtoEdicao?.id) return;

    const formData = new FormData();

    if (!produtoData.nome || !produtoData.id_categoria) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha o nome e a categoria do produto.',
        life: 4000,
      });
      throw new Error('Campos obrigatórios ausentes');
    }

    formData.append('nome', produtoData.nome);
    formData.append('descricao', produtoData.descricao || '');
    formData.append('id_categoria', produtoData.id_categoria);
    formData.append('id_fornecedor', produtoData.id_fornecedor || '');
    formData.append('altura', produtoData.altura || '');
    formData.append('largura', produtoData.largura || '');
    formData.append('profundidade', produtoData.profundidade || '');
    formData.append('peso', produtoData.peso || '');
    formData.append('ativo', produtoData.ativo ?? 1);
    formData.append('motivo_desativacao', produtoData.motivo_desativacao || '');
    formData.append('estoque_minimo', produtoData.estoque_minimo || '');

    if (produtoData.manualArquivo instanceof File) {
      formData.append('manual_conservacao', produtoData.manualArquivo);
    }

    formData.append('_method', 'PUT');

    const response = await api.post(`/produtos/${produtoEdicao.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Produto atualizado com sucesso',
      life: 3000,
    });

    refresh();
    atualizarProdutoNaLista(response.data?.data || response.data || {});

    return response;
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
              estoqueStatus={filtros.estoque_status}
              onAdicionarAoCarrinho={handleAdicionarAoCarrinho}
              onProdutoAtualizado={atualizarProdutoNaLista}
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
        apenasComEstoque={filtros.estoque_status === 'com_estoque'}
        onAdicionar={confirmarVariacao}
      />

      <Dialog
        header="Editar Produto"
        visible={dialogEditarVisible}
        style={{ width: '900px' }}
        modal
        onHide={() => setDialogEditarVisible(false)}
      >
        {carregandoEdicao || !produtoEdicao ? (
          <div className="text-center p-4 text-color-secondary">Carregando...</div>
        ) : (
          <ProdutoForm
            initialData={produtoEdicao}
            onSubmit={salvarEdicaoProduto}
            onCancel={() => setDialogEditarVisible(false)}
            somenteImagens={somenteImagens}
            onAlterado={refresh}
          />
        )}
      </Dialog>
    </SakaiLayout>
  );
};

export default CatalogoProdutos;
