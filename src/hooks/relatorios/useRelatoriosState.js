import { useMemo, useState, useCallback } from 'react';
import { TIPO } from '../../modules/relatorios/relatorios.constants';
import { toIsoDate } from '../../utils/date/dateHelpers';
import { STATUS_CONSIGNACAO_OPTIONS } from '../../constants/statusConsignacao';
import { STATUS_MAP } from '../../constants/statusPedido';

export function useRelatoriosState() {
  const [tipo, setTipo] = useState(null);

  // Pedidos
  const [periodoPedidos, setPeriodoPedidos] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [vendedorId, setVendedorId] = useState(null);
  const [statusPedido, setStatusPedido] = useState(null); // NOVO

  // Estoque
  const [depositoIds, setDepositoIds] = useState([]);
  const [somenteOutlet, setSomenteOutlet] = useState(false);
  const [somenteSemEstoque, setSomenteSemEstoque] = useState(false); // NOVO

  // Consignações
  const [statusConsig, setStatusConsig] = useState(null);
  const [periodoEnvio, setPeriodoEnvio] = useState(null);
  const [periodoVencimento, setPeriodoVencimento] = useState(null);
  const [consolidado, setConsolidado] = useState(false);

  // Busca assistida (seleções)
  const [categoria, setCategoria] = useState(null); // { id, label }
  const [produto, setProduto] = useState(null);     // { id, label, sku }
  const [fornecedor, setFornecedor] = useState(null); // NOVO: { id, label }

  // UI de inputs controlados
  const [catInput, setCatInput] = useState('');
  const [fornInput, setFornInput] = useState(''); // NOVO

  const filtros = useMemo(
    () => ({
      // estoque
      depositoIds,
      somenteOutlet,
      somenteSemEstoque,
      categoria,
      produto,
      fornecedor,

      // pedidos
      periodoPedidos,
      clienteId,
      parceiroId,
      vendedorId,
      statusPedido,

      // consignações
      statusConsig,
      periodoEnvio,
      periodoVencimento,
      consolidado,
    }),
    [
      depositoIds, somenteOutlet, somenteSemEstoque, categoria, produto, fornecedor,
      periodoPedidos, clienteId, parceiroId, vendedorId, statusPedido,
      statusConsig, periodoEnvio, periodoVencimento, consolidado,
    ]
  );

  const hasFilters = useMemo(() => {
    if (tipo === TIPO.ESTOQUE) {
      return !!(depositoIds?.length || somenteOutlet || somenteSemEstoque || categoria || produto || fornecedor);
    }
    if (tipo === TIPO.PEDIDOS) {
      return !!(periodoPedidos || clienteId || parceiroId || vendedorId || statusPedido);
    }
    if (tipo === TIPO.CONSIG) {
      return !!(statusConsig || periodoEnvio || periodoVencimento || consolidado);
    }
    return false;
  }, [
    tipo,
    depositoIds, somenteOutlet, somenteSemEstoque, categoria, produto, fornecedor,
    periodoPedidos, clienteId, parceiroId, vendedorId, statusPedido,
    statusConsig, periodoEnvio, periodoVencimento, consolidado,
  ]);

  const filtrosAtivos = useMemo(() => {
    const chips = [];

    if (tipo === TIPO.ESTOQUE) {
      if (depositoIds?.length) chips.push(`Depósitos: ${depositoIds.length}`);
      if (somenteOutlet) chips.push('Somente outlet');
      if (somenteSemEstoque) chips.push('Somente sem estoque'); // NOVO
      if (categoria?.label) chips.push(`Categoria: ${categoria.label}`);
      if (produto?.label) chips.push(`Produto: ${produto.label}`);
      if (fornecedor?.label) chips.push(`Fornecedor: ${fornecedor.label}`); // NOVO
    }

    if (tipo === TIPO.PEDIDOS) {
      if (periodoPedidos?.length === 2) {
        chips.push(`Período: ${toIsoDate(periodoPedidos[0])} → ${toIsoDate(periodoPedidos[1])}`);
      }
      if (clienteId) chips.push(`Cliente: #${clienteId}`);
      if (parceiroId) chips.push(`Parceiro: #${parceiroId}`);
      if (vendedorId) chips.push(`Vendedor: #${vendedorId}`);

      if (statusPedido) {
        const label = STATUS_MAP?.[statusPedido]?.label ?? statusPedido;
        chips.push(`Status: ${label}`);
      }
    }

    if (tipo === TIPO.CONSIG) {
      if (periodoEnvio?.length === 2) chips.push(`Envio: ${toIsoDate(periodoEnvio[0])} → ${toIsoDate(periodoEnvio[1])}`);
      if (periodoVencimento?.length === 2) chips.push(`Venc.: ${toIsoDate(periodoVencimento[0])} → ${toIsoDate(periodoVencimento[1])}`);

      if (statusConsig != null) {
        const opt = STATUS_CONSIGNACAO_OPTIONS.find((o) => o.value === statusConsig);
        chips.push(`Status: ${opt?.label ?? statusConsig}`);
      }
      if (consolidado) chips.push('Consolidar por cliente');
    }

    return chips;
  }, [
    tipo,
    depositoIds, somenteOutlet, somenteSemEstoque, categoria, produto, fornecedor,
    periodoPedidos, clienteId, parceiroId, vendedorId, statusPedido,
    periodoEnvio, periodoVencimento, statusConsig, consolidado,
  ]);

  const resetPorTipo = useCallback((novoTipo) => {
    // espelha o comportamento anterior: ao entrar em estoque, limpava filtros de pedidos
    if (novoTipo === TIPO.ESTOQUE) {
      setClienteId(null);
      setParceiroId(null);
      setVendedorId(null);
      setPeriodoPedidos(null);
      setStatusPedido(null); // NOVO: também zera
      return;
    }

    if (novoTipo === TIPO.CONSIG) {
      setStatusConsig(null);
      setPeriodoEnvio(null);
      setPeriodoVencimento(null);
      setConsolidado(false);
      return;
    }

    if (novoTipo === TIPO.PEDIDOS) {
      // mantém estoque como está
    }
  }, []);

  const limparFiltrosPorTipo = useCallback(() => {
    if (tipo === TIPO.ESTOQUE) {
      setDepositoIds([]);
      setSomenteOutlet(false);
      setSomenteSemEstoque(false); // NOVO
      setCategoria(null);
      setProduto(null);
      setFornecedor(null); // NOVO
      setCatInput('');
      setFornInput(''); // NOVO
    } else if (tipo === TIPO.PEDIDOS) {
      setPeriodoPedidos(null);
      setClienteId(null);
      setParceiroId(null);
      setVendedorId(null);
      setStatusPedido(null); // NOVO
    } else if (tipo === TIPO.CONSIG) {
      setStatusConsig(null);
      setPeriodoEnvio(null);
      setPeriodoVencimento(null);
      setConsolidado(false);
    }
  }, [tipo]);

  return {
    tipo,
    setTipo,

    // pedidos
    periodoPedidos,
    setPeriodoPedidos,
    clienteId,
    setClienteId,
    parceiroId,
    setParceiroId,
    vendedorId,
    setVendedorId,
    statusPedido,
    setStatusPedido,

    // estoque
    depositoIds,
    setDepositoIds,
    somenteOutlet,
    setSomenteOutlet,
    somenteSemEstoque,
    setSomenteSemEstoque,

    // consignações
    statusConsig,
    setStatusConsig,
    periodoEnvio,
    setPeriodoEnvio,
    periodoVencimento,
    setPeriodoVencimento,
    consolidado,
    setConsolidado,

    // busca assistida
    categoria,
    setCategoria,
    produto,
    setProduto,
    fornecedor,
    setFornecedor,

    // inputs controlados
    catInput,
    setCatInput,
    fornInput,
    setFornInput,

    // derivados
    filtros,
    hasFilters,
    filtrosAtivos,

    // helpers
    resetPorTipo,
    limparFiltrosPorTipo,
  };
}
