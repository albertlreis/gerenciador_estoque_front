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
  });

  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [graficoPedidos, setGraficoPedidos] = useState({});
  const [graficoValores, setGraficoValores] = useState({});
  const [graficoStatus, setGraficoStatus] = useState(null);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [pedidosMes, setPedidosMes] = useState([]);
  const [clientesMes, setClientesMes] = useState([]);

  const [modalKpi, setModalKpi] = useState(null);
  const [exibirModalEstoque, setExibirModalEstoque] = useState(false);

  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingEstoqueBaixo, setLoadingEstoqueBaixo] = useState(true);

  const [periodo, setPeriodo] = useState(6);
  const [tipoGrafico, setTipoGrafico] = useState('bar');

  useEffect(() => {
    fetchKpis();
    fetchUltimosPedidos();
    fetchEstatisticas();
    fetchGraficoStatus();
    fetchEstoqueBaixo();
    fetchPedidosClientesMes();
  }, []);

  const fetchPedidosClientesMes = async () => {
    try {
      const res = await apiEstoque.get('/pedidos', { params: { page: 1, per_page: 200 } });
      const pedidos = res.data.data || [];
      const mesAtual = new Date().getMonth();

      const pedidosDoMes = pedidos.filter(p => new Date(p.data).getMonth() === mesAtual);
      setPedidosMes(pedidosDoMes);

      const clientesUnicos = [];
      const mapIds = new Set();

      pedidosDoMes.forEach(p => {
        if (p.cliente && !mapIds.has(p.cliente.id)) {
          mapIds.add(p.cliente.id);
          clientesUnicos.push(p.cliente);
        }
      });

      setClientesMes(clientesUnicos);
    } catch (err) {
      console.error('Erro ao buscar pedidos/clientes do mês', err);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      setLoadingEstatisticas(true);
      const { data } = await apiEstoque.get('/pedidos/estatisticas', { params: { meses: periodo } });
      const { labels, quantidades, valores } = data;

      setGraficoPedidos({
        labels,
        datasets: [{ label: 'Qtd. Pedidos', data: quantidades, backgroundColor: '#42A5F5' }]
      });

      setGraficoValores({
        labels,
        datasets: [{ label: 'Valor Acumulado', data: valores, backgroundColor: '#66BB6A' }]
      });
    } finally {
      setLoadingEstatisticas(false);
    }
  };

  const fetchUltimosPedidos = async () => {
    try {
      setLoadingPedidos(true);
      const res = await apiEstoque.get('/pedidos', {
        params: { page: 1, per_page: 5, ordenarPor: 'data_pedido', ordem: 'desc' }
      });
      const pedidos = res.data.data || [];
      setUltimosPedidos(pedidos.map(p => ({
        cliente: p.cliente?.nome || 'Cliente não informado',
        valor: Number(p.valor_total || 0).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),

        status: p.status
      })));
    } finally {
      setLoadingPedidos(false);
    }
  };

  const fetchKpis = async () => {
    try {
      setLoadingKpis(true);
      const res = await apiEstoque.get('/pedidos', { params: { page: 1, per_page: 100 } });
      const pedidos = res.data.data || [];
      const doMes = pedidos.filter(p => new Date(p.data).getMonth() === new Date().getMonth());
      const valorTotal = doMes.reduce((s, p) => s + Number(p.valor_total || 0), 0);
      const clientes = new Set(doMes.map(p => p.cliente?.id)).size;

      const statusCount = doMes.reduce((acc, p) => {
        const status = p.status;
        if (status === 'confirmado') acc.confirmado++;
        else if (status === 'cancelado') acc.cancelado++;
        else if (status === 'rascunho') acc.rascunho++;
        return acc;
      }, { confirmado: 0, cancelado: 0, rascunho: 0 });

      setKpis(prev => ({
        ...prev,
        pedidosMes: doMes.length,
        valorMes: valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        clientesUnicos: clientes,
        ticketMedio: doMes.length > 0 ? (valorTotal / doMes.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
        totalConfirmado: statusCount.confirmado,
        totalCancelado: statusCount.cancelado,
        totalRascunho: statusCount.rascunho,
      }));
    } finally {
      setLoadingKpis(false);
    }
  };

  const fetchGraficoStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await apiEstoque.get('/pedidos', { params: { page: 1, per_page: 200 } });
      const pedidos = res.data.data || [];
      const contagem = pedidos.reduce((acc, p) => {
        const s = p.status || 'outros';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      setGraficoStatus({
        labels: Object.keys(contagem),
        datasets: [{ data: Object.values(contagem), backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c', '#95a5a6'] }]
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchEstoqueBaixo = async () => {
    try {
      setLoadingEstoqueBaixo(true);
      const res = await apiEstoque.get('/produtos/estoque-baixo', { params: { limite: 5 } });
      const produtos = res.data;
      setEstoqueCritico(produtos);
      setKpis(prev => ({ ...prev, estoqueBaixo: produtos.length }));
    } finally {
      setLoadingEstoqueBaixo(false);
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
    loadingStatus,
    loadingEstoqueBaixo
  };
};

export default useDashboardData;
