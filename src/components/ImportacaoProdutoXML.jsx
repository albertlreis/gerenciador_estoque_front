import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Tooltip } from 'primereact/tooltip';
import { Divider } from 'primereact/divider';
import { Toolbar } from 'primereact/toolbar';
import { Skeleton } from 'primereact/skeleton';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import apiEstoque from '../services/apiEstoque';

// ----------------------------
// larguras responsivas padronizadas
// ----------------------------
const W = {
  ref: 'w-full sm:w-12rem md:w-14rem lg:w-16rem',
  desc: 'w-full',
  categoria: 'w-full sm:w-14rem md:w-18rem',
  number: 'w-full sm:w-8rem md:w-10rem',
  atributosA: 'w-full sm:w-5/12',
  atributosV: 'w-full sm:w-6/12',
  search: 'w-full sm:w-14rem md:w-18rem',
  deposito: 'w-full sm:w-12rem md:w-16rem',
};

// ----------------------------
const CellWrap = ({ className = '', children }) => (
  <div className={`min-w-0 ${className}`}>{children}</div>
);

// ----------------------------
const debounce = (fn, delay = 350) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

// ----------------------------
const AtributosEditor = ({ value = [], onChange }) => {
  const [novoAtr, setNovoAtr] = useState({ atributo: '', valor: '' });

  const add = () => {
    if (!novoAtr.atributo || !novoAtr.valor) return;
    onChange([...(value || []), { ...novoAtr }]);
    setNovoAtr({ atributo: '', valor: '' });
  };
  const remove = (idx) => {
    const cp = [...(value || [])];
    cp.splice(idx, 1);
    onChange(cp);
  };

  return (
    <div className="flex flex-col gap-2">
      {(value || []).map((a, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <InputText
            value={a.atributo}
            onChange={(e) => {
              const cp = [...value];
              cp[idx] = { ...cp[idx], atributo: e.target.value };
              onChange(cp);
            }}
            placeholder="Atributo"
            className={W.atributosA}
          />
          <InputText
            value={a.valor}
            onChange={(e) => {
              const cp = [...value];
              cp[idx] = { ...cp[idx], valor: e.target.value };
              onChange(cp);
            }}
            placeholder="Valor"
            className={W.atributosV}
          />
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-danger"
            onClick={() => remove(idx)}
          />
        </div>
      ))}
      <div className="flex gap-2 items-center">
        <InputText
          value={novoAtr.atributo}
          onChange={(e) => setNovoAtr({ ...novoAtr, atributo: e.target.value })}
          placeholder="Atributo"
          className={W.atributosA}
        />
        <InputText
          value={novoAtr.valor}
          onChange={(e) => setNovoAtr({ ...novoAtr, valor: e.target.value })}
          placeholder="Valor"
          className={W.atributosV}
        />
        <Button icon="pi pi-plus" className="p-button-text" onClick={add}>
          Adicionar
        </Button>
      </div>
    </div>
  );
};

