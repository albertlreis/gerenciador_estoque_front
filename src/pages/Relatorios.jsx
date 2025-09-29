// src/pages/Relatorios.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { AutoComplete } from 'primereact/autocomplete';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { SplitButton } from 'primereact/splitbutton';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { saveAs } from 'file-saver';

import api from '../services/apiEstoque';
import apiAuth from '../services/apiAuth';
import SakaiLayout from '../layouts/SakaiLayout';
import CalendarBR from '../components/CalendarBR';

import { STATUS_CONSIGNACAO_OPTIONS } from '../constants/statusConsignacao';

/** Helpers */
const toIsoDate = (d) => new Date(d).toISOString().slice(0, 10);
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addDays = (d, n) => new Date(new Date(d).setDate(new Date(d).getDate() + n));

/** Debounce simples para AutoComplete (sem libs externas) */
const useDebounced = (fn, delay = 350) => {
  const tRef = useRef(null);
  return (...args) => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => fn(...args), delay);
  };
};

/** Garante um array independente do formato comum vindo da API */
const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.data)) return val.data;       // { data: [...] }
  if (val && Array.isArray(val.results)) return val.results; // { results: [...] }
  if (val && Array.isArray(val.items)) return val.items;     // { items: [...] }
  if (val && Array.isArray(val.rows)) return val.rows;       // { rows: [...] }
  return [];
};

const TIPO = {
  ESTOQUE: 'estoque',
  PEDIDOS: 'pedidos',
  CONSIG: 'consignacoes',
};

