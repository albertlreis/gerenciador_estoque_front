import React, { useEffect, useRef, useState } from 'react';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';

import FiltroLateral from '../components/FiltroLateral';
import CatalogoGrid from '../components/CatalogoGrid';
import OverlayLoading from '../components/OverlayLoading';
import CarrinhoSidebar from '../components/CarrinhoSidebar';

import { useCarrinho } from '../context/CarrinhoContext';
import apiEstoque from '../services/apiEstoque';

const filtrosIniciais = {
  nome: '',
  categoria: [],
  ativo: null,
  atributos: {},
};

const CatalogoProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [loading, setLoading] = useState(false);
  const [carrinhoVisible, setCarrinhoVisible] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const toast = useRef(null);
  const { adicionarItem, limparCarrinho, quantidadeTotal } = useCarrinho();

  useEffect(() => {
    fetchProdutos();
  }, [filtros]);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await apiEstoque.get('/produtos', {
        params: {
          nome: filtros.nome,
          id_categoria: filtros.categoria,
          ativo: filtros.ativo,
          ...Object.entries(filtros.atributos || {}).reduce((acc, [chave, valores]) => {
            acc[`atributos[${chave}]`] = valores;
            return acc;
          }, {})
        },
      });
      setProdutos(response.data.data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const resetarFiltros = () => {
    setFiltros(filtrosIniciais);
  };

  const handleAdicionarAoCarrinho = (produto) => {
    const variacao = produto.variacoes?.[0];
    if (!variacao) return;

    adicionarItem({
      id_variacao: variacao.id,
      quantidade: 1,
      preco_unitario: Number(variacao.preco)
    });

    setAnimateCart(true);
    setCarrinhoVisible(true);
  };

  const onFinalizar = async ({ id_cliente, id_parceiro }) => {
    try {
      setFinalizando(true);
      toast.current.show({
        severity: 'info',
        summary: 'Processando...',
        detail: 'Enviando pedido, aguarde.',
        sticky: true
      });

      await apiEstoque.post('/pedidos', {
        id_cliente,
        id_parceiro,
        observacoes: 'Pedido via catálogo'
      });

      await limparCarrinho();
      setCarrinhoVisible(false);

      toast.current.clear();
      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Pedido finalizado com sucesso!',
        life: 3000
      });
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      toast.current.clear();
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao finalizar pedido.',
        life: 4000
      });
    } finally {
      setFinalizando(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />

      <div className="grid p-4">
        <div className="col-12 md:col-3">
          <FiltroLateral filtros={filtros} onChange={handleFiltroChange} disabled={loading} />
        </div>
        <div className="col-12 md:col-9">
          <div className="flex justify-content-between align-items-center mb-3">
            <h2>Catálogo de Produtos</h2>
            <div className="flex align-items-center gap-3">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  placeholder="Buscar por nome..."
                  value={filtros.nome}
                  onChange={(e) => handleFiltroChange({ nome: e.target.value })}
                  disabled={loading}
                />
              </span>
              <div className="relative cursor-pointer" onClick={() => setCarrinhoVisible(true)}>
                <i
                  className={`pi pi-shopping-cart text-2xl ${animateCart ? 'p-cart-pulse' : ''}`}
                  onAnimationEnd={() => setAnimateCart(false)}
                />
                {quantidadeTotal > 0 && (
                  <Badge value={quantidadeTotal} severity="info" className="p-overlay-badge" />
                )}
              </div>
            </div>
          </div>

          <Divider />

          <div className="flex justify-content-end mb-3">
            <Button
              label="Limpar Filtros"
              icon="pi pi-filter-slash"
              className="p-button-sm p-button-secondary"
              onClick={resetarFiltros}
              disabled={loading}
            />
          </div>

          <OverlayLoading visible={loading} message="Carregando produtos do catálogo...">
            <CatalogoGrid
              produtos={produtos}
              onAdicionarAoCarrinho={handleAdicionarAoCarrinho}
            />
          </OverlayLoading>
        </div>
      </div>

      <CarrinhoSidebar
        visible={carrinhoVisible}
        onHide={() => setCarrinhoVisible(false)}
        onFinalizar={onFinalizar}
        finalizando={finalizando}
      />
    </>
  );
};

export default CatalogoProdutos;
