import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import apiEstoque from '../services/apiEstoque';
import SakaiLayout from '../layouts/SakaiLayout';
import LocalizacaoEstoqueDialog from '../components/LocalizacaoEstoqueDialog';
import EstoqueFiltro from '../components/EstoqueFiltro';
import EstoqueAtual from '../components/EstoqueAtual';
import EstoqueMovimentacoes from '../components/EstoqueMovimentacoes';
import DialogOutlet from '../components/produto/DialogOutlet';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';
import usePermissions from '../hooks/usePermissions';
import { PERMISSOES } from '../constants/permissoes';
import { normalizarBuscaProduto } from '../utils/normalizarBuscaProduto';
import AuditoriaEntidadePanel from '../components/auditoria/AuditoriaEntidadePanel';

/**
 * Página de Estoque + Movimentações com editor de localização.
 * - Mantém filtros em localStorage;
 * - Exibe KPIs de resumo;
 * - Lista Estoque Atual (com botão para editar Localização);
 * - Lista Movimentações recentes.
 */
const MovimentacoesEstoque = () => {
  const LOCAL_STORAGE_KEY = 'filtros_movimentacoes_estoque';
  const toPeriodoDateRange = (periodo) => {
    if (!Array.isArray(periodo) || periodo.length !== 2) return null;

    const parsed = periodo.map((item) => {
      if (!item) return null;
      const date = item instanceof Date ? item : new Date(item);
      return Number.isNaN(date.getTime()) ? null : date;
    });

    return parsed[0] && parsed[1] ? parsed : null;
  };
  const normalizeEstoqueStatus = (rawStatus, legacyZerados) => {
    const status = typeof rawStatus === 'string' ? rawStatus.trim() : null;
    if (status === 'com_estoque' || status === 'sem_estoque' || status === 'all') {
      return status;
    }

    const legacyValue = typeof legacyZerados === 'string' ? legacyZerados.trim().toLowerCase() : legacyZerados;
    const legacyParsed = [true, 1, '1', 'true', 'yes', 'on'].includes(legacyValue);
    return legacyParsed ? 'sem_estoque' : 'all';
  };
  const formatarPreco = (valor) => Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const toast = useRef(null);
  const [searchParams] = useSearchParams();
  const { has } = usePermissions();
  const podeCadastrarOutlet = has(PERMISSOES.PRODUTOS.OUTLET_CADASTRAR);
  const estoqueRequestSeq = useRef(0);
  const movsRequestSeq = useRef(0);
  const resumoRequestSeq = useRef(0);
  const movsProdutoRequestSeq = useRef(0);
  const produtoDebounceRef = useRef(null);
  const estoqueAbortRef = useRef(null);
  const movsAbortRef = useRef(null);
  const resumoAbortRef = useRef(null);
  const movsProdutoAbortRef = useRef(null);

  const [firstEstoque, setFirstEstoque] = useState(0);
  const [totalEstoque, setTotalEstoque] = useState(0);
  const [estoqueQuery, setEstoqueQuery] = useState({
    first: 0,
    rows: 10,
    sortField: null,
    sortOrder: null,
  });

  const [firstMovs, setFirstMovs] = useState(0);
  const [totalMovs, setTotalMovs] = useState(0);

  const [estoqueAtual, setEstoqueAtual] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [loadingEstoque, setLoadingEstoque] = useState(false);
  const [loadingMovs, setLoadingMovs] = useState(false);

  const [showLocalizacaoDialog, setShowLocalizacaoDialog] = useState(false);
  const [estoqueSelecionado, setEstoqueSelecionado] = useState(null);

  const [showMovDialog, setShowMovDialog] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [movsProduto, setMovsProduto] = useState([]);
  const [movsProdutoFirst, setMovsProdutoFirst] = useState(0);
  const [movsProdutoTotal, setMovsProdutoTotal] = useState(0);
  const [movimentacaoAuditoriaId, setMovimentacaoAuditoriaId] = useState(null);
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [loadingExportPdf, setLoadingExportPdf] = useState(false);
  const [showOutletDialog, setShowOutletDialog] = useState(false);
  const [variacaoOutlet, setVariacaoOutlet] = useState(null);
  const [loadingOutlet, setLoadingOutlet] = useState(false);

  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    totalPecas: 0,
    totalDepositos: 0,
    totalValorEstoque: null,
  });

  const [filtros, setFiltros] = useState({
    tipo: null,
    deposito: null,
    categoria: null,
    fornecedor: null,
    produto: '',
    periodo: null,
    estoque_status: 'all',
  });
  const filtrosRef = useRef(filtros);
  const [isHydrated, setIsHydrated] = useState(false);

  const tipos = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Saída', value: 'saida' },
  ];
  const sortFieldEstoqueMap = {
    produto_referencia: 'referencia',
    quantidade: 'quantidade_estoque',
    custo_unitario: 'custo_unitario',
    data_entrada_estoque_atual: 'data_entrada_estoque_atual',
    ultima_venda_em: 'ultima_venda_em',
    dias_sem_venda: 'dias_sem_venda',
  };
  const sortFieldMovsMap = {
    produto_referencia: 'id',
  };
  const toCollectionRows = (payload) => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.dados?.results)) return payload.dados.results;
    if (Array.isArray(payload?.dados)) return payload.dados;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload)) return payload;
    return [];
  };
  const toCollectionMetaTotal = (payload, fallbackLength = 0) =>
    Number(payload?.meta?.total ?? payload?.dados?.total ?? fallbackLength);
  const toSelectOptions = (payload) =>
    toCollectionRows(payload).map((item) => ({ label: item.nome, value: item.id }));
  const showToast = (severity, detail, summary = 'Erro') => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };
  const isRequestAborted = (error) =>
    error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
  const abortInFlightRequest = (abortRef) => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };
  const persistFiltros = (nextFiltros) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextFiltros));
  };

  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  useEffect(() => {
    const depositoId = searchParams.get('deposito');
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const estoqueStatus = normalizeEstoqueStatus(parsed?.estoque_status, parsed?.zerados);
        const nextFiltros = {
          ...parsed,
          estoque_status: estoqueStatus,
          periodo: toPeriodoDateRange(parsed?.periodo),
        };
        delete nextFiltros.zerados;

        setFiltros((prev) => ({
          ...prev,
          ...nextFiltros,
        }));
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } else if (depositoId) {
      setFiltros((prev) => ({ ...prev, deposito: parseInt(depositoId) }));
    }
    setIsHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    fetchDepositos();
    fetchCategorias();
    fetchFornecedores();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const filtrosAtuais = filtrosRef.current;
    fetchResumo({ filtrosOverride: filtrosAtuais });
    fetchEstoqueAtual({ filtrosOverride: filtrosAtuais });
    fetchMovimentacoes({ filtrosOverride: filtrosAtuais });
  }, [isHydrated]);

  useEffect(() => () => {
    if (produtoDebounceRef.current) {
      clearTimeout(produtoDebounceRef.current);
      produtoDebounceRef.current = null;
    }
    abortInFlightRequest(estoqueAbortRef);
    abortInFlightRequest(movsAbortRef);
    abortInFlightRequest(resumoAbortRef);
    abortInFlightRequest(movsProdutoAbortRef);
  }, []);

  const fetchResumo = async ({ filtrosOverride = null } = {}) => {
    abortInFlightRequest(resumoAbortRef);
    const controller = new AbortController();
    resumoAbortRef.current = controller;
    const filtrosAtuais = filtrosOverride ?? filtrosRef.current;
    const requestId = ++resumoRequestSeq.current;
    try {
      const formatDate = (d) => d instanceof Date ? d.toISOString().split('T')[0] : null;
      const estoqueStatus = normalizeEstoqueStatus(
        filtrosAtuais?.estoque_status,
        filtrosAtuais?.zerados
      );
      const filtroParams = {
        ...filtrosAtuais,
        produto: normalizarBuscaProduto(filtrosAtuais?.produto),
        estoque_status: estoqueStatus !== 'all' ? estoqueStatus : null,
        zerados: estoqueStatus === 'sem_estoque' ? 1 : 0,
        periodo:
          filtrosAtuais.periodo?.length === 2 && filtrosAtuais.periodo[1]
            ? [formatDate(filtrosAtuais.periodo[0]), formatDate(filtrosAtuais.periodo[1])]
            : null,
      };

      const resumoRes = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.resumo, {
        params: filtroParams,
        signal: controller.signal,
      });
      if (requestId !== resumoRequestSeq.current) return;
      setResumo(resumoRes.data?.data ?? resumoRes.data);
    } catch (err) {
      if (requestId !== resumoRequestSeq.current) return;
      if (isRequestAborted(err)) return;
      showToast('error', 'Erro ao carregar resumo do estoque');
    } finally {
      if (resumoAbortRef.current === controller) {
        resumoAbortRef.current = null;
      }
    }
  };

  const fetchEstoqueAtual = async ({
                                     first = 0,
                                     rows = 10,
                                     sortField = null,
                                     sortOrder = null,
                                     filtrosOverride = null,
                                   } = {}) => {
    setEstoqueQuery({ first, rows, sortField, sortOrder });
    abortInFlightRequest(estoqueAbortRef);
    const controller = new AbortController();
    estoqueAbortRef.current = controller;
    const filtrosAtuais = filtrosOverride ?? filtrosRef.current;
    const requestId = ++estoqueRequestSeq.current;
    setLoadingEstoque(true);
    try {
      const formatDate = (d) => d instanceof Date ? d.toISOString().split('T')[0] : null;

      const estoqueStatus = normalizeEstoqueStatus(
        filtrosAtuais?.estoque_status,
        filtrosAtuais?.zerados
      );

      const filtroParams = {
        ...filtrosAtuais,
        produto: normalizarBuscaProduto(filtrosAtuais?.produto),
        estoque_status: estoqueStatus !== 'all' ? estoqueStatus : null,
        zerados: estoqueStatus === 'sem_estoque' ? 1 : 0,
        periodo: filtrosAtuais.periodo?.length === 2 && filtrosAtuais.periodo[1]
          ? [formatDate(filtrosAtuais.periodo[0]), formatDate(filtrosAtuais.periodo[1])]
          : null,
        page: Math.floor(first / rows) + 1,
        per_page: rows,
        sort_field: sortField ? (sortFieldEstoqueMap[sortField] ?? sortField) : null,
        sort_order: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined
      };

      const estoqueRes = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.atual, {
        params: filtroParams,
        signal: controller.signal,
      });

      if (requestId !== estoqueRequestSeq.current) return;

      const estoqueRows = toCollectionRows(estoqueRes.data);
      setEstoqueAtual(estoqueRows);
      setTotalEstoque(toCollectionMetaTotal(estoqueRes.data, estoqueRows.length));
    } catch (err) {
      if (requestId !== estoqueRequestSeq.current) return;
      if (isRequestAborted(err)) return;
      showToast('error', 'Erro ao carregar estoque atual');
    } finally {
      if (estoqueAbortRef.current === controller) {
        estoqueAbortRef.current = null;
      }
      if (requestId !== estoqueRequestSeq.current) return;
      setLoadingEstoque(false);
    }
  };

  const fetchMovimentacoes = async ({
                                      first = 0,
                                      rows = 10,
                                      sortField = null,
                                      sortOrder = null,
                                      filtrosOverride = null,
                                    } = {}) => {
    abortInFlightRequest(movsAbortRef);
    const controller = new AbortController();
    movsAbortRef.current = controller;
    const filtrosAtuais = filtrosOverride ?? filtrosRef.current;
    const requestId = ++movsRequestSeq.current;
    setLoadingMovs(true);
    try {
      const formatDate = (d) => d instanceof Date ? d.toISOString().split('T')[0] : null;

      const filtroParams = {
        ...filtrosAtuais,
        produto: normalizarBuscaProduto(filtrosAtuais?.produto),
        periodo:
          filtrosAtuais.periodo?.length === 2 && filtrosAtuais.periodo[1]
            ? [formatDate(filtrosAtuais.periodo[0]), formatDate(filtrosAtuais.periodo[1])]
            : null,
        page: Math.floor(first / rows) + 1,
        per_page: rows,
        sort_field: sortField ? (sortFieldMovsMap[sortField] ?? sortField) : null,
        sort_order: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined
      };

      const movsRes = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.movimentacoes.base, {
        params: filtroParams,
        signal: controller.signal,
      });
      if (requestId !== movsRequestSeq.current) return;
      const movRows = toCollectionRows(movsRes.data);
      setMovimentacoes(movRows);
      setTotalMovs(toCollectionMetaTotal(movsRes.data, movRows.length));
    } catch (err) {
      if (requestId !== movsRequestSeq.current) return;
      if (isRequestAborted(err)) return;
      showToast('error', 'Erro ao carregar movimentações');
    } finally {
      if (movsAbortRef.current === controller) {
        movsAbortRef.current = null;
      }
      if (requestId !== movsRequestSeq.current) return;
      setLoadingMovs(false);
    }
  };

  const exportarEstoquePdf = async () => {
    if (loadingExportPdf) return;

    setLoadingExportPdf(true);

    try {
      const formatDate = (d) =>
        d instanceof Date ? d.toISOString().split('T')[0] : null;
      const filtrosAtuais = filtrosRef.current;

      const estoqueStatus = normalizeEstoqueStatus(
        filtrosAtuais?.estoque_status,
        filtrosAtuais?.zerados
      );

      const params = {
        ...filtrosAtuais,
        estoque_status: estoqueStatus !== 'all' ? estoqueStatus : null,
        zerados: estoqueStatus === 'sem_estoque' ? 1 : 0,
        periodo:
          filtrosAtuais.periodo?.length === 2 && filtrosAtuais.periodo[1]
            ? [formatDate(filtrosAtuais.periodo[0]), formatDate(filtrosAtuais.periodo[1])]
            : null,
        export: 'pdf',
      };

      const response = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.atual, {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'estoque-atual.pdf';
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('error', 'Erro ao exportar estoque em PDF');
    } finally {
      setLoadingExportPdf(false);
    }
  };

  const baixarPdfTransferencia = async (rowData) => {
    const transferenciaId =
      rowData?.tipo === 'transferencia' && rowData?.ref_type === 'transferencia'
        ? rowData?.ref_id
        : null;

    if (!transferenciaId) {
      showToast('warn', 'PDF indisponível para esta movimentação.', 'Atenção');
      return;
    }

    try {
      const response = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.transferencias.pdf(transferenciaId), {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      // usa lote_id se existir (melhor identificação)
      const nome = rowData?.lote_id
        ? `transferencia-${rowData.lote_id}.pdf`
        : `transferencia-${transferenciaId}.pdf`;

      a.download = nome;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('error', 'Erro ao baixar PDF da transferência.');
    }
  };

  const abrirDialogOutlet = async (rowData) => {
    if (!rowData?.produto_id || !rowData?.variacao_id) {
      showToast('warn', 'Produto ou variacao nao encontrados.', 'Atencao');
      return;
    }

    if (Number(rowData?.quantidade ?? 0) <= 0) {
      showToast('warn', 'Nao ha estoque disponivel para outlet.', 'Atencao');
      return;
    }

    setLoadingOutlet(true);
    try {
      const response = await apiEstoque.get(`/produtos/${rowData.produto_id}`);
      const produto = response.data?.data || response.data;
      const variacao = (produto?.variacoes || []).find(
        (v) => Number(v.id) === Number(rowData.variacao_id)
      );

      if (!variacao) {
        showToast('warn', 'Variacao nao encontrada para este produto.', 'Atencao');
        return;
      }

      setVariacaoOutlet({
        ...variacao,
        estoque_total: variacao.estoque_total ?? rowData.quantidade,
        outlets: variacao.outlets || [],
      });
      setShowOutletDialog(true);
    } catch (err) {
      showToast('error', 'Erro ao carregar dados do produto para outlet');
    } finally {
      setLoadingOutlet(false);
    }
  };

  const fecharDialogOutlet = () => {
    setShowOutletDialog(false);
    setVariacaoOutlet(null);
  };

  const salvarOutletEstoque = async (payload) => {
    if (!variacaoOutlet?.id) return false;

    await apiEstoque.post(`/variacoes/${variacaoOutlet.id}/outlets`, payload);
    showToast('success', 'Outlet cadastrado com sucesso', 'Sucesso');
    await fetchEstoqueAtual({
      first: estoqueQuery.first,
      rows: estoqueQuery.rows,
      sortField: estoqueQuery.sortField,
      sortOrder: estoqueQuery.sortOrder,
      filtrosOverride: filtrosRef.current,
    });
    return true;
  };

  const fetchDepositos = async () => {
    try {
      const res = await apiEstoque.get(ESTOQUE_ENDPOINTS.depositos.base);
      setDepositos(toSelectOptions(res.data));
    } catch (err) {
      showToast('error', 'Erro ao carregar depósitos');
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await apiEstoque.get(ESTOQUE_ENDPOINTS.categorias.base);
      setCategorias(toSelectOptions(res.data));
    } catch (err) {
      showToast('error', 'Erro ao carregar categorias');
    }
  };

  const fetchFornecedores = async () => {
    try {
      const res = await apiEstoque.get(ESTOQUE_ENDPOINTS.fornecedores.base, {
        params: {
          per_page: 200,
          page: 1,
          order_by: 'nome',
          order_dir: 'asc',
        },
      });

      setFornecedores(toSelectOptions(res.data));
    } catch (err) {
      showToast('error', 'Erro ao carregar fornecedores');
    }
  };

  const triggerSearch = ({
                           filtrosOverride = filtrosRef.current,
                           firstEstoqueValue = 0,
                           firstMovsValue = 0,
                         } = {}) => {
    persistFiltros(filtrosOverride);
    setFirstEstoque(firstEstoqueValue);
    setFirstMovs(firstMovsValue);
    fetchResumo({ filtrosOverride });
    fetchEstoqueAtual({ first: firstEstoqueValue, filtrosOverride });
    fetchMovimentacoes({ first: firstMovsValue, filtrosOverride });
  };

  const handleBuscar = () => {
    if (produtoDebounceRef.current) {
      clearTimeout(produtoDebounceRef.current);
      produtoDebounceRef.current = null;
    }
    triggerSearch({ filtrosOverride: filtrosRef.current });
  };

  const handleProdutoChange = (produto) => {
    const filtrosAtualizados = { ...filtrosRef.current, produto };
    setFiltros(filtrosAtualizados);

    if (produtoDebounceRef.current) {
      clearTimeout(produtoDebounceRef.current);
      produtoDebounceRef.current = null;
    }

    const termo = String(produto ?? '').trim();
    if (termo.length !== 0 && termo.length < 3) return;

    produtoDebounceRef.current = setTimeout(() => {
      triggerSearch({ filtrosOverride: filtrosAtualizados });
    }, 400);
  };

  const handleLimpar = () => {
    if (produtoDebounceRef.current) {
      clearTimeout(produtoDebounceRef.current);
      produtoDebounceRef.current = null;
    }
    abortInFlightRequest(estoqueAbortRef);
    abortInFlightRequest(movsAbortRef);
    abortInFlightRequest(resumoAbortRef);
    setMovimentacoes([]);
    setEstoqueAtual([]);
    setResumo({ totalProdutos: 0, totalPecas: 0, totalDepositos: 0, totalValorEstoque: null });

    const reset = {
      tipo: null,
      deposito: null,
      categoria: null,
      fornecedor: null,
      produto: '',
      periodo: null,
      estoque_status: 'all',
    };

    setFiltros(reset);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setFirstEstoque(0);
    setFirstMovs(0);
  };

  const fetchMovimentacoesProduto = async ({
                                             variacaoId,
                                             produtoData = null,
                                             first = 0,
                                             rows = 10,
                                             sortField = null,
                                             sortOrder = null,
                                           }) => {
    if (!variacaoId) return;
    abortInFlightRequest(movsProdutoAbortRef);
    const controller = new AbortController();
    movsProdutoAbortRef.current = controller;
    const requestId = ++movsProdutoRequestSeq.current;

    try {
      if (produtoData) {
        setProdutoSelecionado(produtoData);
      }
      setMovsProdutoFirst(first);
      setLoadingDialog(true);

      const params = {
        variacao: variacaoId,
        page: Math.floor(first / rows) + 1,
        per_page: rows,
        sort_field: sortField ? (sortFieldMovsMap[sortField] ?? sortField) : null,
        sort_order: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined,
      };

      const res = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.movimentacoes.base, {
        params,
        signal: controller.signal,
      });

      if (requestId !== movsProdutoRequestSeq.current) return;
      const rowsData = toCollectionRows(res.data);
      setMovsProduto(rowsData);
      setMovsProdutoTotal(toCollectionMetaTotal(res.data, rowsData.length));
    } catch (err) {
      if (requestId !== movsProdutoRequestSeq.current) return;
      if (isRequestAborted(err)) return;
      showToast('error', 'Erro ao carregar movimentações da variação');
    } finally {
      if (movsProdutoAbortRef.current === controller) {
        movsProdutoAbortRef.current = null;
      }
      if (requestId !== movsProdutoRequestSeq.current) return;
      setLoadingDialog(false);
    }
  };

  const verMovimentacoes = (rowData) => {
    setShowMovDialog(true);
    fetchMovimentacoesProduto({
      variacaoId: rowData?.variacao_id,
      produtoData: rowData,
      first: 0,
      rows: 10,
    });
  };

  const abrirDialogLocalizacao = (estoqueId, localizacaoId = null) => {
    setEstoqueSelecionado({ estoqueId, localizacaoId });
    setShowLocalizacaoDialog(true);
  };

  const mostraValorEstoque = resumo?.totalValorEstoque !== undefined && resumo?.totalValorEstoque !== null;
  const kpiColClass = mostraValorEstoque ? 'col-12 md:col-3' : 'col-12 md:col-4';

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
          onProdutoChange={handleProdutoChange}
          depositos={depositos}
          categorias={categorias}
          fornecedores={fornecedores}
          tipos={tipos}
          onBuscar={handleBuscar}
          onLimpar={handleLimpar}
        />

        <div className="grid mb-4">
          <div className={kpiColClass}>
            <Card title="Produtos" className="text-center">
              <i className="pi pi-box text-4xl text-primary mb-2 block" />
              <h3>{resumo.totalProdutos}</h3>
            </Card>
          </div>
          <div className={kpiColClass}>
            <Card title="Peças em Estoque" className="text-center">
              <i className="pi pi-inbox text-4xl text-success mb-2 block" />
              <h3>{resumo.totalPecas}</h3>
            </Card>
          </div>
          <div className={kpiColClass}>
            <Card title="Depósitos Ativos" className="text-center">
              <i className="pi pi-building text-4xl text-warning mb-2 block" />
              <h3>{resumo.totalDepositos}</h3>
            </Card>
          </div>
          {mostraValorEstoque && (
            <div className={kpiColClass}>
              <Card title="Valor em Estoque" className="text-center">
                <i className="pi pi-dollar text-4xl text-indigo-500 mb-2 block" />
                <h3>{formatarPreco(resumo.totalValorEstoque)}</h3>
              </Card>
            </div>
          )}
        </div>

        <Accordion multiple>
          <AccordionTab header="Estoque Atual por Produto e Depósito">
            <EstoqueAtual
              data={estoqueAtual}
              loading={loadingEstoque}
              total={totalEstoque}
              first={firstEstoque}
              mostrarCusto={mostraValorEstoque}
              onPage={(e) => {
                setFirstEstoque(e.first);
                fetchEstoqueAtual({
                  first: e.first,
                  rows: e.rows,
                  sortField: e.sortField,
                  sortOrder: e.sortOrder,
                });
              }}
              onEditLocalizacao={(estoqueId, localizacaoId) =>
                abrirDialogLocalizacao(estoqueId, localizacaoId)
              }
              verMovimentacoes={verMovimentacoes}
              onExportPdf={exportarEstoquePdf}
              loadingExportPdf={loadingExportPdf}
              onCadastrarOutlet={abrirDialogOutlet}
              podeCadastrarOutlet={podeCadastrarOutlet && !loadingOutlet}
            />
          </AccordionTab>
          <AccordionTab header="Movimentações Recentes">
            <EstoqueMovimentacoes
              data={movimentacoes}
              loading={loadingMovs}
              total={totalMovs}
              first={firstMovs}
              onDownloadTransferPdf={baixarPdfTransferencia}
              onViewAuditoria={(row) => setMovimentacaoAuditoriaId(row?.id ?? null)}
              onPage={(e) => {
                setFirstMovs(e.first);
                fetchMovimentacoes({
                  first: e.first,
                  rows: e.rows,
                  sortField: e.sortField,
                  sortOrder: e.sortOrder
                });
              }}
            />
          </AccordionTab>
        </Accordion>

        <Dialog
          header={`Movimentações – ${produtoSelecionado?.produto_nome || 'Produto'}`}
          visible={showMovDialog}
          onHide={() => {
            abortInFlightRequest(movsProdutoAbortRef);
            setMovsProduto([]);
            setMovsProdutoFirst(0);
            setMovsProdutoTotal(0);
            setProdutoSelecionado(null);
            setShowMovDialog(false);
          }}
          style={{ width: '80vw' }}
          modal
        >
          <EstoqueMovimentacoes
            data={movsProduto}
            loading={loadingDialog}
            total={movsProdutoTotal}
            first={movsProdutoFirst}
            onDownloadTransferPdf={baixarPdfTransferencia}
            onViewAuditoria={(row) => setMovimentacaoAuditoriaId(row?.id ?? null)}
            onPage={(e) => {
              fetchMovimentacoesProduto({
                variacaoId: produtoSelecionado?.variacao_id,
                first: e.first,
                rows: e.rows,
                sortField: e.sortField,
                sortOrder: e.sortOrder,
              });
            }}
          />
        </Dialog>

        <DialogOutlet
          visible={showOutletDialog}
          onHide={fecharDialogOutlet}
          onSalvar={salvarOutletEstoque}
          variacao={variacaoOutlet}
          outletEdicao={null}
        />

        <Dialog
          header={
            movimentacaoAuditoriaId
              ? `Auditoria da Movimentacao #${movimentacaoAuditoriaId}`
              : 'Auditoria da Movimentacao'
          }
          visible={Boolean(movimentacaoAuditoriaId)}
          onHide={() => setMovimentacaoAuditoriaId(null)}
          style={{ width: '72vw', maxWidth: '1000px' }}
          modal
        >
          {movimentacaoAuditoriaId && (
            <AuditoriaEntidadePanel
              auditableType="EstoqueMovimentacao"
              auditableId={movimentacaoAuditoriaId}
              titulo="Historico da Movimentacao"
            />
          )}
        </Dialog>
      </div>
    </SakaiLayout>
  );
};

export default MovimentacoesEstoque;
