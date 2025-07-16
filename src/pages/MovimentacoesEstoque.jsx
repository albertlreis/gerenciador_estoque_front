import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import apiEstoque from '../services/apiEstoque';
import SakaiLayout from '../layouts/SakaiLayout';
import LocalizacaoEstoqueDialog from '../components/LocalizacaoEstoqueDialog';
import EstoqueFiltro from '../components/EstoqueFiltro';
import EstoqueAtual from '../components/EstoqueAtual';
import EstoqueMovimentacoes from '../components/EstoqueMovimentacoes';

const MovimentacoesEstoque = () => {
  const LOCAL_STORAGE_KEY = 'filtros_movimentacoes_estoque';

  const toast = useRef(null);
  const [searchParams] = useSearchParams();

  const [paginaEstoque, setPaginaEstoque] = useState(1);
  const [firstEstoque, setFirstEstoque] = useState(0);
  const [totalEstoque, setTotalEstoque] = useState(0);

  const [paginaMovs, setPaginaMovs] = useState(1);
  const [firstMovs, setFirstMovs] = useState(0);
  const [totalMovs, setTotalMovs] = useState(0);

  const [estoqueAtual, setEstoqueAtual] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [depositos, setDepositos] = useState([]);

  const [loadingEstoque, setLoadingEstoque] = useState(false);
  const [loadingMovs, setLoadingMovs] = useState(false);

  const [showLocalizacaoDialog, setShowLocalizacaoDialog] = useState(false);
  const [estoqueSelecionado, setEstoqueSelecionado] = useState(null);

  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    totalPecas: 0,
    totalDepositos: 0,
  });

  const [filtros, setFiltros] = useState({
    tipo: null,
    deposito: null,
    produto: '',
    periodo: null,
  });

  const tipos = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Saída', value: 'saida' },
  ];

  useEffect(() => {
    const depositoId = searchParams.get('deposito');
    const savedFilters = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedFilters) {
      setFiltros(JSON.parse(savedFilters));
    } else if (depositoId) {
      setFiltros((prev) => ({ ...prev, deposito: parseInt(depositoId) }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDepositos();
  }, []);

  useEffect(() => {
    fetchEstoqueAtual();
  }, [paginaEstoque]);

  useEffect(() => {
    fetchMovimentacoes();
  }, [paginaMovs]);

  const fetchEstoqueAtual = async () => {
    setLoadingEstoque(true);
    try {
      const formatDate = (d) => d instanceof Date ? d.toISOString().split('T')[0] : null;
      const filtroParams = {
        ...filtros,
        periodo:
          filtros.periodo?.length === 2 && filtros.periodo[1]
            ? [formatDate(filtros.periodo[0]), formatDate(filtros.periodo[1])]
            : null,
        page: paginaEstoque,
        per_page: 10,
      };

      const [estoqueRes, resumoRes] = await Promise.all([
        apiEstoque.get('/estoque/atual', { params: filtroParams }),
        apiEstoque.get('/estoque/resumo', { params: filtroParams }),
      ]);

      setEstoqueAtual(estoqueRes.data.data);
      setTotalEstoque(estoqueRes.data.meta?.total || 0);
      setResumo(resumoRes.data);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar estoque atual',
        life: 3000,
      });
    } finally {
      setLoadingEstoque(false);
    }
  };

  const fetchMovimentacoes = async () => {
    setLoadingMovs(true);
    try {
      const formatDate = (d) => d instanceof Date ? d.toISOString().split('T')[0] : null;
      const filtroParams = {
        ...filtros,
        periodo:
          filtros.periodo?.length === 2 && filtros.periodo[1]
            ? [formatDate(filtros.periodo[0]), formatDate(filtros.periodo[1])]
            : null,
        page: paginaMovs,
        per_page: 10,
      };

      const movsRes = await apiEstoque.get('/estoque/movimentacoes', {
        params: filtroParams,
      });

      setMovimentacoes(movsRes.data.data);
      setTotalMovs(movsRes.data.meta?.total || 0);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar movimentações',
        life: 3000,
      });
    } finally {
      setLoadingMovs(false);
    }
  };

  const fetchDepositos = async () => {
    try {
      const res = await apiEstoque.get('/depositos');
      setDepositos(res.data.map((dep) => ({ label: dep.nome, value: dep.id })));
    } catch (err) {
      console.error('Erro ao carregar depósitos');
    }
  };

  const handleBuscar = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtros));
    setPaginaEstoque(1);
    setPaginaMovs(1);
    setFirstEstoque(0);
    setFirstMovs(0);
    fetchEstoqueAtual();
    fetchMovimentacoes();
  };

  const handleLimpar = () => {
    setMovimentacoes([]);
    setEstoqueAtual([]);
    setResumo({ totalProdutos: 0, totalPecas: 0, totalDepositos: 0 });
    setPaginaEstoque(1);
    const reset = { tipo: null, deposito: null, produto: '', periodo: null };
    setFiltros(reset);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const verMovimentacoes = (produtoId) => {
    window.location.href = `/produtos/${produtoId}/movimentacoes`;
  };

  const abrirDialogLocalizacao = (estoqueId, localizacaoId = null) => {
    setEstoqueSelecionado({ estoqueId, localizacaoId });
    setShowLocalizacaoDialog(true);
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />

      <LocalizacaoEstoqueDialog
        visible={showLocalizacaoDialog}
        estoqueId={estoqueSelecionado?.estoqueId}
        localizacaoId={estoqueSelecionado?.localizacaoId}
        onHide={() => setShowLocalizacaoDialog(false)}
        toastRef={toast}
        onSaveSuccess={() => fetchEstoqueAtual()}
      />

      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Estoque e Movimentações</h2>
        </div>

        <EstoqueFiltro
          filtros={filtros}
          setFiltros={setFiltros}
          depositos={depositos}
          tipos={tipos}
          onBuscar={handleBuscar}
          onLimpar={handleLimpar}
        />

        <div className="grid mb-4">
          <div className="col-12 md:col-4">
            <Card title="Produtos" className="text-center">
              <i className="pi pi-box text-4xl text-primary mb-2 block" />
              <h3>{resumo.totalProdutos}</h3>
            </Card>
          </div>
          <div className="col-12 md:col-4">
            <Card title="Peças em Estoque" className="text-center">
              <i className="pi pi-inbox text-4xl text-success mb-2 block" />
              <h3>{resumo.totalPecas}</h3>
            </Card>
          </div>
          <div className="col-12 md:col-4">
            <Card title="Depósitos Ativos" className="text-center">
              <i className="pi pi-building text-4xl text-warning mb-2 block" />
              <h3>{resumo.totalDepositos}</h3>
            </Card>
          </div>
        </div>

        <EstoqueAtual
          data={estoqueAtual}
          loading={loadingEstoque}
          total={totalEstoque}
          first={firstEstoque}
          onPage={(e) => {
            setPaginaEstoque(e.page + 1);
            setFirstEstoque(e.first);
          }}
          onEditLocalizacao={(estoqueId, localizacaoId) => abrirDialogLocalizacao(estoqueId, localizacaoId)}
          verMovimentacoes={verMovimentacoes}
        />

        <EstoqueMovimentacoes
          data={movimentacoes}
          loading={loadingMovs}
          total={totalMovs}
          first={firstMovs}
          onPage={(e) => {
            setPaginaMovs(e.page + 1);
            setFirstMovs(e.first);
          }}
        />
      </div>
    </SakaiLayout>
  );
};

export default MovimentacoesEstoque;
