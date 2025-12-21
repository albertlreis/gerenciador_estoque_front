import { useMemo, useState, useCallback } from 'react';
import { TIPO } from '../../modules/relatorios/relatorios.constants';
import { toIsoDate } from '../../utils/date/dateHelpers';
import { STATUS_CONSIGNACAO_OPTIONS } from '../../constants/statusConsignacao';

export function useRelatoriosState() {
  const [tipo, setTipo] = useState(null);

  // Pedidos
  const [periodoPedidos, setPeriodoPedidos] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [vendedorId, setVendedorId] = useState(null);

  // Estoque
  const [depositoIds, setDepositoIds] = useState([]);
  const [somenteOutlet, setSomenteOutlet] = useState(false);

  // Consignações
  const [statusConsig, setStatusConsig] = useState(null);
  const [periodoEnvio, setPeriodoEnvio] = useState(null);
  const [periodoVencimento, setPeriodoVencimento] = useState(null);
  const [consolidado, setConsolidado] = useState(false);

  // Busca assistida (seleções)
  const [categoria, setCategoria] = useState(null); // { id, label }
  const [produto, setProduto] = useState(null);     // { id, label, sku }

  // UI de categoria (input controlado)
  const [catInput, setCatInput] = useState('');

  const filtros = useMemo(
    () => ({
      // estoque
      depositoIds,
      somenteOutlet,
      categoria,
      produto,

      // pedidos
      periodoPedidos,
      clienteId,
      parceiroId,
      vendedorId,

      // consignações
      statusConsig,
      periodoEnvio,
      periodoVencimento,
      consolidado,
    }),
    [
      depositoIds, somenteOutlet, categoria, produto,
      periodoPedidos, clienteId, parceiroId, vendedorId,
      statusConsig, periodoEnvio, periodoVencimento, consolidado
    ]
  );

  const hasFilters = useMemo(() => {
    if (tipo === TIPO.ESTOQUE) return !!(depositoIds?.length || somenteOutlet || categoria || produto);
    if (tipo === TIPO.PEDIDOS) return !!(periodoPedidos || clienteId || parceiroId || vendedorId);
    if (tipo === TIPO.CONSIG) return !!(statusConsig || periodoEnvio || periodoVencimento || consolidado);
    return false;
  }, [
    tipo,
    depositoIds, somenteOutlet, categoria, produto,
    periodoPedidos, clienteId, parceiroId, vendedorId,
    statusConsig, periodoEnvio, periodoVencimento, consolidado
  ]);

  const filtrosAtivos = useMemo(() => {
    const chips = [];

    if (tipo === TIPO.ESTOQUE) {
      if (depositoIds?.length) chips.push(`Depósitos: ${depositoIds.length}`);
      if (somenteOutlet) chips.push('Somente outlet');
      if (categoria?.label) chips.push(`Categoria: ${categoria.label}`);
      if (produto?.label) chips.push(`Produto: ${produto.label}`);
    }

    if (tipo === TIPO.PEDIDOS) {
      if (periodoPedidos?.length === 2)
        chips.push(`Período: ${toIsoDate(periodoPedidos[0])} → ${toIsoDate(periodoPedidos[1])}`);
      if (clienteId) chips.push(`Cliente: #${clienteId}`);
      if (parceiroId) chips.push(`Parceiro: #${parceiroId}`);
      if (vendedorId) chips.push(`Vendedor: #${vendedorId}`);
    }

    if (tipo === TIPO.CONSIG) {
      if (periodoEnvio?.length === 2)
        chips.push(`Envio: ${toIsoDate(periodoEnvio[0])} → ${toIsoDate(periodoEnvio[1])}`);

      if (periodoVencimento?.length === 2)
        chips.push(`Venc.: ${toIsoDate(periodoVencimento[0])} → ${toIsoDate(periodoVencimento[1])}`);

      if (statusConsig != null) {
        const opt = STATUS_CONSIGNACAO_OPTIONS.find((o) => o.value === statusConsig);
        chips.push(`Status: ${opt?.label ?? statusConsig}`);
      }

      if (consolidado) chips.push('Consolidar por cliente');
    }

    return chips;
  }, [
    tipo,
    depositoIds, somenteOutlet, categoria, produto,
    periodoPedidos, clienteId, parceiroId, vendedorId,
    periodoEnvio, periodoVencimento, statusConsig, consolidado
  ]);

  const resetPorTipo = useCallback((novoTipo) => {
    // espelha o comportamento atual do seu useEffect de troca de tipo
    if (novoTipo === TIPO.ESTOQUE) {
      setClienteId(null); setParceiroId(null); setVendedorId(null); setPeriodoPedidos(null);
      // mantém depósitos/outlet/categoria/produto como está (ou zera? hoje não zera automaticamente)
      return;
    }
    if (novoTipo === TIPO.CONSIG) {
      setStatusConsig(null); setPeriodoEnvio(null); setPeriodoVencimento(null); setConsolidado(false);
      return;
    }
    if (novoTipo === TIPO.PEDIDOS) {
      // não zera estoque por padrão
    }
  }, []);

  const limparFiltrosPorTipo = useCallback(() => {
    if (tipo === TIPO.ESTOQUE) {
      setDepositoIds([]); setSomenteOutlet(false); setCategoria(null); setProduto(null);
      setCatInput('');
    } else if (tipo === TIPO.PEDIDOS) {
      setPeriodoPedidos(null); setClienteId(null); setParceiroId(null); setVendedorId(null);
    } else if (tipo === TIPO.CONSIG) {
      setStatusConsig(null); setPeriodoEnvio(null); setPeriodoVencimento(null); setConsolidado(false);
    }
  }, [tipo]);

  return {
    // tipo
    tipo,
    setTipo,

    // filtros + setters usados pelos componentes
    periodoPedidos, setPeriodoPedidos,
    clienteId, setClienteId,
    parceiroId, setParceiroId,
    vendedorId, setVendedorId,

    depositoIds, setDepositoIds,
    somenteOutlet, setSomenteOutlet,

    statusConsig, setStatusConsig,
    periodoEnvio, setPeriodoEnvio,
    periodoVencimento, setPeriodoVencimento,
    consolidado, setConsolidado,

    categoria, setCategoria,
    produto, setProduto,

    catInput, setCatInput,

    // derivados
    filtros,
    hasFilters,
    filtrosAtivos,

    // helpers de transição
    resetPorTipo,
    limparFiltrosPorTipo,
  };
}
