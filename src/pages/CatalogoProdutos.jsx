import React, {useEffect, useRef, useState} from 'react';
import {Divider} from 'primereact/divider';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {Badge} from 'primereact/badge';
import {useNavigate} from 'react-router-dom';
import {Dropdown} from 'primereact/dropdown';
import {Dialog} from 'primereact/dialog';

import SakaiLayout from '../layouts/SakaiLayout';
import FiltroLateral from '../components/FiltroLateral';
import CatalogoGrid from '../components/CatalogoGrid';
import OverlayLoading from '../components/OverlayLoading';
import CarrinhoSidebar from '../components/CarrinhoSidebar';

import {useCarrinho} from '../context/CarrinhoContext';
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
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);
  const [loading, setLoading] = useState(false);
  const [carrinhoVisible, setCarrinhoVisible] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [dialogNovoCarrinho, setDialogNovoCarrinho] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [dialogVariacaoVisible, setDialogVariacaoVisible] = useState(false);

  const sentinelaRef = useRef(null);
  const toast = useRef(null);
  const navigate = useNavigate();

  const {
    carrinhos,
    carrinhoAtual,
    carregarCarrinho,
    criarCarrinho,
    adicionarItem,
    quantidadeTotal
  } = useCarrinho();

  const fetchProdutos = async (append = false) => {
    setLoading(true);
    try {
      const filtrosParaEnvio = {
        nome: filtros.nome?.trim() || null,
        id_categoria: filtros.categoria,
        ativo: filtros.ativo,
        is_outlet: filtros.outlet,
        estoque_status: filtros.estoque_status,
        ...Object.entries(filtros.atributos || {}).reduce((acc, [chave, valores]) => {
          acc[`atributos[${chave}]`] = valores;
          return acc;
        }, {})
      };

      Object.keys(filtrosParaEnvio).forEach((key) => {
        if (filtrosParaEnvio[key] === null) delete filtrosParaEnvio[key];
      });

      const response = await api.get('/produtos', {
        params: {...filtrosParaEnvio, page: pagina, per_page: 20}
      });

      const novos = response.data.data || [];
      setProdutos(prev => append ? [...prev, ...novos] : novos);
      const meta = response.data.meta || {};
      setTemMais(meta.current_page < meta.last_page);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPagina(1);
    setTemMais(true);
    fetchProdutos(false);
  }, [filtros]);

  useEffect(() => {
    if (pagina > 1) fetchProdutos(true);
  }, [pagina]);

  useEffect(() => {
    if (!temMais || loading || !sentinelaRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPagina(prev => prev + 1);
      }
    }, {threshold: 1});

    const target = sentinelaRef.current;
    observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [sentinelaRef.current, temMais, loading]);

  const handleAdicionarAoCarrinho = (produto) => {
    if (!produto?.variacoes?.length || !carrinhoAtual) {
      toast.current.show({
        severity: 'warn',
        summary: 'Carrinho não selecionado',
        detail: 'Escolha ou crie um carrinho.',
      });
      return;
    }

    console.log(produto)

    setProdutoSelecionado(produto);
    setVariacaoSelecionada(null);
    setDialogVariacaoVisible(true);
  };

  const resetarFiltros = () => {
    setFiltros(filtrosIniciais);
  };

  const abrirDialogCarrinho = async () => {
    const {data} = await api.get('/clientes');
    setClientes(data);
    setDialogNovoCarrinho(true);
  };

  const confirmarNovoCarrinho = async () => {
    if (!clienteSelecionado) return;
    await criarCarrinho(clienteSelecionado);
    setDialogNovoCarrinho(false);
    setClienteSelecionado(null);
  };

  return (
    <SakaiLayout defaultSidebarCollapsed={true}>
      <Toast ref={toast}/>
      <div className="grid p-4">
        <div className="col-12 md:col-3">
          <FiltroLateral filtros={filtros} onChange={setFiltros} disabled={loading}/>
        </div>
        <div className="col-12 md:col-9">
          <div className="flex justify-content-between align-items-center mb-3">
            <h2>Catálogo de Produtos</h2>
            <div className="flex gap-3 align-items-center">
              <Dropdown
                value={carrinhoAtual?.id || null}
                options={carrinhos}
                optionLabel={(c) => `Cliente: ${c.cliente?.nome || '---'}`}
                optionValue="id"
                placeholder="Selecionar carrinho"
                onChange={(e) => carregarCarrinho(e.value)}
                className="w-18rem"
              />
              <Button label="Novo Carrinho" icon="pi pi-plus" className="p-button-sm" onClick={abrirDialogCarrinho}/>
              <Button
                label="Finalizar"
                icon="pi pi-check"
                className="p-button-sm p-button-success"
                disabled={!carrinhoAtual}
                onClick={() => navigate(`/finalizar-pedido/${carrinhoAtual.id}`)}
              />
              <div className="relative cursor-pointer" onClick={() => setCarrinhoVisible(true)}>
                <i className={`pi pi-shopping-cart text-2xl ${animateCart ? 'p-cart-pulse' : ''}`}
                   onAnimationEnd={() => setAnimateCart(false)}/>
                {quantidadeTotal > 0 && (
                  <Badge value={quantidadeTotal} severity="info" className="p-overlay-badge"/>
                )}
              </div>
            </div>
          </div>

          <Divider/>

          <div className="flex justify-content-end mb-3">
            <Button label="Limpar Filtros" icon="pi pi-filter-slash" className="p-button-sm p-button-secondary"
                    onClick={resetarFiltros} disabled={loading}/>
          </div>

          <OverlayLoading visible={loading && pagina === 1} message="Carregando produtos do catálogo...">
            <CatalogoGrid produtos={produtos} onAdicionarAoCarrinho={handleAdicionarAoCarrinho}/>
            <div ref={sentinelaRef} style={{height: '1px', marginTop: '80px'}}/>
            {loading && pagina > 1 && (
              <p className="text-center mt-3 mb-4">Carregando mais produtos...</p>
            )}
          </OverlayLoading>
        </div>
      </div>

      <CarrinhoSidebar visible={carrinhoVisible} onHide={() => setCarrinhoVisible(false)}/>

      <Dialog header="Novo Carrinho" visible={dialogNovoCarrinho} onHide={() => setDialogNovoCarrinho(false)} modal>
        <div className="mb-3">
          <label>Cliente</label>
          <Dropdown
            value={clienteSelecionado}
            options={clientes}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => setClienteSelecionado(e.value)}
            placeholder="Selecione o cliente"
            className="w-full"
          />
        </div>
        <div className="flex justify-content-end">
          <Button label="Criar Carrinho" icon="pi pi-check" className="p-button-sm" onClick={confirmarNovoCarrinho}
                  disabled={!clienteSelecionado}/>
        </div>
      </Dialog>

      <Dialog
        header={`Selecionar Variação de ${produtoSelecionado?.nome}`}
        visible={dialogVariacaoVisible}
        onHide={() => setDialogVariacaoVisible(false)}
        modal
        style={{width: '80vw'}}
      >
        <div className="grid">
          {/* Imagem lateral do produto */}
          <div className="col-12 md:col-4 flex justify-content-center align-items-start mb-4">
            <img
              src={produtoSelecionado?.imagem_principal || '/placeholder.jpg'}
              alt={produtoSelecionado?.nome}
              style={{maxWidth: '100%', borderRadius: '8px'}}
            />
          </div>

          {/* Grid de variações com seleção visual */}
          <div className="col-12 md:col-8">
            <div className="grid">
              {(produtoSelecionado?.variacoes || []).map((variacao) => {
                const isSelecionada = variacaoSelecionada?.id === variacao.id;

                const atributos = new Map();
                (variacao.atributos || []).forEach(attr => {
                  const nome = attr.atributo?.toUpperCase();
                  if (nome && !atributos.has(nome)) {
                    atributos.set(nome, attr.valor?.toUpperCase());
                  }
                });

                const medidas = [
                  produtoSelecionado?.largura,
                  produtoSelecionado?.profundidade,
                  produtoSelecionado?.altura
                ].filter(Boolean).join(' X ');

                const estoqueQtd = variacao?.estoque?.quantidade ?? 0;

                return (
                  <div
                    key={variacao.id}
                    className={`col-12 md:col-6 cursor-pointer transition border-2 border-round p-3 
                          ${isSelecionada ? 'border-green-600 shadow-2' : 'border-gray-300 hover:border-primary'}`}
                    onClick={() => setVariacaoSelecionada(variacao)}
                  >
                    <div className="flex justify-content-between align-items-start mb-2">
                      <div className="text-sm font-semibold text-gray-800">{produtoSelecionado?.nome}</div>
                      {isSelecionada && <i className="pi pi-check-circle text-green-600 text-xl"/>}
                    </div>

                    <div className="text-xs text-gray-600 mb-1">Referência: {variacao.referencia}</div>
                    <div className="text-xs mb-2">MED: {medidas} CM</div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {[...atributos.entries()].map(([k, v], i) => (
                        <span key={i} className="text-xs px-2 py-1 border-round bg-gray-100">
                    {k}: {v}
                  </span>
                      ))}
                    </div>

                    <div className="flex justify-content-between align-items-center">
                <span className="text-green-700 font-bold text-sm">
                  R$ {Number(variacao.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
                      {estoqueQtd <= 0 ? (
                        <span className="text-red-600 text-xs">Esgotado</span>
                      ) : (
                        <span className="text-xs text-gray-500">Estoque: {estoqueQtd}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botão de ação separado */}
            <div className="mt-4 flex justify-content-end gap-2">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => {
                  setDialogVariacaoVisible(false);
                  setVariacaoSelecionada(null);
                }}
              />
              <Button
                label="Adicionar ao Carrinho"
                icon="pi pi-cart-plus"
                disabled={!variacaoSelecionada}
                onClick={() => {
                  adicionarItem({
                    id_variacao: variacaoSelecionada.id,
                    quantidade: 1,
                    preco_unitario: Number(variacaoSelecionada.preco),
                  });
                  setDialogVariacaoVisible(false);
                  setAnimateCart(true);
                  setCarrinhoVisible(true);
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </SakaiLayout>
  );
};

export default CatalogoProdutos;
