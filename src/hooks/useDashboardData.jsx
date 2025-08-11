import { useEffect, useState } from 'react';
import apiEstoque from '../services/apiEstoque';

const useDashboardData = () => {
  const [kpis, setKpis] = useState({
    pedidosMes: 0,
    valorMes: 'R$ 0,00',
    clientesUnicos: 0,
    estoqueBaixo: 0,
    ticketMedio: 'R$ 0,00',
    totalConfirmado: 0,
    totalCancelado: 0,
    totalRascunho: 0,
    outletSugeridos: 0,
  });

  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [graficoPedidos, setGraficoPedidos] = useState({});
  const [graficoValores, setGraficoValores] = useState({});
  const [graficoStatus, setGraficoStatus] = useState(null);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [pedidosMes, setPedidosMes] = useState([]);
  const [clientesMes, setClientesMes] = useState([]);

  const [sugestoesOutlet, setSugestoesOutlet] = useState([]);
  const [diasLimiteOutlet, setDiasLimiteOutlet] = useState(null);

  const [modalKpi, setModalKpi] = useState(null);
  const [exibirModalEstoque, setExibirModalEstoque] = useState(false);

  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true);
  const [loadingEstoqueBaixo, setLoadingEstoqueBaixo] = useState(true);
  const [loadingConsignacoes, setLoadingConsignacoes] = useState(true);
  const [loadingSugestoesOutlet, setLoadingSugestoesOutlet] = useState(true);

  const [periodo, setPeriodo] = useState(6);
  const [tipoGrafico, setTipoGrafico] = useState('bar');

  const [consignacoesVencendo, setConsignacoesVencendo] = useState([]);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      setLoadingKpis(true);
      setLoadingPedidos(true);
      setLoadingEstatisticas(true);
      setLoadingEstoqueBaixo(true);
      setLoadingConsignacoes(true);

      await Promise.all([
        fetchResumoDashboard(),
        fetchEstatisticas(),
        fetchEstoqueBaixo(),
        carregarConsignacoesVencendo(),
        fetchSugestoesOutlet(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoadingKpis(false);
      setLoadingPedidos(false);
      setLoadingEstatisticas(false);
      setLoadingEstoqueBaixo(false);
      setLoadingConsignacoes(false);
    }
  };

  const fetchResumoDashboard = async (forcarAtualizacao = false) => {
    try {
      if (!forcarAtualizacao) {
        const cacheString = sessionStorage.getItem('dashboardResumo');
        const cache = cacheString ? JSON.parse(cacheString) : null;

        if (cache && Date.now() - cache.timestamp < 5 * 60 * 1000) {
          aplicarResumo(cache.data);
          return;
        }
      }

      const { data } = await apiEstoque.get('/dashboard/resumo');
      aplicarResumo(data);
      sessionStorage.setItem('dashboardResumo', JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.error('Erro ao buscar resumo do dashboard', err);
    }
  };

  const aplicarResumo = (data) => {
    const {
      kpis: dadosKpi,
      ultimosPedidos,
      statusGrafico,
      pedidosMes,
      clientesMes,
      outletSugeridos,
    } = data;

    setKpis(prev => ({
      ...prev,
      pedidosMes: dadosKpi.pedidosMes,
      valorMes: dadosKpi.valorMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      clientesUnicos: dadosKpi.clientesUnicos,
      ticketMedio: dadosKpi.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      totalConfirmado: dadosKpi.totalConfirmado,
      totalCancelado: dadosKpi.totalCancelado,
      totalRascunho: dadosKpi.totalRascunho,
      estoqueBaixo: kpis.estoqueBaixo,
      outletSugeridos: outletSugeridos ?? prev.outletSugeridos,
    }));

    setUltimosPedidos(ultimosPedidos);
    setGraficoStatus({
      labels: Object.keys(statusGrafico),
      datasets: [{
        data: Object.values(statusGrafico),
        backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c', '#95a5a6'],
      }],
    });

    setPedidosMes(pedidosMes);
    setClientesMes(clientesMes);
  };

  const fetchEstatisticas = async () => {
    try {
      const { data } = await apiEstoque.get('/pedidos/estatisticas', { params: { meses: periodo } });

      setGraficoPedidos({
        labels: data.labels,
        datasets: [{ label: 'Qtd. Pedidos', data: data.quantidades, backgroundColor: '#42A5F5' }],
      });

      setGraficoValores({
        labels: data.labels,
        datasets: [{ label: 'Valor Acumulado', data: data.valores, backgroundColor: '#66BB6A' }],
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas', err);
    }
  };

  const fetchEstoqueBaixo = async () => {
    try {
      const res = await apiEstoque.get('/produtos/estoque-baixo', { params: { limite: 5 } });
      setEstoqueCritico(res.data);
      setKpis(prev => ({ ...prev, estoqueBaixo: res.data.length }));
    } catch (err) {
      console.error('Erro ao carregar estoque baixo', err);
    }
  };

  const fetchSugestoesOutlet = async () => {
    try {
      const { data } = await apiEstoque.get('/produtos/sugestoes-outlet', { params: { limite: 5 } });
      // Estrutura esperada:
      // data = { itens: [...], dias_limite: número }  OU  data = [...]
      const itens = Array.isArray(data) ? data : (data.itens ?? []);
      const diasLimite = Array.isArray(data) ? null : (data.dias_limite ?? null);

      setSugestoesOutlet(itens);
      if (diasLimite !== null) setDiasLimiteOutlet(diasLimite);

      setKpis(prev => ({ ...prev, outletSugeridos: itens.length }));
    } catch (err) {
      console.error('Erro ao carregar sugestões de outlet', err);
      setSugestoesOutlet([]);
      setKpis(prev => ({ ...prev, outletSugeridos: 0 }));
    }
  };

  const carregarConsignacoesVencendo = async () => {
    try {
      const { data } = await apiEstoque.get('/consignacoes', {
        params: {
          vencimento_proximo: true,
          status: 'pendente',
          per_page: 3,
          page: 1
        }
      });

      setConsignacoesVencendo(data.data);
    } catch (err) {
      console.error('Erro ao buscar consignações vencendo', err);
      setConsignacoesVencendo([]);
    }
  };

  const handleAtualizarGrafico = () => fetchEstatisticas();

  return {
    kpis,
    ultimosPedidos,
    graficoPedidos,
    graficoValores,
    graficoStatus,
    estoqueCritico,
    pedidosMes,
    clientesMes,
    modalKpi,
    setModalKpi,
    exibirModalEstoque,
    setExibirModalEstoque,
    periodo,
    setPeriodo,
    tipoGrafico,
    setTipoGrafico,
    handleAtualizarGrafico,
    loadingKpis,
    loadingPedidos,
    loadingEstatisticas,
    loadingStatus: loadingEstatisticas,
    loadingEstoqueBaixo,
    consignacoesVencendo,
    loadingConsignacoes,
    sugestoesOutlet,
    diasLimiteOutlet,
    loadingSugestoesOutlet,
    fetchResumoDashboard,
  };
};

export default useDashboardData;
