import { useMemo, useState, useCallback } from 'react';
import { TIPO } from '../../modules/relatorios/relatorios.constants';
import { toIsoDate } from '../../utils/date/dateHelpers';
import { STATUS_CONSIGNACAO_OPTIONS } from '../../constants/statusConsignacao';
import { STATUS_MAP as STATUS_PEDIDO_MAP } from '../../constants/statusPedido';

import {
  STATUS_OPTIONS as ASSIST_STATUS_OPTIONS,
  LOCAIS_REPARO as ASSIST_LOCAIS_REPARO,
  CUSTO_RESP as ASSIST_CUSTO_RESP,
} from '../../utils/assistencia';

export function useRelatoriosState() {
  const [tipo, setTipo] = useState(null);

  // ======================
  // PEDIDOS
  // ======================
  const [periodoPedidos, setPeriodoPedidos] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [vendedorId, setVendedorId] = useState(null);
  const [statusPedido, setStatusPedido] = useState(null);

  // ======================
  // ESTOQUE
  // ======================
  const [depositoIds, setDepositoIds] = useState([]);
  const [somenteOutlet, setSomenteOutlet] = useState(false);
  const [somenteSemEstoque, setSomenteSemEstoque] = useState(false);

  // Consignações
  const [statusConsig, setStatusConsig] = useState(null);
  const [periodoEnvio, setPeriodoEnvio] = useState(null);
  const [periodoVencimento, setPeriodoVencimento] = useState(null);
  const [consolidado, setConsolidado] = useState(false);

  // Busca assistida (estoque)
  const [categoria, setCategoria] = useState(null); // { id, label }
  const [produto, setProduto] = useState(null);     // { id, label, sku }
  const [fornecedor, setFornecedor] = useState(null); // { id, label }

  const [catInput, setCatInput] = useState('');
  const [fornInput, setFornInput] = useState('');

  // ======================
  // ASSISTÊNCIAS
  // ======================
  const [statusAssistencia, setStatusAssistencia] = useState(null);
  const [periodoAbertura, setPeriodoAbertura] = useState(null);   // range
  const [periodoConclusao, setPeriodoConclusao] = useState(null); // range
  const [locaisReparo, setLocaisReparo] = useState([]);           // string[]
  const [custoResp, setCustoResp] = useState(null);               // NOVO (cliente|loja)

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

      // assistências
      statusAssistencia,
      periodoAbertura,
      periodoConclusao,
      locaisReparo,
      custoResp,
    }),
    [
      depositoIds, somenteOutlet, somenteSemEstoque, categoria, produto, fornecedor,
      periodoPedidos, clienteId, parceiroId, vendedorId, statusPedido,
      statusConsig, periodoEnvio, periodoVencimento, consolidado,
      statusAssistencia, periodoAbertura, periodoConclusao, locaisReparo, custoResp,
    ]
  );

  const hasFilters = useMemo(() => {
    if (tipo === TIPO.ESTOQUE) {
      return !!(
        depositoIds?.length ||
        somenteOutlet ||
        somenteSemEstoque ||
        categoria ||
        produto ||
        fornecedor
      );
    }

    if (tipo === TIPO.PEDIDOS) {
      return !!(periodoPedidos || clienteId || parceiroId || vendedorId || statusPedido);
    }

    if (tipo === TIPO.CONSIG) {
      return !!(statusConsig || periodoEnvio || periodoVencimento || consolidado);
    }

    if (tipo === TIPO.ASSISTENCIAS) {
      return !!(
        statusAssistencia ||
        periodoAbertura ||
        periodoConclusao ||
        (locaisReparo?.length) ||
        custoResp
      );
    }

    return false;
  }, [
    tipo,
    depositoIds, somenteOutlet, somenteSemEstoque, categoria, produto, fornecedor,
    periodoPedidos, clienteId, parceiroId, vendedorId, statusPedido,
    statusConsig, periodoEnvio, periodoVencimento, consolidado,
    statusAssistencia, periodoAbertura, periodoConclusao, locaisReparo, custoResp,
  ]);

  const filtrosAtivos = useMemo(() => {
    const chips = [];

    if (tipo === TIPO.ESTOQUE) {
      if (depositoIds?.length) chips.push(`Depósitos: ${depositoIds.length}`);
      if (somenteOutlet) chips.push('Somente outlet');
      if (somenteSemEstoque) chips.push('Somente sem estoque');
      if (categoria?.label) chips.push(`Categoria: ${categoria.label}`);
      if (produto?.label) chips.push(`Produto: ${produto.label}`);
      if (fornecedor?.label) chips.push(`Fornecedor: ${fornecedor.label}`);
    }

    if (tipo === TIPO.PEDIDOS) {
      if (periodoPedidos?.length === 2) chips.push(`Período: ${toIsoDate(periodoPedidos[0])} → ${toIsoDate(periodoPedidos[1])}`);
      if (clienteId) chips.push(`Cliente: #${clienteId}`);
      if (parceiroId) chips.push(`Parceiro: #${parceiroId}`);
      if (vendedorId) chips.push(`Vendedor: #${vendedorId}`);
      if (statusPedido) chips.push(`Status: ${STATUS_PEDIDO_MAP?.[statusPedido]?.label ?? statusPedido}`);
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

    if (tipo === TIPO.ASSISTENCIAS) {
      if (statusAssistencia) {
        const label = ASSIST_STATUS_OPTIONS.find((s) => s.value === statusAssistencia)?.label ?? statusAssistencia;
        chips.push(`Status: ${label}`);
      }
      if (periodoAbertura?.length === 2) chips.push(`Abertura: ${toIsoDate(periodoAbertura[0])} → ${toIsoDate(periodoAbertura[1])}`);
      if (periodoConclusao?.length === 2) chips.push(`Conclusão: ${toIsoDate(periodoConclusao[0])} → ${toIsoDate(periodoConclusao[1])}`);

      if (locaisReparo?.length) {
        const labels = locaisReparo
          .map((v) => ASSIST_LOCAIS_REPARO.find((x) => x.value === v)?.label ?? v)
          .join(', ');
        chips.push(`Local: ${labels}`);
      }

      if (custoResp) {
        const label = ASSIST_CUSTO_RESP.find((x) => x.value === custoResp)?.label ?? custoResp;
        chips.push(`Custo: ${label}`);
      }
    }

    return chips;
  }, [
    tipo,
    depositoIds, somenteOutlet, somenteSemEstoque, categoria, produto, fornecedor,
    periodoPedidos, clienteId, parceiroId, vendedorId, statusPedido,
    statusConsig, periodoEnvio, periodoVencimento, consolidado,
    statusAssistencia, periodoAbertura, periodoConclusao, locaisReparo, custoResp,
  ]);

  const resetPorTipo = useCallback((novoTipo) => {
    if (novoTipo === TIPO.ESTOQUE) {
      setClienteId(null);
      setParceiroId(null);
      setVendedorId(null);
      setPeriodoPedidos(null);
      setStatusPedido(null);
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
      return;
    }

    if (novoTipo === TIPO.ASSISTENCIAS) {
      return;
    }
  }, []);

  const limparFiltrosPorTipo = useCallback(() => {
    if (tipo === TIPO.ESTOQUE) {
      setDepositoIds([]);
      setSomenteOutlet(false);
      setSomenteSemEstoque(false);
      setCategoria(null);
      setProduto(null);
      setFornecedor(null);
      setCatInput('');
      setFornInput('');
      return;
    }

    if (tipo === TIPO.PEDIDOS) {
      setPeriodoPedidos(null);
      setClienteId(null);
      setParceiroId(null);
      setVendedorId(null);
      setStatusPedido(null);
      return;
    }

    if (tipo === TIPO.CONSIG) {
      setStatusConsig(null);
      setPeriodoEnvio(null);
      setPeriodoVencimento(null);
      setConsolidado(false);
      return;
    }

    if (tipo === TIPO.ASSISTENCIAS) {
      setStatusAssistencia(null);
      setPeriodoAbertura(null);
      setPeriodoConclusao(null);
      setLocaisReparo([]);
      setCustoResp(null);
      return;
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

    // estoque assistido
    categoria,
    setCategoria,
    produto,
    setProduto,
    fornecedor,
    setFornecedor,
    catInput,
    setCatInput,
    fornInput,
    setFornInput,

    // assistências
    statusAssistencia,
    setStatusAssistencia,
    periodoAbertura,
    setPeriodoAbertura,
    periodoConclusao,
    setPeriodoConclusao,
    locaisReparo,
    setLocaisReparo,
    custoResp,
    setCustoResp,

    // derivados
    filtros,
    hasFilters,
    filtrosAtivos,

    // helpers
    resetPorTipo,
    limparFiltrosPorTipo,
  };
}