// ----------------------------
const ImportacaoProdutoXML = () => {
  const [nota, setNota] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [categoriaSugestoes, setCategoriaSugestoes] = useState([]);
  const [categoriaUltimaQuery, setCategoriaUltimaQuery] = useState('');
  const [categoriaCriarVisivel, setCategoriaCriarVisivel] = useState(false);
  const [categoriaCriarNome, setCategoriaCriarNome] = useState('');
  const [categoriaRowIndexAlvo, setCategoriaRowIndexAlvo] = useState(null);

  const [depositoSelecionado, setDepositoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [pedidoSugerido, setPedidoSugerido] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const toast = useRef();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiEstoque.get('/depositos'),
      apiEstoque.get('/variacoes'),
      apiEstoque.get('/categorias'),
    ])
      .then(([dep, _vars, cats]) => {
        setDepositos(dep.data || []);
        const lista = (cats.data || []).map((c) => ({
          id: Number(c.id),
          nome: c.nome,
        }));
        setCategorias(lista);
        setCategoriasOptions(lista.map((c) => ({ label: c.nome, value: c.id })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ----------------------------
  // Upload do XML
  const onUpload = async ({ files }) => {
    const formData = new FormData();
    formData.append('arquivo', files[0]);

    setLoadingUpload(true);
    try {
      const response = await apiEstoque.post('/produtos/importar-xml', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const notaResp = response.data.nota;
      const prods = (response.data.produtos || []).map((p) => ({
        ...p,
        id_categoria: p.id_categoria ?? null,
        variacao_id_manual: p.variacao_id_manual ?? null,
        atributos: p.atributos ?? [],
        pedido_id: p.pedido_id ?? null,
        descricao_final: p.descricao_final || p.descricao_xml,
        // campo visual para o AutoComplete da categoria
        categoria_input:
          (categorias.find((c) => c.id === p.id_categoria)?.nome ?? '') || '',
      }));

      setNota(notaResp);
      setProdutos(prods);
      setProdutosFiltrados(prods);
      toast.current?.show({
        severity: 'success',
        summary: 'XML importado',
        detail: `NF ${notaResp.numero} carregada.`,
      });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao importar XML',
        detail: err.response?.data?.message || 'Falha ao importar XML.',
      });
    } finally {
      setLoadingUpload(false);
    }
  };

  // ----------------------------
  // Utilidades de lista/estado
  const updateItem = (rowIndex, patch) => {
    setProdutosFiltrados((prev) => {
      const list = [...prev];
      const old = list[rowIndex];
      const updated = { ...old, ...patch };
      list[rowIndex] = updated;

      setProdutos((all) => {
        const idx = all.findIndex(
          (p) =>
            p.descricao_xml === old.descricao_xml &&
            (p.referencia || '') === (old.referencia || '')
        );
        if (idx >= 0) {
          const allcp = [...all];
          allcp[idx] = { ...allcp[idx], ...patch };
          return allcp;
        }
        return all;
      });

      return list;
    });
  };

  const removerSelecionados = (event) => {
    if (!selectedRows?.length) return;
    confirmPopup({
      target: event.currentTarget,
      message: `Remover ${selectedRows.length} item(ns) desta importação?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      acceptClassName: 'p-button-danger',
      accept: () => {
        const keys = new Set(
          selectedRows.map((r) => r.descricao_xml + '|' + (r.referencia || ''))
        );
        const nova = produtos.filter(
          (p) => !keys.has(p.descricao_xml + '|' + (p.referencia || ''))
        );
        setProdutos(nova);
        setProdutosFiltrados(nova.filter(filtraGlobal(globalFilter)));
        setSelectedRows([]);
        toast.current?.show({
          severity: 'success',
          summary: 'Removidos',
          detail: 'Itens removidos da lista.',
        });
      },
    });
  };

  // ----------------------------
  // Filtro global
  const filtraGlobal = (term) => (row) => {
    if (!term) return true;
    const t = term.toLowerCase();
    return (
      (row.descricao_final || '').toLowerCase().includes(t) ||
      (row.referencia || '').toLowerCase().includes(t) ||
      (row.descricao_xml || '').toLowerCase().includes(t)
    );
  };

  const onGlobalFilterChange = (e) => {
    const term = e.target.value || '';
    setGlobalFilter(term);
    setProdutosFiltrados(produtos.filter(filtraGlobal(term)));
    setSelectedRows([]);
  };

  // ----------------------------
  // KPIs
  const produtosNovos = useMemo(
    () => produtos.filter((p) => !p.variacao_id && !p.variacao_id_manual),
    [produtos]
  );
  const produtosVinculados = useMemo(
    () => produtos.filter((p) => p.variacao_id || p.variacao_id_manual),
    [produtos]
  );
  const totalCustoXml = useMemo(
    () =>
      produtos.reduce(
        (acc, p) =>
          acc +
          Number(p.custo_unitario || 0) * Number(p.quantidade || 0),
        0
      ),
    [produtos]
  );
  const totalCustoNovos = useMemo(
    () =>
      produtosNovos.reduce(
        (acc, p) =>
          acc +
          Number(p.custo_unitario || 0) * Number(p.quantidade || 0),
        0
      ),
    [produtosNovos]
  );

  // ----------------------------
  // Confirmação
  const confirmarSalvarImportacao = () => {
    const invalidos = produtosNovos.filter(
      (p) => !p.id_categoria || !p.referencia
    );
    if (invalidos.length > 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Produtos novos precisam de Categoria e Referência.',
      });
      return;
    }
    if (!depositoSelecionado) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Depósito',
        detail: 'Selecione o depósito de destino.',
      });
      return;
    }
    setShowConfirm(true);
  };

  const confirmarImportacao = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const payload = {
        nota,
        produtos: produtos.map((p) => ({
          descricao_xml: p.descricao_xml,
          referencia: p.referencia || null,
          unidade: p.unidade || null,
          quantidade: p.quantidade,
          custo_unitario: p.custo_unitario, // custo do XML
          valor_total: p.valor_total,
          observacao: p.observacao || null,
          id_categoria: p.id_categoria || null,
          variacao_id_manual: p.variacao_id_manual || null,
          variacao_id: p.variacao_id || null,
          preco: p.preco ?? null,
          custo_cadastrado: p.custo_cadastrado ?? null,
          descricao_final: p.descricao_final || p.descricao_xml,
          atributos: p.atributos || [],
          pedido_id: p.pedido_id || null,
        })),
        deposito_id: depositoSelecionado?.id || depositoSelecionado,
      };

      await apiEstoque.post('/produtos/importar-xml/confirmar', payload);

      toast.current?.show({
        severity: 'success',
        summary: 'Importação concluída',
        detail: 'Produtos e entradas registradas.',
      });
      setProdutos([]);
      setProdutosFiltrados([]);
      setNota(null);
      setDepositoSelecionado(null);
      setSelectedRows([]);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: err.response?.data?.message || 'Erro ao salvar os produtos.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Pedido (AutoComplete com debounce, via /pedidos?q=)
  const buscarPedidos = useCallback(
    debounce(async (term) => {
      if (!term || term.length < 2) {
        setPedidoSugerido([]);
        return;
      }
      const { data } = await apiEstoque.get('/pedidos', { params: { q: term } });
      setPedidoSugerido(data || []);
    }, 350),
    []
  );

  // ----------------------------
  // Categoria (AutoComplete + criação inline)
  const completarCategorias = (query) => {
    setCategoriaUltimaQuery(query);
    if (!query) {
      setCategoriaSugestoes(categoriasOptions);
      return;
    }
    const q = query.toLowerCase();
    const existentes = categoriasOptions.filter((c) =>
      c.label.toLowerCase().includes(q)
    );

    // Se não existir uma igual, adiciona opção de cadastro
    const jaExiste = categorias.some(
      (c) => c.nome.toLowerCase() === q.trim()
    );

    const sugestoes = [...existentes];
    if (!jaExiste && query.trim().length > 1) {
      sugestoes.push({
        label: `Cadastrar "${query}"`,
        value: '__create__',
        _novoNome: query.trim(),
      });
    }
    setCategoriaSugestoes(sugestoes);
  };

  const abrirCriarCategoria = (nomeSugerido, rowIndex) => {
    setCategoriaCriarNome(nomeSugerido || '');
    setCategoriaRowIndexAlvo(rowIndex);
    setCategoriaCriarVisivel(true);
  };

  const salvarNovaCategoria = async () => {
    try {
      if (!categoriaCriarNome.trim()) return;
      const { data } = await apiEstoque.post('/categorias', {
        nome: categoriaCriarNome.trim(),
      });
      // atualiza lista de categorias
      const nova = { id: Number(data.id), nome: data.nome };
      const novasCategorias = [...categorias, nova];
      setCategorias(novasCategorias);
      const novasOptions = novasCategorias.map((c) => ({
        label: c.nome,
        value: c.id,
      }));
      setCategoriasOptions(novasOptions);

      // aplica na linha alvo
      if (categoriaRowIndexAlvo !== null) {
        updateItem(categoriaRowIndexAlvo, {
          id_categoria: nova.id,
          categoria_input: nova.nome,
        });
      }

      setCategoriaCriarVisivel(false);
      setCategoriaCriarNome('');
      setCategoriaRowIndexAlvo(null);
      toast.current?.show({
        severity: 'success',
        summary: 'Categoria criada',
        detail: 'Categoria adicionada e selecionada.',
      });
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro ao criar categoria',
        detail: e.response?.data?.message || 'Não foi possível criar a categoria.',
      });
    }
  };

  // ----------------------------
  // Render helpers / templates

  const rowClassName = (row) => {
    const vinc = row.variacao_id || row.variacao_id_manual;
    const invalid = !vinc && (!row.id_categoria || !row.referencia);
    return invalid ? 'bg-yellow-50' : (vinc ? '' : 'bg-yellow-50');
  };

  const statusTemplate = (row) => {
    const vinc = row.variacao_id || row.variacao_id_manual;
    return vinc ? <Tag value="Vinculado" severity="success" /> : <Tag value="Novo" severity="warning" />;
  };

  const refEditor = (rowData, { rowIndex }) => (
    <CellWrap>
      <InputText
        value={rowData.referencia || ''}
        onChange={(e) => updateItem(rowIndex, { referencia: e.target.value })}
        className={`${W.ref} ${
          !rowData.variacao_id && !rowData.variacao_id_manual && !rowData.referencia ? 'p-invalid' : ''
        }`}
      />
    </CellWrap>
  );

  const descricaoEditor = (rowData, { rowIndex }) => (
    <CellWrap>
      <InputText
        value={rowData.descricao_final || ''}
        onChange={(e) => updateItem(rowIndex, { descricao_final: e.target.value })}
        className={W.desc}
      />
    </CellWrap>
  );

  const categoriaEditor = (rowData, { rowIndex }) => {
    const bloqueado = rowData.variacao_id || rowData.variacao_id_manual;
    if (bloqueado) return <span>-</span>;

    const valueObj =
      rowData.id_categoria
        ? categoriasOptions.find((o) => o.value === rowData.id_categoria) || null
        : (rowData.categoria_input ? { label: rowData.categoria_input, value: null } : null);

    return (
      <div className="flex items-center gap-2 min-w-0">
        <AutoComplete
          value={valueObj}
          suggestions={categoriaSugestoes}
          completeMethod={(e) => completarCategorias(e.query)}
          onChange={(e) => {
            // e.value pode ser string (quando digitando) ou objeto selecionado
            if (typeof e.value === 'string') {
              updateItem(rowIndex, { categoria_input: e.value, id_categoria: null });
            } else {
              // selecionado
              if (e.value?.value === '__create__') {
                abrirCriarCategoria(e.value._novoNome, rowIndex);
              } else if (e.value?.value) {
                updateItem(rowIndex, {
                  id_categoria: Number(e.value.value),
                  categoria_input: e.value.label,
                });
              }
            }
          }}
          field="label"
          dropdown
          forceSelection={false}
          placeholder="Selecionar ou criar"
          className={W.categoria}
          panelFooterTemplate={
            categoriaUltimaQuery && categoriaUltimaQuery.trim().length > 1
              ? (
                <div className="p-2 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-600">Não encontrou?</span>
                  <Button
                    label={`Cadastrar "${categoriaUltimaQuery}"`}
                    icon="pi pi-plus"
                    className="p-button-text"
                    onClick={() => abrirCriarCategoria(categoriaUltimaQuery, rowIndex)}
                  />
                </div>
              )
              : null
          }
        />
        {!rowData.id_categoria && (
          <i
            className="pi pi-exclamation-triangle text-yellow-600"
            data-pr-tooltip="Categoria obrigatória para novos"
          />
        )}
      </div>
    );
  };

  const atributosEditor = (rowData, { rowIndex }) => (
    <AtributosEditor
      value={rowData.atributos || []}
      onChange={(val) => updateItem(rowIndex, { atributos: val })}
    />
  );

  const precoEditor = (rowData, { rowIndex }) => (
    <CellWrap>
      <InputNumber
        value={rowData.preco ?? null}
        onValueChange={(e) => updateItem(rowIndex, { preco: e.value })}
        mode="decimal"
        minFractionDigits={2}
        className={W.number}
        inputClassName="w-full"
      />
    </CellWrap>
  );

  const custoEditor = (rowData, { rowIndex }) => (
    <CellWrap>
      <InputNumber
        value={rowData.custo_unitario ?? null}
        onValueChange={(e) => updateItem(rowIndex, { custo_unitario: e.value })}
        mode="decimal"
        minFractionDigits={2}
        className={W.number}
        inputClassName="w-full"
      />
    </CellWrap>
  );

  const qtdEditor = (rowData, { rowIndex }) => (
    <CellWrap>
      <InputNumber
        value={rowData.quantidade ?? null}
        onValueChange={(e) => updateItem(rowIndex, { quantidade: e.value })}
        mode="decimal"
        minFractionDigits={2}
        className={W.number}
        inputClassName="w-full"
      />
    </CellWrap>
  );

  const totalTemplate = (row) =>
    ((row.quantidade || 0) * (row.custo_unitario || 0)).toFixed(2);

  // ações em massa: definir categoria para selecionados (somente novos)
  const setCategoriaSelecionados = (catId) => {
    if (!selectedRows?.length) return;
    setProdutos((p) => {
      const ids = new Set(
        selectedRows.map((r) => r.descricao_xml + '|' + (r.referencia || ''))
      );
      return p.map((item) => {
        const key = item.descricao_xml + '|' + (item.referencia || '');
        if (ids.has(key) && !item.variacao_id && !item.variacao_id_manual) {
          return {
            ...item,
            id_categoria: Number(catId),
            categoria_input:
              categorias.find((c) => c.id === Number(catId))?.nome || '',
          };
        }
        return item;
      });
    });
    setProdutosFiltrados((prev) =>
      prev.map((item) => {
        const sel = selectedRows.find(
          (r) =>
            r.descricao_xml === item.descricao_xml &&
            (r.referencia || '') === (item.referencia || '')
        );
        if (sel && !item.variacao_id && !item.variacao_id_manual) {
          return {
            ...item,
            id_categoria: Number(catId),
            categoria_input:
              categorias.find((c) => c.id === Number(catId))?.nome || '',
          };
        }
        return item;
      })
    );
    toast.current?.show({
      severity: 'success',
      summary: 'Categoria aplicada',
      detail: 'Categoria definida nos itens selecionados.',
    });
  };

  // toolbar
  const leftToolbarTemplate = () => (
    <div className="flex items-center gap-2">
      <span className="text-lg font-semibold">1) Enviar XML</span>
      <i className="pi pi-angle-right text-gray-500" />
      <span className={`text-lg ${produtos.length ? 'font-semibold' : ''}`}>
        2) Revisar
      </span>
      <i className="pi pi-angle-right text-gray-500" />
      <span className="text-lg">3) Confirmar</span>
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <span className="hidden md:block">Buscar</span>
      <span className="p-input-icon-left w-full sm:w-auto">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={onGlobalFilterChange}
          placeholder="Ref/Descrição..."
          className={W.search}
        />
      </span>
      <Button
        label="Remover selecionados"
        icon="pi pi-trash"
        className="p-button-text p-button-danger"
        onClick={removerSelecionados}
        disabled={!selectedRows?.length}
      />
    </div>
  );

  const Kpis = () => (
    <div className="flex flex-wrap gap-2">
      <Chip label={`Itens: ${produtos.length}`} />
      <Chip label={`Novos: ${produtosNovos.length}`} />
      <Chip label={`Vinculados: ${produtosVinculados.length}`} />
      <Chip label={`Custo total XML: R$ ${totalCustoXml.toFixed(2)}`} />
      <Chip label={`Custo novos: R$ ${totalCustoNovos.toFixed(2)}`} />
    </div>
  );

  return (
    <div className="p-fluid">
      <Toast ref={toast} />
      <Tooltip target=".pi-exclamation-triangle" />
      <ConfirmDialog
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        message="Deseja salvar estes produtos e registrar a entrada no estoque?"
        header="Confirmar Importação"
        icon="pi pi-question-circle"
        accept={confirmarImportacao}
        reject={() => setShowConfirm(false)}
        acceptLabel="Sim"
        rejectLabel="Cancelar"
      />
      <ConfirmPopup />

      {/* Dialog: criar categoria */}
      <Dialog
        header="Nova categoria"
        visible={categoriaCriarVisivel}
        style={{ width: '32rem', maxWidth: '95vw' }}
        onHide={() => setCategoriaCriarVisivel(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancelar"
              className="p-button-text"
              onClick={() => setCategoriaCriarVisivel(false)}
            />
            <Button
              label="Salvar"
              icon="pi pi-save"
              onClick={salvarNovaCategoria}
              disabled={!categoriaCriarNome.trim()}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <span>Informe o nome da categoria:</span>
          <InputText
            className="w-full"
            value={categoriaCriarNome}
            onChange={(e) => setCategoriaCriarNome(e.target.value)}
            placeholder="Ex.: Poltronas"
          />
        </div>
      </Dialog>

      {/* HEADER STICKY */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <Toolbar left={leftToolbarTemplate} right={rightToolbarTemplate} />
        <div className="px-3 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <FileUpload
              name="arquivo"
              accept=".xml"
              mode="basic"
              customUpload
              uploadHandler={onUpload}
              auto
              chooseLabel={loadingUpload ? 'Enviando...' : 'Selecionar XML'}
              disabled={loadingUpload}
            />
            <Divider layout="vertical" className="hidden md:block" />
            <div className="flex items-center gap-2">
              <span>Depósito:</span>
              {loading ? (
                <Skeleton width="12rem" height="2.5rem" />
              ) : (
                <Dropdown
                  value={depositoSelecionado}
                  options={(depositos || []).map((d) => ({
                    label: d.nome,
                    value: d.id,
                  }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Escolha o depósito"
                  className={W.deposito}
                  onChange={(e) => setDepositoSelecionado(e.value)}
                  disabled={loadingUpload}
                />
              )}
            </div>
          </div>
          <Kpis />
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {(loadingUpload || loading) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.4)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProgressSpinner style={{ width: '60px', height: '60px' }} />
        </div>
      )}

      <div className="p-4">
        {!produtos.length ? (
          <div className="text-gray-600">
            <p>Envie o XML da NF-e para iniciar a importação.</p>
          </div>
        ) : (
          <>
            <h3 className="mb-2">
              Produtos extraídos {nota?.numero && <Badge value={`NF ${nota.numero}`} />}
            </h3>
            <DataTable
              value={produtosFiltrados}
              dataKey={(row) => row.descricao_xml + '|' + (row.referencia || '')}
              responsiveLayout="scroll"
              scrollable
              scrollHeight="calc(100vh - 330px)"
              resizableColumns
              reorderableColumns
              columnResizeMode="fit"
              selection={selectedRows}
              onSelectionChange={(e) => setSelectedRows(e.value)}
              selectionMode="multiple"
              rowClassName={rowClassName}
              emptyMessage="Nenhum item encontrado."
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column header="Status" body={statusTemplate} headerStyle={{ width: '8rem' }} />
              <Column header="Ref. (cProd)" body={refEditor} headerStyle={{ width: '14rem' }} />
              <Column header="Descrição" body={descricaoEditor} />
              <Column header="Categoria" body={categoriaEditor} headerStyle={{ width: '18rem' }} />
              <Column header="Atributos" body={atributosEditor} style={{ minWidth: '22rem' }} />
              <Column header="Preço" body={precoEditor} headerStyle={{ width: '11rem' }} />
              <Column header="Custo (XML)" body={custoEditor} headerStyle={{ width: '12rem' }} />
              <Column header="Qtd" body={qtdEditor} headerStyle={{ width: '9rem' }} />
              <Column
                header="Pedido (nº/cliente)"
                body={(rowData, { rowIndex }) => (
                  <AutoComplete
                    field="label"
                    value={pedidoSugerido.find((p) => p.id === rowData.pedido_id) || null}
                    suggestions={pedidoSugerido}
                    completeMethod={(e) => buscarPedidos(e.query)}
                    onChange={(e) => {
                      const sel = e.value && e.value.id ? e.value : null;
                      updateItem(rowIndex, { pedido_id: sel ? sel.id : null });
                    }}
                    dropdown
                    placeholder="Buscar pedido"
                    className="w-full sm:w-18rem"
                  />
                )}
                headerStyle={{ width: '18rem' }}
              />
            </DataTable>

            {/* ações em massa */}
            <div className="flex flex-wrap gap-2 items-center mt-3">
              <Dropdown
                value={null}
                options={categoriasOptions}
                placeholder="Definir categoria para selecionados"
                onChange={(e) => setCategoriaSelecionados(e.value)}
                className="min-w-18rem"
                disabled={!selectedRows?.length}
              />
              <Button
                label="Limpar seleção"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setSelectedRows([])}
                disabled={!selectedRows?.length}
              />
              <Button
                label={`Remover selecionados (${selectedRows.length})`}
                icon="pi pi-trash"
                className="p-button-text p-button-danger"
                onClick={removerSelecionados}
                disabled={!selectedRows?.length}
              />
            </div>
          </>
        )}
      </div>

      {/* FOOTER FIXO */}
      {produtos.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t px-4 py-3 z-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Tag value={`Itens: ${produtos.length}`} />
              <Tag
                value={`Novos: ${produtosNovos.length}`}
                severity={produtosNovos.length ? 'warning' : 'success'}
              />
              <Tag value={`Vinculados: ${produtosVinculados.length}`} severity="success" />
              <Tag value={`Custo total XML: R$ ${totalCustoXml.toFixed(2)}`} />
            </div>
            <div className="flex gap-2">
              <Button
                label="Confirmar importação"
                icon="pi pi-save"
                onClick={confirmarSalvarImportacao}
                className="p-button-success"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportacaoProdutoXML;