export default function Relatorios() {
  const toast = useRef(null);

  const [tipo, setTipo] = useState(null);

  // Pedidos
  const [periodoPedidos, setPeriodoPedidos] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [vendedorId, setVendedorId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loadingFiltrosPedidos, setLoadingFiltrosPedidos] = useState(false);

  // Estoque
  const [depositos, setDepositos] = useState([]);
  const [depositoIds, setDepositoIds] = useState([]);
  const [somenteOutlet, setSomenteOutlet] = useState(false);

  // Consignações
  const [statusConsig, setStatusConsig] = useState(null);
  const [periodoEnvio, setPeriodoEnvio] = useState(null);
  const [periodoVencimento, setPeriodoVencimento] = useState(null);
  const [consolidado, setConsolidado] = useState(false);

  // Busca assistida
  const [categoria, setCategoria] = useState(null);      // { id, label }
  const [produto, setProduto] = useState(null);          // { id, label, sku }
  const [catSug, setCatSug] = useState([]);
  const [prodSug, setProdSug] = useState([]);

  const [catInput, setCatInput] = useState('');

  // UI
  const [loading, setLoading] = useState(false);

  const tiposRelatorio = useMemo(() => ([
    { label: 'Estoque Atual', value: TIPO.ESTOQUE, icon: 'pi pi-box' },
    { label: 'Pedidos por Período', value: TIPO.PEDIDOS, icon: 'pi pi-shopping-cart' },
    { label: 'Consignações', value: TIPO.CONSIG, icon: 'pi pi-truck' },
  ]), []);

  /** Presets visuais para datas (evita digitar). */
  const presetsPedidos = [
    { label: 'Hoje', action: () => setPeriodoPedidos([new Date(), new Date()]) },
    { label: '7d', action: () => setPeriodoPedidos([addDays(new Date(), -6), new Date()]) },
    { label: '30d', action: () => setPeriodoPedidos([addDays(new Date(), -29), new Date()]) },
    { label: 'Mês atual', action: () => setPeriodoPedidos([startOfMonth(), endOfMonth()]) },
  ];
  const presetsConsigEnvio = [
    { label: '7d', action: () => setPeriodoEnvio([addDays(new Date(), -6), new Date()]) },
    { label: '30d', action: () => setPeriodoEnvio([addDays(new Date(), -29), new Date()]) },
    { label: 'Mês atual', action: () => setPeriodoEnvio([startOfMonth(), endOfMonth()]) },
  ];
  const presetsConsigVenc = [
    { label: 'Vence em 7d', action: () => setPeriodoVencimento([new Date(), addDays(new Date(), 7)]) },
    { label: 'Vence em 30d', action: () => setPeriodoVencimento([new Date(), addDays(new Date(), 30)]) },
  ];

  // === helpers (adicione perto dos outros helpers) ===
  const normalize = (s = '') =>
    String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  // === categorias (substitua sua buscarCategorias atual) ===
  const buscarCategorias = useDebounced(async (query = '') => {
    const q = (query || '').trim();
    try {
      // cobre diferentes nomes aceitos no back
      const { data } = await api.get('/categorias', {
        params: { nome: q, search: q, q, per_page: 100, page: 1 },
      });

      const raw = (data?.data ?? data ?? []);
      const mapped = raw.map((c) => ({
        id: c.id,
        label: c.nome || c.titulo || c.label || `Categoria #${c.id}`,
      }));

      // filtro cliente (case/acentos-insensível)
      const nq = normalize(q);
      const filtered = nq
        ? mapped.filter((c) => normalize(c.label).includes(nq))
        : mapped.slice(0, 50); // dropdown vazio: mostra um recorte, não tudo

      setCatSug(filtered);
    } catch (e) {
      setCatSug([]); // falha silenciosa
    }
  }, 300);

  const buscarProdutos = useDebounced(async (query = '') => {
    try {
      const params = { nome: query, per_page: 20, page: 1 };
      const { data } = await api.get('/produtos', { params });
      const list = (data?.data ?? data ?? []).map((p) => ({
        id: p.id, label: p.nome || `Produto #${p.id}`,
        sku: p.variacoes?.[0]?.referencia || '',
      }));
      setProdSug(list);
    } catch (e) { /* silencioso */ }
  }, 350);

  /** Carregamentos por tipo */
  useEffect(() => {
    const carregarParaPedidos = async () => {
      try {
        setLoadingFiltrosPedidos(true);
        const [resClientes, resParceiros, resVendedores] = await Promise.all([
          api.get('/clientes'),
          api.get('/parceiros'),
          apiAuth.get('/usuarios/vendedores'),
        ]);
        setClientes(ensureArray(resClientes?.data));
        setParceiros(ensureArray(resParceiros?.data));
        setVendedores(ensureArray(resVendedores?.data));
      } catch (error) {
        console.error('Erro ao carregar filtros de pedidos:', error);
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar clientes/parceiros/vendedores' });
      } finally {
        setLoadingFiltrosPedidos(false);
      }
    };

    const carregarParaEstoque = async () => {
      try {
        const resDepositos = await api.get('/depositos');
        const lista = ensureArray(resDepositos?.data).map((d) => ({ label: d.nome || d.label || `Depósito #${d.id}`, value: d.id }));
        setDepositos(lista);
      } catch (error) {
        console.error('Erro ao carregar depósitos:', error);
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar a lista de depósitos' });
      }
    };

    // reset de campos quando muda tipo
    if (tipo === TIPO.ESTOQUE) {
      setClienteId(null); setParceiroId(null); setVendedorId(null); setPeriodoPedidos(null);
      carregarParaEstoque();
    } else if (tipo === TIPO.CONSIG) {
      setStatusConsig(null); setPeriodoEnvio(null); setPeriodoVencimento(null); setConsolidado(false);
    } else if (tipo === TIPO.PEDIDOS) {
      carregarParaPedidos();
    }
  }, [tipo]);

  /** Regras */
  const validar = () => {
    if (tipo === TIPO.PEDIDOS) {
      const [ini, fim] = Array.isArray(periodoPedidos) ? periodoPedidos : [];
      if (ini && fim && ini > fim) {
        toast.current?.show({ severity: 'warn', summary: 'Período inválido', detail: 'A data inicial não pode ser maior que a final.' });
        return false;
      }
    }
    if (tipo === TIPO.CONSIG) {
      const [ei, ef] = Array.isArray(periodoEnvio) ? periodoEnvio : [];
      const [vi, vf] = Array.isArray(periodoVencimento) ? periodoVencimento : [];
      if (ei && ef && ei > ef) {
        toast.current?.show({ severity: 'warn', summary: 'Período inválido', detail: 'Envio: início maior que fim.' });
        return false;
      }
      if (vi && vf && vi > vf) {
        toast.current?.show({ severity: 'warn', summary: 'Período inválido', detail: 'Vencimento: início maior que fim.' });
        return false;
      }
    }
    return true;
  };

  const montarEndpoint = () => {
    if (tipo === TIPO.ESTOQUE) return '/relatorios/estoque/atual';
    if (tipo === TIPO.PEDIDOS) return '/relatorios/pedidos';
    if (tipo === TIPO.CONSIG) return '/relatorios/consignacoes/ativas';
    return '';
  };

  const appendFiltros = (params) => {
    if (tipo === TIPO.ESTOQUE) {
      if (depositoIds?.length) depositoIds.forEach((id) => params.append('deposito_ids[]', id));
      if (somenteOutlet) params.append('somente_outlet', 1);
      if (categoria?.id) params.append('categoria_id', categoria.id);
      if (produto?.id) params.append('produto_id', produto.id);
      return;
    }
    if (tipo === TIPO.PEDIDOS) {
      const [ini, fim] = Array.isArray(periodoPedidos) ? periodoPedidos : [];
      if (ini) params.append('data_inicio', toIsoDate(ini));
      if (fim) params.append('data_fim', toIsoDate(fim));
      if (clienteId) params.append('cliente_id', clienteId);
      if (parceiroId) params.append('parceiro_id', parceiroId);
      if (vendedorId) params.append('vendedor_id', vendedorId);
      return;
    }
    if (tipo === TIPO.CONSIG) {
      if (statusConsig) params.append('status', statusConsig);
      const [ei, ef] = Array.isArray(periodoEnvio) ? periodoEnvio : [];
      const [vi, vf] = Array.isArray(periodoVencimento) ? periodoVencimento : [];
      if (ei) params.append('envio_inicio', toIsoDate(ei));
      if (ef) params.append('envio_fim', toIsoDate(ef));
      if (vi) params.append('vencimento_inicio', toIsoDate(vi));
      if (vf) params.append('vencimento_fim', toIsoDate(vf));
      if (consolidado) params.append('consolidado', '1');
    }
  };

  const baixarArquivo = async (formato) => {
    try {
      const endpoint = montarEndpoint();
      if (!endpoint) return;
      if (!validar()) return;

      const params = new URLSearchParams();
      params.append('formato', formato);
      appendFiltros(params);

      setLoading(true);
      const res = await api.get(`${endpoint}?${params.toString()}`, { responseType: 'blob' });

      const timestamp = Date.now();
      const nome = `relatorio-${tipo}-${timestamp}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      const blob = new Blob([res.data], {
        type: formato === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, nome);
      toast.current?.show({ severity: 'success', summary: 'Pronto!', detail: `Arquivo ${formato.toUpperCase()} gerado.` });
    } catch (err) {
      console.error(err);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: `Erro ao gerar ${tipo} (${formato.toUpperCase()}).` });
    } finally {
      setLoading(false);
    }
  };

  /** Estado: há filtros aplicados? para habilitar/desabilitar "Limpar" */
  const hasFilters = useMemo(() => {
    if (tipo === TIPO.ESTOQUE) {
      return !!(depositoIds?.length || somenteOutlet || categoria || produto);
    }
    if (tipo === TIPO.PEDIDOS) {
      return !!(periodoPedidos || clienteId || parceiroId || vendedorId);
    }
    if (tipo === TIPO.CONSIG) {
      return !!(statusConsig || periodoEnvio || periodoVencimento || consolidado);
    }
    return false;
  }, [
    tipo, depositoIds, somenteOutlet, categoria, produto,
    periodoPedidos, clienteId, parceiroId, vendedorId,
    statusConsig, periodoEnvio, periodoVencimento, consolidado
  ]);

  const limparFiltros = () => {
    if (!hasFilters) return;
    confirmDialog({
      header: 'Limpar filtros',
      message: 'Limpar todos os filtros deste relatório?',
      icon: 'pi pi-filter-slash',
      acceptLabel: 'Limpar',
      rejectLabel: 'Cancelar',
      closable: true,
      acceptClassName: 'p-button-danger',
      accept: () => {
        if (tipo === TIPO.ESTOQUE) {
          setDepositoIds([]); setSomenteOutlet(false); setCategoria(null); setProduto(null);
        } else if (tipo === TIPO.PEDIDOS) {
          setPeriodoPedidos(null); setClienteId(null); setParceiroId(null); setVendedorId(null);
        } else if (tipo === TIPO.CONSIG) {
          setStatusConsig(null); setPeriodoEnvio(null); setPeriodoVencimento(null); setConsolidado(false);
        }
        toast.current?.show({ severity: 'info', summary: 'Filtros limpos', detail: 'Tudo resetado.' });
      },
    });
  };

  /** Chips-resumo dos filtros aplicados (UX!) */
  const filtrosAtivos = useMemo(() => {
    const chips = [];
    if (tipo === TIPO.ESTOQUE) {
      if (depositoIds?.length) chips.push(`Depósitos: ${depositoIds.length}`);
      if (somenteOutlet) chips.push('Somente outlet');
      if (categoria?.label) chips.push(`Categoria: ${categoria.label}`);
      if (produto?.label) chips.push(`Produto: ${produto.label}`);
    }
    if (tipo === TIPO.PEDIDOS) {
      if (periodoPedidos?.length === 2) chips.push(`Período: ${toIsoDate(periodoPedidos[0])} → ${toIsoDate(periodoPedidos[1])}`);
      if (clienteId) chips.push(`Cliente: #${clienteId}`);
      if (parceiroId) chips.push(`Parceiro: #${parceiroId}`);
      if (vendedorId) chips.push(`Vendedor: #${vendedorId}`);
    }
    if (tipo === TIPO.CONSIG) {
      if (periodoEnvio?.length === 2) chips.push(`Envio: ${toIsoDate(periodoEnvio[0])} → ${toIsoDate(periodoEnvio[1])}`);
      if (periodoVencimento?.length === 2) chips.push(`Venc.: ${toIsoDate(periodoVencimento[0])} → ${toIsoDate(periodoVencimento[1])}`);
      if (statusConsig != null) {
        const opt = STATUS_CONSIGNACAO_OPTIONS.find(o => o.value === statusConsig);
        chips.push(`Status: ${opt?.label ?? statusConsig}`);
      }
      if (consolidado) chips.push('Consolidar por cliente');
    }
    return chips;
  }, [tipo, depositoIds, somenteOutlet, categoria, produto, periodoPedidos, clienteId, parceiroId, vendedorId, periodoEnvio, periodoVencimento, statusConsig, consolidado]);

  // Options seguros para os Dropdowns de Pedidos
  const clientesOpts = useMemo(
    () => ensureArray(clientes).map(c => ({ label: c.nome ?? c.label ?? `Cliente #${c.id}`, value: c.id })),
    [clientes]
  );
  const parceirosOpts = useMemo(
    () => ensureArray(parceiros).map(p => ({ label: p.nome ?? p.label ?? `Parceiro #${p.id}`, value: p.id })),
    [parceiros]
  );
  const vendedoresOpts = useMemo(
    () => ensureArray(vendedores).map(v => ({ label: v.nome ?? v.label ?? `Vendedor #${v.id}`, value: v.id })),
    [vendedores]
  );

  /** Ações principais (SplitButton) */
  const exportActions = [
    { label: loading ? 'Gerando…' : 'Exportar Excel', icon: loading ? 'pi pi-spinner pi-spin' : 'pi pi-file-excel', command: () => baixarArquivo('excel'), disabled: !tipo || loading || loadingFiltrosPedidos },
  ];

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />
      <Tooltip target=".help-tip" position="top" />

      <div className="p-4">
        <Panel header="Relatórios">
          {/* Tipo de relatório como botões segmentados */}
          <div className="flex gap-2 flex-wrap mb-3" role="tablist" aria-label="Tipo de Relatório">
            {tiposRelatorio.map((op) => (
              <Button
                key={op.value}
                label={op.label}
                icon={op.icon}
                className={`p-button-rounded ${tipo === op.value ? 'p-button-primary' : 'p-button-text'}`}
                onClick={() => setTipo(op.value)}
                aria-pressed={tipo === op.value}
              />
            ))}
            <span className="help-tip pi pi-info-circle text-500 ml-2" data-pr-tooltip="Escolha o tipo para exibir os filtros específicos." />
          </div>

          {/* Chips com filtros ativos */}
          {filtrosAtivos.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {filtrosAtivos.map((t, i) => (
                <Chip key={i} label={t} className="bg-primary-50 text-primary-800 border-1 border-primary-100" />
              ))}
            </div>
          )}

          <Divider className="my-2" />

          <div className="formgrid grid">
            {/* ESTOQUE */}
            {tipo === TIPO.ESTOQUE && (
              <div className="field col-12">
                <div className="grid">
                  <div className="col-12 mt-2">
                    <label className="mb-2 block">Depósitos</label>
                    <MultiSelect
                      value={depositoIds}
                      onChange={(e) => setDepositoIds(e.value)}
                      options={depositos}
                      placeholder="Selecione um ou mais depósitos"
                      display="chip"
                      filter
                      showClear
                      className="w-full"
                      maxSelectedLabels={3}
                      selectedItemsLabel="{0} depósitos selecionados"
                    />
                  </div>

                  <div className="col-12 md:col-6 mt-2">
                    <label className="mb-2 block">Categoria</label>
                    <AutoComplete
                      value={catInput}
                      suggestions={catSug}
                      completeMethod={({ query }) => buscarCategorias(query)}
                      field="label"
                      placeholder="Buscar categoria…"
                      dropdown
                      forceSelection={false}           // evita limpar ao sair do foco
                      onChange={(e) => {
                        // enquanto digita, e.value é string
                        if (typeof e.value === 'string') {
                          setCatInput(e.value);
                          // não mexe em categoria selecionada aqui
                        } else {
                          // alguns builds do Prime chamam onChange com objeto ao selecionar
                          setCategoria(e.value);
                          setCatInput(e.value?.label ?? '');
                        }
                      }}
                      onSelect={(e) => {
                        // ao clicar numa sugestão
                        setCategoria(e.value);         // {id, label}
                        setCatInput(e.value?.label ?? '');
                      }}
                      onClear={() => {
                        setCategoria(null);
                        setCatInput('');
                        setCatSug([]);
                      }}
                      emptySearchMessage="Nenhuma categoria encontrada"
                      emptyMessage="Nenhuma categoria"
                      aria-label="Categoria"
                      itemTemplate={(op) => <span className="font-medium">{op.label}</span>}
                      className="w-full"
                    />
                  </div>

                  {/* Cabeçalho com checkbox alinhado à direita */}
                  <div className="col-12 md:col-6 mt-2">
                    <div className="flex align-items-center justify-content-between mb-2">
                      <label className="m-0">Produto</label>
                      <div className="flex align-items-center">
                        <Checkbox
                          inputId="somenteOutlet"
                          checked={somenteOutlet}
                          onChange={(e) => setSomenteOutlet(e.checked)}
                        />
                        <label htmlFor="somenteOutlet" className="ml-2 mb-0">
                          Somente produtos em outlet
                        </label>
                      </div>
                    </div>

                    <AutoComplete
                      value={produto}
                      suggestions={prodSug}
                      completeMethod={(e) => buscarProdutos(e.query || '')}
                      field="label"
                      placeholder="Buscar por nome ou referência…"
                      dropdown
                      onChange={(e) => setProduto(e.value)}
                      onSelect={(e) => setProduto(e.value)}
                      aria-label="Produto"
                      itemTemplate={(op) => (
                        <div className="flex flex-column">
                          <span className="font-medium">{op.label}</span>
                          {op.sku ? <small className="text-500">{op.sku}</small> : null}
                        </div>
                      )}
                      className="w-full"
                    />
                  </div>

                  <div className="col-12 mt-2">
                    <Tag value="Dica" severity="info" className="mr-2" />
                    <small>Você pode combinar Categoria + Produto para filtrar exatamente o que irá para o PDF/Excel.</small>
                  </div>
                </div>
              </div>
            )}

            {/* PEDIDOS */}
            {tipo === TIPO.PEDIDOS && (
              <>
                <div className="field col-12 md:col-6">
                  <label className="mb-2 block">Período</label>
                  <CalendarBR
                    value={periodoPedidos}
                    onChange={(e) => setPeriodoPedidos(e.value)}
                    selectionMode="range"
                    placeholder="Selecione um intervalo"
                    className="w-full"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {presetsPedidos.map((p) => (
                      <Button key={p.label} label={p.label} className="p-button-sm p-button-text" onClick={p.action} />
                    ))}
                  </div>
                </div>

                {/* Indicador de loading dos filtros (lado direito do período) */}
                <div className="field col-12 md:col-6 flex align-items-end justify-content-end">
                  {loadingFiltrosPedidos && (
                    <div className="flex align-items-center gap-2">
                      <ProgressSpinner strokeWidth="4" style={{ width: '22px', height: '22px' }} />
                      <small className="text-500">Carregando filtros…</small>
                    </div>
                  )}
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Cliente</label>
                  <Dropdown
                    value={clienteId}
                    onChange={(e) => setClienteId(e.value)}
                    options={clientesOpts}
                    placeholder={loadingFiltrosPedidos ? 'Carregando...' : 'Todos'}
                    filter
                    showClear
                    className="w-full"
                    disabled={loadingFiltrosPedidos}
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Parceiro</label>
                  <Dropdown
                    value={parceiroId}
                    onChange={(e) => setParceiroId(e.value)}
                    options={parceirosOpts}
                    placeholder={loadingFiltrosPedidos ? 'Carregando...' : 'Todos'}
                    filter
                    showClear
                    className="w-full"
                    disabled={loadingFiltrosPedidos}
                  />
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Vendedor</label>
                  <Dropdown
                    value={vendedorId}
                    onChange={(e) => setVendedorId(e.value)}
                    options={vendedoresOpts}
                    placeholder={loadingFiltrosPedidos ? 'Carregando...' : 'Todos'}
                    filter
                    showClear
                    className="w-full"
                    disabled={loadingFiltrosPedidos}
                  />
                </div>
              </>
            )}

            {/* CONSIGNAÇÕES */}
            {tipo === TIPO.CONSIG && (
              <>
                <div className="field col-12 md:col-6">
                  <label className="mb-2 block">Período de Envio</label>
                  <CalendarBR
                    value={periodoEnvio}
                    onChange={(e) => setPeriodoEnvio(e.value)}
                    selectionMode="range"
                    placeholder="Selecione um intervalo (opcional)"
                    className="w-full"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {presetsConsigEnvio.map((p) => (
                      <Button key={p.label} label={p.label} className="p-button-sm p-button-text" onClick={p.action} />
                    ))}
                  </div>
                </div>

                <div className="field col-12 md:col-6">
                  <label className="mb-2 block">Período de Vencimento</label>
                  <CalendarBR
                    value={periodoVencimento}
                    onChange={(e) => setPeriodoVencimento(e.value)}
                    selectionMode="range"
                    placeholder="Selecione um intervalo (opcional)"
                    className="w-full"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {presetsConsigVenc.map((p) => (
                      <Button key={p.label} label={p.label} className="p-button-sm p-button-text" onClick={p.action} />
                    ))}
                  </div>
                </div>

                <div className="field col-12 md:col-4">
                  <label className="mb-2 block">Status</label>
                  <Dropdown value={statusConsig} onChange={(e) => setStatusConsig(e.value)} options={STATUS_CONSIGNACAO_OPTIONS} placeholder="Todos" filter showClear className="w-full" />
                </div>

                <div className="field col-12">
                  <div className="flex align-items-center">
                    <Checkbox inputId="consolidado" checked={consolidado} onChange={(e) => setConsolidado(e.checked)} />
                    <label htmlFor="consolidado" className="ml-2 mb-0">Consolidar por cliente (desmarcado = detalhado com produtos)</label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Barra de ações sticky */}
          <Divider />
          <div className="surface-0 border-top-1 border-200 p-3 flex gap-2 flex-wrap justify-content-end" style={{ position: 'sticky', bottom: 0, zIndex: 1 }}>
            <Button
              label="Limpar Filtros"
              icon="pi pi-filter-slash"
              className="p-button-secondary"
              onClick={limparFiltros}
              disabled={!tipo || loading || !hasFilters}
            />
            <SplitButton
              label="Gerar PDF"
              icon={loading ? 'pi pi-spinner pi-spin' : 'pi pi-file-pdf'}
              className="p-button-danger"
              onClick={() => baixarArquivo('pdf')}
              model={exportActions}
              disabled={!tipo || loading || loadingFiltrosPedidos}
            />
          </div>
        </Panel>
      </div>
    </SakaiLayout>
  );
}
