import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import SakaiLayout from '../layouts/SakaiLayout';

import apiEstoque from '../services/apiEstoque';
import { listarProdutos } from '../services/produtoService';
import formatarPreco from '../utils/formatarPreco';
import { buildOutletExportIds } from '../utils/outletExport';
import { normalizarBuscaProduto } from '../utils/normalizarBuscaProduto';

const filtrosIniciais = {
  categoria_id: null,
  referencia: ''
};

const ProdutosOutlet = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [paginacao, setPaginacao] = useState({ totalRecords: 0, page: 0, rows: 10 });
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [selecionados, setSelecionados] = useState([]);

  const toast = useRef(null);

  const toArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.dados?.results)) return res.dados.results;
    if (Array.isArray(res?.dados)) return res.dados;
    if (Array.isArray(res?.results)) return res.results;
    return [];
  };

  const fetchCategorias = async () => {
    try {
      const response = await apiEstoque.get('/categorias');
      const lista = toArray(response.data).map((c) => ({ label: c.nome, value: c.id }));
      setCategorias(lista);
    } catch {
      toast.current?.show({ severity: 'warn', summary: 'Erro', detail: 'Erro ao buscar categorias' });
    }
  };

  const fetchProdutos = useCallback(
    async ({ page, rows, filtros: overrideFiltros } = {}) => {
      setLoading(true);
      try {
        const paginaAtual = page ?? paginacao.page;
        const linhas = rows ?? paginacao.rows;
        const filtrosAtuais = overrideFiltros ?? filtros;

        const params = {
          is_outlet: 1,
          page: paginaAtual + 1,
          per_page: linhas,
        };

        if (filtrosAtuais.categoria_id) {
          params.id_categoria = filtrosAtuais.categoria_id;
        }

        const referenciaBusca = normalizarBuscaProduto(filtrosAtuais.referencia);
        if (referenciaBusca) {
          params.referencia = referenciaBusca;
        }

        const { data } = await listarProdutos(params);

        setProdutos(data?.data ?? []);
        setPaginacao((prev) => ({
          ...prev,
          page: paginaAtual,
          rows: linhas,
          totalRecords: Number(data?.meta?.total ?? 0)
        }));
      } catch (err) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.response?.data?.message || 'Falha ao carregar produtos outlet'
        });
      } finally {
        setLoading(false);
      }
    },
    [filtros, paginacao.page, paginacao.rows]
  );

  useEffect(() => {
    fetchCategorias();
    fetchProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPageChange = (e) => {
    const next = { page: e.page, rows: e.rows };
    setPaginacao((prev) => ({ ...prev, ...next }));
    fetchProdutos({ page: e.page, rows: e.rows });
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setPaginacao((prev) => ({ ...prev, page: 0 }));
    fetchProdutos({ page: 0 });
  };

  const limparFiltros = () => {
    setFiltros(filtrosIniciais);
    setPaginacao((prev) => ({ ...prev, page: 0 }));
    fetchProdutos({ page: 0, filtros: filtrosIniciais });
  };

  const exportarSelecionados = async () => {
    const ids = buildOutletExportIds(selecionados);
    if (!ids.length) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Nenhum selecionado',
        detail: 'Selecione ao menos um produto para exportar.'
      });
      return;
    }

    setLoadingExport(true);
    try {
      const response = await apiEstoque.post(
        '/produtos/outlet/export',
        { ids, format: 'pdf' },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/pdf'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `catalogo_outlet_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || 'Falha ao exportar produtos'
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const referenciasBody = (row) => {
    const refs = (row.variacoes || [])
      .map((v) => v?.referencia)
      .filter(Boolean);

    const uniq = Array.from(new Set(refs));
    return uniq.length ? uniq.join(', ') : '-';
  };

  const categoriaBody = (row) => row?.categoria?.nome || row?.categoria || '-';

  const montarMedidas = (row) => {
    const altura = row?.altura;
    const largura = row?.largura;
    const profundidade = row?.profundidade;

    const algumPreenchido = [altura, largura, profundidade].some((v) => v !== null && v !== undefined && v !== '');
    if (!algumPreenchido) return null;

    const format = (valor) => (valor === null || valor === undefined || valor === '' ? '-' : valor);
    return `A ${format(altura)} x L ${format(largura)} x P ${format(profundidade)} cm`;
  };

  const nomeBody = (row) => {
    const medidas = montarMedidas(row);
    if (!medidas) {
      return row?.nome || '-';
    }

    return `${row?.nome || '-'} - ${medidas}`;
  };

  const calcularOfertaFallback = (row) => {
    const variacoes = Array.isArray(row?.variacoes) ? row.variacoes : [];

    const ofertas = variacoes
      .map((variacao) => {
        const precoVenda = Number(variacao?.preco ?? 0);
        if (precoVenda <= 0) return null;

        const outletsAtivos = Array.isArray(variacao?.outlets)
          ? variacao.outlets.filter((outlet) => Number(outlet?.quantidade_restante ?? 0) > 0)
          : [];

        const condicoes = outletsAtivos
          .flatMap((outlet) => (Array.isArray(outlet?.formas_pagamento) ? outlet.formas_pagamento : []))
          .map((forma) => {
            const nome = forma?.forma_pagamento?.nome || null;
            const maxParcelas = forma?.max_parcelas ?? forma?.forma_pagamento?.max_parcelas_default ?? null;
            return {
              forma_pagamento: nome,
              percentual_desconto: Number(forma?.percentual_desconto ?? 0),
              max_parcelas: maxParcelas ? Number(maxParcelas) : null,
            };
          })
          .filter((condicao) => !!condicao.forma_pagamento);

        const percentualDesconto = condicoes.reduce(
          (maximo, condicao) => Math.max(maximo, Number(condicao.percentual_desconto || 0)),
          0
        );

        const precoFinalVenda = Number((precoVenda * (1 - percentualDesconto / 100)).toFixed(2));

        return {
          preco_venda: precoVenda,
          preco_final_venda: precoFinalVenda,
          percentual_desconto: percentualDesconto,
          pagamento_condicoes: condicoes,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.preco_final_venda - b.preco_final_venda);

    return ofertas[0] || null;
  };

  const obterOfertaOutlet = (row) => {
    const catalogo = row?.outlet_catalogo || {};
    const precoVenda = Number(catalogo?.preco_venda ?? row?.preco_venda ?? 0);
    const precoFinalVenda = Number(catalogo?.preco_final_venda ?? row?.preco_final_venda ?? 0);
    const percentualDesconto = Number(catalogo?.percentual_desconto ?? row?.percentual_desconto ?? 0);
    const pagamentoLabel = catalogo?.pagamento_label ?? row?.pagamento_label ?? null;
    const pagamentoDetalhes = catalogo?.pagamento_detalhes ?? row?.pagamento_detalhes ?? null;
    const pagamentoCondicoes = Array.isArray(catalogo?.pagamento_condicoes)
      ? catalogo.pagamento_condicoes
      : Array.isArray(row?.pagamento_condicoes)
        ? row.pagamento_condicoes
        : [];

    if (precoVenda > 0 && precoFinalVenda > 0) {
      return {
        preco_venda: precoVenda,
        preco_final_venda: precoFinalVenda,
        percentual_desconto: percentualDesconto,
        pagamento_label: pagamentoLabel,
        pagamento_detalhes: pagamentoDetalhes,
        pagamento_condicoes: pagamentoCondicoes,
      };
    }

    const fallback = calcularOfertaFallback(row);
    if (!fallback) {
      return null;
    }

    const formas = [...new Set((fallback.pagamento_condicoes || []).map((item) => item.forma_pagamento).filter(Boolean))];
    const parcelasMax = (fallback.pagamento_condicoes || []).reduce((maximo, item) => {
      const parcelas = Number(item?.max_parcelas || 0);
      return parcelas > maximo ? parcelas : maximo;
    }, 0);

    const pagamentoLabelFallback = formas.length
      ? `${formas.join(', ')}${parcelasMax > 1 ? ` (ate ${parcelasMax}x)` : ''}`
      : null;

    return {
      ...fallback,
      pagamento_label: pagamentoLabelFallback,
      pagamento_detalhes: fallback.percentual_desconto > 0
        ? `Desconto de ate ${fallback.percentual_desconto}% conforme forma de pagamento.`
        : null,
    };
  };

  const precoVendaBody = (row) => {
    const oferta = obterOfertaOutlet(row);
    if (!oferta) return '-';

    if (Number(oferta.percentual_desconto || 0) > 0) {
      return (
        <span style={{ textDecoration: 'line-through', color: '#6b7280' }}>
          {formatarPreco(oferta.preco_venda)}
        </span>
      );
    }

    return formatarPreco(oferta.preco_venda);
  };

  const precoFinalBody = (row) => {
    const oferta = obterOfertaOutlet(row);
    if (!oferta) return '-';

    return (
      <div className="flex align-items-center gap-2">
        <strong>{formatarPreco(oferta.preco_final_venda)}</strong>
        {Number(oferta.percentual_desconto || 0) > 0 && (
          <Tag value={`-${oferta.percentual_desconto}%`} severity="warning" />
        )}
      </div>
    );
  };

  const pagamentoBody = (row) => {
    const oferta = obterOfertaOutlet(row);
    if (!oferta?.pagamento_label) return '-';

    return (
      <div title={oferta.pagamento_detalhes || ''}>
        <div>{oferta.pagamento_label}</div>
        {oferta.pagamento_detalhes && (
          <small className="text-600">{oferta.pagamento_detalhes}</small>
        )}
      </div>
    );
  };

  const outletRestanteBody = (row) => {
    const total = (row.variacoes || []).reduce((acc, v) => {
      const restante = Number(v?.outlet_restante_total ?? 0);
      return acc + (Number.isNaN(restante) ? 0 : restante);
    }, 0);

    return <Tag value={`${total} un.`} severity={total > 0 ? 'success' : 'danger'} />;
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4">
        <Accordion className="w-full" activeIndex={expanded ? 0 : null}
                   onTabChange={(e) => setExpanded(e.index !== null)}>
          <AccordionTab header="Filtros de Pesquisa">
            <form onSubmit={aplicarFiltros}>
              <div className="p-4 mb-4 surface-0 border-round shadow-1">
                <div className="formgrid grid gap-3">
                  <div className="field col-12 md:col-4">
                    <label className="block text-600 mb-1">Categoria</label>
                    <Dropdown
                      options={categorias}
                      placeholder="Selecione a categoria"
                      value={filtros.categoria_id || null}
                      onChange={(e) => setFiltros({ ...filtros, categoria_id: e.value })}
                      className="w-full"
                      showClear
                      filter
                      filterBy="label"
                      disabled={loading}
                    />
                  </div>

                  <div className="field col-12 md:col-5">
                    <label className="block text-600 mb-1">Referencia</label>
                    <InputText
                      value={filtros.referencia}
                      onChange={(e) => setFiltros({ ...filtros, referencia: e.target.value })}
                      placeholder="Ex: REF-123"
                      className="w-full"
                      disabled={loading}
                    />
                  </div>

                  <div className="field col-12 md:col-3 flex align-items-end justify-content-end">
                    <div className="flex gap-2 w-full justify-content-end">
                      <Button
                        label="Limpar"
                        icon="pi pi-filter-slash"
                        className="p-button-outlined"
                        severity="secondary"
                        type="button"
                        disabled={loading}
                        onClick={limparFiltros}
                      />
                      <Button
                        label={loading ? 'Buscando...' : 'Buscar'}
                        icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-search'}
                        type="submit"
                        className="p-button-primary"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </AccordionTab>
        </Accordion>

        <div className="flex justify-content-between align-items-center mb-3">
          <h2>Catalogo Outlet</h2>
          <div className="flex gap-2 align-items-center">
            <span className="text-sm text-600">Selecionados: {selecionados.length}</span>
            <Button
              label="Limpar selecao"
              icon="pi pi-times"
              className="p-button-outlined"
              severity="secondary"
              onClick={() => setSelecionados([])}
              disabled={!selecionados.length}
            />
            <Button
              label="Exportar selecionados"
              icon={loadingExport ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'}
              className="p-button-danger"
              onClick={exportarSelecionados}
              disabled={!selecionados.length || loadingExport}
            />
          </div>
        </div>

        <DataTable
          value={produtos}
          paginator
          rows={paginacao.rows}
          first={paginacao.page * paginacao.rows}
          totalRecords={paginacao.totalRecords}
          onPage={onPageChange}
          lazy
          loading={loading}
          dataKey="id"
          selection={selecionados}
          onSelectionChange={(e) => setSelecionados(e.value)}
          emptyMessage="Nenhum produto outlet encontrado"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="id" header="ID" style={{ width: '90px' }} />
          <Column header="Referencia" body={referenciasBody} />
          <Column header="Nome" body={nomeBody} style={{ minWidth: '260px' }} />
          <Column header="Categoria" body={categoriaBody} />
          <Column header="Preco de venda" body={precoVendaBody} style={{ width: '150px' }} />
          <Column header="Preco final" body={precoFinalBody} style={{ width: '180px' }} />
          <Column header="Pagamento" body={pagamentoBody} style={{ minWidth: '220px' }} />
          <Column header="Outlet" body={outletRestanteBody} style={{ width: '120px' }} />
        </DataTable>
      </div>
    </SakaiLayout>
  );
};

export default ProdutosOutlet;

