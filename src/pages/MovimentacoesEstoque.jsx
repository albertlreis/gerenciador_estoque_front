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
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

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

  const toast = useRef(null);
  const [searchParams] = useSearchParams();
  const estoqueRequestSeq = useRef(0);
  const movsRequestSeq = useRef(0);

  const [firstEstoque, setFirstEstoque] = useState(0);
  const [totalEstoque, setTotalEstoque] = useState(0);

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
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [loadingExportPdf, setLoadingExportPdf] = useState(false);

  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    totalPecas: 0,
    totalDepositos: 0,
  });

  const [filtros, setFiltros] = useState({
    tipo: null,
    deposito: null,
    categoria: null,
    fornecedor: null,
    produto: '',
    periodo: null,
    zerados: false,
  });

  const tipos = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Saída', value: 'saida' },
  ];
  const sortFieldEstoqueMap = {
    produto_referencia: 'referencia',
    quantidade: 'quantidade_estoque',
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

  useEffect(() => {
    const depositoId = searchParams.get('deposito');
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFiltros((prev) => ({
          ...prev,
          ...parsed,
          periodo: toPeriodoDateRange(parsed?.periodo),
        }));
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } else if (depositoId) {
      setFiltros((prev) => ({ ...prev, deposito: parseInt(depositoId) }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDepositos();
    fetchCategorias();
    fetchFornecedores();
  }, []);

  useEffect(() => {
    fetchEstoqueAtual();
    fetchMovimentacoes();
  }, []);

  const fetchEstoqueAtual = async ({
                                     first = 0,
                                     rows = 10,
                                     sortField = null,
                                     sortOrder = null
                                   } = {}) => {
    const requestId = ++estoqueRequestSeq.current;
    setLoadingEstoque(true);
    try {
      const formatDate = (d) => d instanceof Date ? d.toISOString().split('T')[0] : null;

      const filtroParams = {
        ...filtros,
        zerados: filtros.zerados ? 1 : 0,
        periodo: filtros.periodo?.length === 2 && filtros.periodo[1]
          ? [formatDate(filtros.periodo[0]), formatDate(filtros.periodo[1])]
          : null,
        page: Math.floor(first / rows) + 1,
        per_page: rows,
        sort_field: sortField ? (sortFieldEstoqueMap[sortField] ?? sortField) : null,
        sort_order: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined
      };

      const [estoqueRes, resumoRes] = await Promise.all([
        apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.atual, { params: filtroParams }),
        apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.resumo, { params: filtroParams }),
      ]);

      if (requestId !== estoqueRequestSeq.current) return;

      const estoqueRows = toCollectionRows(estoqueRes.data);
      setEstoqueAtual(estoqueRows);
      setTotalEstoque(toCollectionMetaTotal(estoqueRes.data, estoqueRows.length));
      setResumo(resumoRes.data?.data ?? resumoRes.data);
    } catch (err) {
      if (requestId !== estoqueRequestSeq.current) return;
      showToast('error', 'Erro ao carregar estoque atual');
    } finally {
      if (requestId !== estoqueRequestSeq.current) return;
      setLoadingEstoque(false);
    }
  };

  const fetchMovimentacoes = async ({
                                      first = 0,
                                      rows = 10,
                                      sortField = null,
                                      sortOrder = null
                                    } = {}) => {
    const requestId = ++movsRequestSeq.current;
    setLoadingMovs(true);
    try {
      const formatDate = (d) => d instanceof Date ? d.toISOString().split('T')[0] : null;

      const filtroParams = {
        ...filtros,
        periodo:
          filtros.periodo?.length === 2 && filtros.periodo[1]
            ? [formatDate(filtros.periodo[0]), formatDate(filtros.periodo[1])]
            : null,
        page: Math.floor(first / rows) + 1,
        per_page: rows,
        sort_field: sortField ? (sortFieldMovsMap[sortField] ?? sortField) : null,
        sort_order: sortOrder === 1 ? 'asc' : sortOrder === -1 ? 'desc' : undefined
      };

      const movsRes = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.movimentacoes.base, { params: filtroParams });
      if (requestId !== movsRequestSeq.current) return;
      const movRows = toCollectionRows(movsRes.data);
      setMovimentacoes(movRows);
      setTotalMovs(toCollectionMetaTotal(movsRes.data, movRows.length));
    } catch (err) {
      if (requestId !== movsRequestSeq.current) return;
      showToast('error', 'Erro ao carregar movimentações');
    } finally {
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

      const params = {
        ...filtros,
        zerados: filtros.zerados ? 1 : 0,
        periodo:
          filtros.periodo?.length === 2 && filtros.periodo[1]
            ? [formatDate(filtros.periodo[0]), formatDate(filtros.periodo[1])]
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

  const handleBuscar = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtros));
    setFirstEstoque(0);
    setFirstMovs(0);
    fetchEstoqueAtual();
    fetchMovimentacoes();
  };

  const handleLimpar = () => {
    setMovimentacoes([]);
    setEstoqueAtual([]);
    setResumo({ totalProdutos: 0, totalPecas: 0, totalDepositos: 0 });

    const reset = {
      tipo: null,
      deposito: null,
      categoria: null,
      fornecedor: null,
      produto: '',
      periodo: null,
      zerados: false,
    };

    setFiltros(reset);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const verMovimentacoes = async (rowData) => {
    try {
      setShowMovDialog(true);
      setProdutoSelecionado(rowData);
      setLoadingDialog(true);

      const res = await apiEstoque.get(ESTOQUE_ENDPOINTS.estoque.movimentacoes.base, {
        params: { variacao: rowData.variacao_id, page: 1, per_page: 10 }
      });

      setMovsProduto(toCollectionRows(res.data));
    } catch (err) {
      showToast('error', 'Erro ao carregar movimentações da variação');
    } finally {
      setLoadingDialog(false);
    }
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
          categorias={categorias}
          fornecedores={fornecedores}
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

        <Accordion multiple>
          <AccordionTab header="Estoque Atual por Produto e Depósito">
            <EstoqueAtual
              data={estoqueAtual}
              loading={loadingEstoque}
              total={totalEstoque}
              first={firstEstoque}
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
            />
          </AccordionTab>
          <AccordionTab header="Movimentações Recentes">
            <EstoqueMovimentacoes
              data={movimentacoes}
              loading={loadingMovs}
              total={totalMovs}
              first={firstMovs}
              onDownloadTransferPdf={baixarPdfTransferencia}
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
          onHide={() => setShowMovDialog(false)}
          style={{ width: '80vw' }}
          modal
        >
          <EstoqueMovimentacoes
            data={movsProduto}
            loading={loadingDialog}
            total={movsProduto.length}
            first={0}
            onDownloadTransferPdf={baixarPdfTransferencia}
            onPage={() => {}}
          />
        </Dialog>
      </div>
    </SakaiLayout>
  );
};

export default MovimentacoesEstoque;
