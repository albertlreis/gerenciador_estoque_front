import React, { useRef, useState } from 'react';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';

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

  const toast = useRef(null);

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
    sentinelaRef
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
            <CatalogoGrid produtos={produtos} onAdicionarAoCarrinho={handleAdicionarAoCarrinho} />
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
    </SakaiLayout>
  );
};

export default CatalogoProdutos;
