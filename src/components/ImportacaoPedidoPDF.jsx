import React, { useEffect, useRef, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputNumber } from 'primereact/inputnumber';

import apiEstoque from '../services/apiEstoque';
import apiAuth from '../services/apiAuth';
import PedidosApi from '../api/pedidosApi';

import ProdutoImportadoCard from './importacaoPedido/ProdutoImportadoCard';
import ProdutoImportadoListItem from './importacaoPedido/ProdutoImportadoListItem';
import FormularioPedido from './importacaoPedido/FormularioPedido';
import TabelaParcelas from './importacaoPedido/TabelaParcelas';
import PedidoFabricaForm from './PedidoFabricaForm';
import ClienteForm from '../components/cliente/ClienteForm';
import AdicionarProduto from './produto/AdicionarProduto';
import { normalizeDateToYmd } from '../utils/date';

const TIPOS_IMPORTACAO = [
  { label: 'Produtos PDF Sierra', value: 'PRODUTOS_PDF_SIERRA', accept: '.pdf' },
  { label: 'Produtos PDF Avanti', value: 'PRODUTOS_PDF_AVANTI', accept: '.pdf' },
  { label: 'Produtos PDF Quaker', value: 'PRODUTOS_PDF_QUAKER', accept: '.pdf' },
  { label: 'Adornos XML NF-e', value: 'ADORNOS_XML_NFE', accept: '.xml,application/xml,text/xml' },
];

const TIPO_IMPORTACAO_PADRAO = 'PRODUTOS_PDF_SIERRA';

/**
 * Mescla produtos com mesma referência, somando quantidades e valores.
 */
function mesclarProdutosRepetidos(itens) {
  const mapa = {};

  (itens || []).forEach((item) => {
    const ref = (item.ref || item.codigo || '').trim();
    if (!ref) return;

    if (!mapa[ref]) {
      mapa[ref] = { ...item, ref };
    } else {
      const qtdAtual = Number(mapa[ref].quantidade || 0);
      const qtdNova = Number(item.quantidade || 0);
      const novaQuantidade = qtdAtual + qtdNova;
      const custoAtual = Number(mapa[ref].custo_unitario ?? 0);
      const custoNovo = Number(item.custo_unitario ?? 0);
      const vendaAtual = Number(mapa[ref].valor ?? mapa[ref].preco_unitario ?? 0);
      const vendaNova = Number(item.valor ?? item.preco_unitario ?? 0);

      mapa[ref].quantidade = novaQuantidade;
      mapa[ref].custo_unitario =
        novaQuantidade > 0
          ? Number(((custoAtual * qtdAtual + custoNovo * qtdNova) / novaQuantidade).toFixed(2))
          : 0;
      mapa[ref].valor =
        novaQuantidade > 0
          ? Number(((vendaAtual * qtdAtual + vendaNova * qtdNova) / novaQuantidade).toFixed(2))
          : 0;
      mapa[ref].preco_unitario = mapa[ref].valor;
    }
  });

  return Object.values(mapa);
}

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundCurrency = (value) => Number(toNumber(value).toFixed(2));

const calcularVendaPorMargem = (custoUnitario, percentual) => {
  const custo = toNumber(custoUnitario);
  const margem = toNumber(percentual);
  return roundCurrency(custo * (1 + margem / 100));
};

const parseDateInput = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const raw = String(value).trim();
  if (!raw) return null;

  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const addBusinessDays = (date, days) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const amount = Math.max(0, Number(days) || 0);
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let added = 0;

  while (added < amount) {
    result.setDate(result.getDate() + 1);
    const weekDay = result.getDay();
    if (weekDay !== 0 && weekDay !== 6) {
      added += 1;
    }
  }

  return result;
};

const formatDateBr = (value) => {
  const date = parseDateInput(value);
  if (!date) return null;
  return date.toLocaleDateString('pt-BR');
};

/**
 * Componente responsável pela importação de pedidos via PDF.
 * Realiza upload, parsing e persistência com integração à API Laravel.
 */
export default function ImportacaoPedidoPDF() {
  const [dados, setDados] = useState(null);

  const [cliente, setCliente] = useState({});
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState(null);
  const [mostrarDialogCliente, setMostrarDialogCliente] = useState(false);

  const [pedido, setPedido] = useState({});
  const [itens, setItens] = useState([]);
  const [importacaoId, setImportacaoId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const [abrirPedidoFabrica, setAbrirPedidoFabrica] = useState(false);
  const [itensParaFabrica, setItensParaFabrica] = useState([]);
  const [pedidoSalvoId, setPedidoSalvoId] = useState(null);
  const [percentualVenda, setPercentualVenda] = useState(0);
  const [tipoImportacao, setTipoImportacao] = useState(TIPO_IMPORTACAO_PADRAO);

  // seleção em lote de produtos
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [depositoEmLote, setDepositoEmLote] = useState(null);

  // modal Adicionar Produto
  const [mostrarAdicionarProduto, setMostrarAdicionarProduto] = useState(false); // <<< NOVO

  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  /** 🔄 Carrega listas iniciais */
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [cat, dep, par, ven, cli] = await Promise.all([
          apiEstoque.get('/categorias'),
          apiEstoque.get('/depositos'),
          apiEstoque.get('/parceiros'),
          apiAuth.get('/usuarios?perfil_id=2'),
          apiEstoque.get('/clientes'),
        ]);

        setCategorias(Array.isArray(cat.data) ? cat.data : []);
        setDepositos(Array.isArray(dep.data) ? dep.data : []);
        setParceiros(Array.isArray(par.data) ? par.data : []);
        setVendedores(Array.isArray(ven.data) ? ven.data : []);
        setClientes(Array.isArray(cli.data) ? cli.data : []);
      } catch (err) {
        console.warn('Falha ao carregar listas iniciais', err);
        setCategorias([]);
        setDepositos([]);
        setParceiros([]);
        setVendedores([]);
        setClientes([]);
      }
    };

    carregarDadosIniciais();
  }, []);

  /** 📤 Upload do arquivo PDF */
  const onUpload = async ({ files }) => {
    if (!files?.length) return;

    if (!tipoImportacao) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Tipo obrigatorio',
        detail: 'Selecione o tipo de importacao antes de enviar o arquivo.',
      });
      return;
    }

    const arquivo = files[0];
    const nomeArquivo = (arquivo?.name || '').toLowerCase();
    const tipoEhXml = tipoImportacao === 'ADORNOS_XML_NFE';

    if (tipoEhXml && !nomeArquivo.endsWith('.xml')) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Arquivo invalido',
        detail: 'Para ADORNOS_XML_NFE, envie um arquivo XML.',
      });
      return;
    }

    if (!tipoEhXml && !nomeArquivo.endsWith('.pdf')) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Arquivo invalido',
        detail: 'Para importacoes de produtos, envie um arquivo PDF.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('tipo_importacao', tipoImportacao);

    setLoading(true);
    setUploadStatus('uploading');

    try {
      const response = await PedidosApi.importarArquivo(formData);

      const payload = response.data?.dados;
      if (!payload) throw new Error('Resposta inesperada da API');

      // ================================
      // PEDIDO
      // ================================
      const p = payload.pedido || {};

      const pedidoNormalizado = {
        tipo: 'venda',
        numero_externo: p.numero_externo || '',
        data_pedido: p.data_pedido || null,
        data_inclusao: p.data_inclusao || null,
        data_entrega: null,
        entregue: false,
        previsao_tipo: p.data_entrega ? 'DATA' : null,
        data_prevista: p.data_entrega || null,
        dias_uteis_previstos: null,
        dias_corridos_previstos: null,
        total: Number(p.total) || 0,
        observacoes: p.observacoes || '',
        parcelas: p.parcelas || [],
      };

      // ================================
      // ITENS (normaliza + mescla refs iguais)
      // ================================
      const itensNormalizadosBase = (payload.itens || []).map((item) => ({
        quantidade: toNumber(item.quantidade ?? 0),
        custo_unitario: roundCurrency(
          item.custo_unitario ??
            item.preco_unitario ??
            item.preco ??
            0,
        ),
        ref: item.ref || item.codigo || '',
        nome: item.nome || item.descricao || '',
        nome_completo: item.nome_completo || '',
        valor: roundCurrency(
          item.valor ??
            item.preco_venda ??
            item.preco_unitario ??
            item.preco ??
            0,
        ),
        preco_unitario: roundCurrency(
          item.valor ??
            item.preco_venda ??
            item.preco_unitario ??
            item.preco ??
            0,
        ),
        preco: roundCurrency(item.preco ?? item.preco_unitario ?? 0),
        unidade: item.unidade || 'PC',

        id_categoria: item.id_categoria ?? null,
        categoria: item.categoria ?? null,
        produto_id: item.produto_id ?? null,
        id_variacao: item.id_variacao ?? null,
        variacao_nome: item.variacao_nome ?? null,

        tipo: 'PEDIDO',
        enviar_fabrica: false,

        atributos: item.atributos || {},
        atributos_raw: item.atributos_raw || [],
        fixos: item.fixos || {},

        id_deposito: null,
      }));

      const itensNormalizados = mesclarProdutosRepetidos(itensNormalizadosBase);

      // ================================
      // Atribuir ao estado
      // ================================
      setDados(payload);
      setCliente({});
      setClienteSelecionadoId(null);
      setPedido(pedidoNormalizado);
      setItens(itensNormalizados);
      setPercentualVenda(0);
      setItensSelecionados([]);
      setUploadStatus('done');
      setImportacaoId(response.data?.importacao_id ?? null);

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'PDF importado com sucesso!',
      });
    } catch (err) {
      console.error('Erro no upload:', err);

      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.mensagem || 'Falha ao importar PDF.',
      });

      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const categoriasNumericas = Array.isArray(categorias)
    ? categorias.map((cat) => ({ ...cat, id: Number(cat.id) }))
    : [];

  const depositosDropdownOptions = Array.isArray(depositos)
    ? depositos.map((d) => ({ label: d.nome, value: Number(d.id) }))
    : [];
  /** 🧍 Cliente: seleção via dropdown */
  const handleSelecionarCliente = (id) => {
    setClienteSelecionadoId(id);
    const selecionado = (clientes || []).find((c) => c.id === id);
    setCliente(selecionado || {});
  };

  /** Atualizações de pedido */
  const onChangePedido = (field, value) =>
    setPedido((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'entregue' && !value) {
        next.data_entrega = null;
      }

      if (field === 'previsao_tipo') {
        if (value !== 'DATA') next.data_prevista = null;
        if (value !== 'DIAS_UTEIS') next.dias_uteis_previstos = null;
        if (value !== 'DIAS_CORRIDOS') next.dias_corridos_previstos = null;
      }

      return next;
    });

  /** Atualizações de item */
  const onChangeItem = (index, field, value) => {
    setItens((prev) => {
      const novos = [...prev];
      const itemAtual = { ...novos[index], [field]: value };

      if (field === 'valor' || field === 'preco_unitario') {
        const precoVenda = roundCurrency(value);
        itemAtual.valor = precoVenda;
        itemAtual.preco_unitario = precoVenda;
      }

      if (field === 'custo_unitario') {
        itemAtual.custo_unitario = roundCurrency(value);
      }

      novos[index] = itemAtual;
      return novos;
    });
  };

  const aplicarPercentualVendaTodosItens = () => {
    const percentual = toNumber(percentualVenda);
    setItens((prev) =>
      prev.map((item) => {
        const custoUnit = roundCurrency(item.custo_unitario ?? item.preco_unitario ?? item.preco ?? 0);
        const precoVenda = calcularVendaPorMargem(custoUnit, percentual);

        return {
          ...item,
          custo_unitario: custoUnit,
          valor: precoVenda,
          preco_unitario: precoVenda,
        };
      }),
    );
  };

  /**
   * Adiciona/mescla um item vindo do modal AdicionarProduto.
   * - Se tiver id_variacao, tenta mesclar por id_variacao
   * - Senão, tenta mesclar por ref
   * - Caso não exista, adiciona novo item ao array
   */
  const adicionarItemImportado = (novoItem) => {
    setItens((prev) => {
      const lista = [...prev];

      // Mescla por variação, se houver
      if (novoItem.id_variacao) {
        const idxVar = lista.findIndex(
          (i) => i.id_variacao && i.id_variacao === novoItem.id_variacao
        );
        if (idxVar >= 0) {
          const atual = lista[idxVar];
          lista[idxVar] = {
            ...atual,
            quantidade: Number(atual.quantidade || 0) + Number(novoItem.quantidade || 1),
          };
          return lista;
        }
      }

      // Mescla por referência também
      if (novoItem.ref) {
        const idxRef = lista.findIndex((i) => i.ref === novoItem.ref);
        if (idxRef >= 0) {
          const atual = lista[idxRef];
          lista[idxRef] = {
            ...atual,
            quantidade: Number(atual.quantidade || 0) + Number(novoItem.quantidade || 1),
          };
          return lista;
        }
      }

      // Caso não exista, adiciona novo item completo
      return [
        ...lista,
        {
          ref: '',
          nome: '',
          nome_completo: '',
          quantidade: 1,
          valor: 0,
          preco_unitario: 0,
          custo_unitario: 0,
          unidade: 'PC',
          id_categoria: null,
          produto_id: null,
          id_variacao: null,
          variacao_nome: null,
          tipo: 'PEDIDO',
          enviar_fabrica: false,
          atributos: {},
          atributos_raw: [],
          fixos: {},
          id_deposito: null,
          ...novoItem, // sobrescreve com dados recebidos
        },
      ];
    });

    setMostrarAdicionarProduto(false);
  };

  /** Remover item (qualquer item) */
  const removerItem = (index) => {
    setItens((prev) => prev.filter((_, idx) => idx !== index));

    setItensSelecionados((prev) =>
      prev
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i))
    );
  };

  /** Seleção em lote */
  const toggleSelecionado = (index, checked) => {
    setItensSelecionados((prev) =>
      checked ? [...new Set([...prev, index])] : prev.filter((i) => i !== index),
    );
  };

  const selecionarTodos = (checked) => {
    if (checked) {
      setItensSelecionados(itens.map((_, idx) => idx));
    } else {
      setItensSelecionados([]);
    }
  };

  const aplicarDepositoLote = () => {
    if (!depositoEmLote) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Depósito',
        detail: 'Selecione um depósito para aplicar.',
      });
      return;
    }

    if (itensSelecionados.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Seleção',
        detail: 'Selecione ao menos um produto.',
      });
      return;
    }

    setItens((prev) =>
      prev.map((item, idx) =>
        itensSelecionados.includes(idx)
          ? { ...item, id_deposito: depositoEmLote }
          : item,
      ),
    );
  };

  /** 🧹 Limpeza e reimportação */
  const resetarFormulario = () => {
    fileUploadRef.current?.clear();
    setUploadStatus(null);
    setDados(null);
    setCliente({});
    setClienteSelecionadoId(null);
    setPedido({});
    setItens([]);
    setItensSelecionados([]);
    setDepositoEmLote(null);
    setPedidoSalvoId(null);
    setItensParaFabrica([]);
    setAbrirPedidoFabrica(false);
    setImportacaoId(null);
    setPercentualVenda(0);
    setTipoImportacao(TIPO_IMPORTACAO_PADRAO);
  };

  const confirmarRemocaoArquivo = () => {
    confirmDialog({
      message: 'Deseja realmente remover o arquivo e importar um novo?',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      accept: resetarFormulario,
    });
  };

  /** 💾 Confirma importação e salva no banco */
  /** 💾 Confirma importação e salva no banco */
  const confirmarImportacao = async () => {
    const tipo = pedido?.tipo ?? 'venda';
    const entregue = Boolean(pedido?.entregue);
    const dataEntregaYmd = normalizeDateToYmd(pedido?.data_entrega);
    const previsaoTipo = pedido?.previsao_tipo ?? null;
    const dataPrevistaYmd = normalizeDateToYmd(pedido?.data_prevista);
    const diasUteisPrevistos = pedido?.dias_uteis_previstos ?? null;
    const diasCorridosPrevistos = pedido?.dias_corridos_previstos ?? null;

    if (tipo === 'venda' && (!clienteSelecionadoId || !cliente?.nome)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cliente obrigatório',
        detail: 'Selecione um cliente antes de confirmar o pedido.',
      });
      return;
    }

    const semCategoria = itens.filter((i) => !i.id_categoria);
    if (semCategoria.length > 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Categoria obrigatória',
        detail: 'Todos os produtos devem ter uma categoria selecionada.',
      });
      return;
    }

    if (entregue && !dataEntregaYmd) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Data de entrega obrigatória',
        detail: 'Informe a data de entrega quando o pedido já foi entregue.',
      });
      return;
    }

    if (previsaoTipo === 'DATA' && !dataPrevistaYmd) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Previsão incompleta',
        detail: 'Informe a data prevista para o tipo DATA.',
      });
      return;
    }

    if (previsaoTipo === 'DIAS_UTEIS' && (diasUteisPrevistos === null || diasUteisPrevistos === '')) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Previsão incompleta',
        detail: 'Informe os dias úteis previstos.',
      });
      return;
    }

    if (previsaoTipo === 'DIAS_CORRIDOS' && (diasCorridosPrevistos === null || diasCorridosPrevistos === '')) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Previsão incompleta',
        detail: 'Informe os dias corridos previstos.',
      });
      return;
    }

    try {
      const pedidoPayload = {
        ...pedido,
        tipo,
        data_pedido: normalizeDateToYmd(pedido?.data_pedido),
        data_inclusao: normalizeDateToYmd(pedido?.data_inclusao),
        data_entrega: dataEntregaYmd,
        entregue,
        previsao_tipo: previsaoTipo,
        data_prevista: dataPrevistaYmd,
        dias_uteis_previstos: diasUteisPrevistos,
        dias_corridos_previstos: diasCorridosPrevistos,
      };

      const response = await PedidosApi.confirmarImportacaoPdf({
        importacao_id: importacaoId,
        tipo_importacao: tipoImportacao,
        cliente: tipo === 'venda' ? cliente : {},
        pedido: pedidoPayload,
        entregue,
        data_entrega: dataEntregaYmd,
        previsao_tipo: previsaoTipo,
        data_prevista: dataPrevistaYmd,
        dias_uteis_previstos: diasUteisPrevistos,
        dias_corridos_previstos: diasCorridosPrevistos,
        itens: itens.map((item) => ({
          ...item,
          valor: roundCurrency(item.valor ?? item.preco_unitario ?? 0),
          preco_unitario: roundCurrency(item.preco_unitario ?? item.valor ?? 0),
          custo_unitario: roundCurrency(item.custo_unitario ?? item.preco_unitario ?? item.preco ?? 0),
          descricao: item.descricao,
          id_variacao: item.id_variacao ?? null,
          produto_id: item.produto_id ?? null,
          variacao_nome: item.variacao_nome ?? null,
          id_categoria: item.id_categoria ?? null,
        })),
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Pedido Confirmado',
        detail: 'Os dados foram salvos com sucesso!',
      });

      const pedidoId = response.data?.id;
      const variacoesConfirmadas = Array.isArray(response.data?.itens)
        ? response.data.itens
        : [];

      // ✅ NÃO redeclare "tipo" aqui (isso causava TDZ)
      const fabrica = itens
        .filter((i) => i.enviar_fabrica)
        .map((item) => {
          const encontrado = variacoesConfirmadas.find(
            (v) => v.referencia === item.ref && v.nome_produto === item.nome
          );

          const vincularVenda = (tipo === 'venda');

          return {
            produto_variacao_id: encontrado?.id_variacao,
            produto_variacao_nome: encontrado?.nome_completo || '',
            quantidade: item.quantidade,
            deposito_id: item.id_deposito ?? null,

            // ✅ só vincula se for VENDA
            pedido_venda_id: vincularVenda ? pedidoId : null,
            pedido_venda_label: vincularVenda
              ? (pedido.numero_externo ? `Pedido #${pedido.numero_externo}` : `Pedido #${pedidoId}`)
              : '',

            observacoes: item.observacoes || '',
          };
        });

      setPedidoSalvoId(pedidoId);

      if (fabrica.length > 0) {
        setItensParaFabrica(fabrica);
        setAbrirPedidoFabrica(true);
      } else {
        resetarFormulario();
      }
    } catch (err) {
      console.error('Erro ao confirmar importação:', err);
      const fieldErrors = err.response?.data?.errors;
      const erroNumeroExterno = fieldErrors?.['pedido.numero_externo']?.[0];
      let detalhe = 'Erro ao salvar o pedido.';

      if (erroNumeroExterno?.includes('has already been taken')) {
        detalhe =
          'Já existe um pedido com esse número. Verifique se ele já foi importado anteriormente.';
      }

      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: detalhe,
      });
    }
  };

  /** 🖼️ Template de arquivo no upload */
  const entregaPrevistaPreview = (() => {
    const tipoPrevisao = pedido?.previsao_tipo;
    const baseDate = parseDateInput(pedido?.data_pedido) || new Date();

    if (tipoPrevisao === 'DATA') {
      return formatDateBr(pedido?.data_prevista);
    }

    if (tipoPrevisao === 'DIAS_UTEIS') {
      const prevista = addBusinessDays(baseDate, pedido?.dias_uteis_previstos);
      return formatDateBr(prevista);
    }

    if (tipoPrevisao === 'DIAS_CORRIDOS') {
      const dias = Math.max(0, Number(pedido?.dias_corridos_previstos) || 0);
      const prevista = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
      prevista.setDate(prevista.getDate() + dias);
      return formatDateBr(prevista);
    }

    return null;
  })();

  const fileTemplate = (file) => (
    <div className="flex align-items-center justify-content-between w-full px-3 py-2 border-bottom-1 surface-border">
      <div className="flex align-items-center gap-3">
        <i className="pi pi-file-pdf text-2xl text-blue-500" />
        <span className="font-medium text-sm">{file.name}</span>
        <small className="text-muted">
          {(file.size / 1024).toFixed(1)} KB
        </small>
        {uploadStatus === 'done' && <Tag value="Carregado" severity="success" />}
        {uploadStatus === 'error' && <Tag value="Erro" severity="danger" />}
        {uploadStatus === 'uploading' && (
          <Tag value="Carregando..." severity="warning" />
        )}
      </div>
      <Button
        type="button"
        icon="pi pi-times"
        className="p-button-text p-button-danger"
        onClick={confirmarRemocaoArquivo}
      />
    </div>
  );
  return (
    <div className="p-fluid p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      {loading && (
        <div
          className="fixed top-0 left-0 w-full h-full flex justify-content-center align-items-center z-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
        >
          <ProgressSpinner style={{ width: '60px', height: '60px' }} />
        </div>
      )}

      {/* Upload */}
      <Card className="mb-4" title="Enviar Arquivo PDF">
        <div className="flex flex-column align-items-center gap-3 p-4">
          <div className="w-full md:w-6">
            <label className="block text-700 font-medium mb-2">Tipo de importacao</label>
            <Dropdown
              value={tipoImportacao}
              options={TIPOS_IMPORTACAO}
              onChange={(e) => setTipoImportacao(e.value)}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione o tipo"
              className="w-full"
              disabled={loading}
            />
          </div>

          <p className="text-center text-muted max-w-60rem">
            Selecione um arquivo PDF com os dados do pedido. O sistema tentará
            extrair informações como produtos, parcelas e observações.
          </p>

          <FileUpload
            ref={fileUploadRef}
            name="arquivo"
            accept={TIPOS_IMPORTACAO.find((tipo) => tipo.value === tipoImportacao)?.accept || '.pdf'}
            mode="advanced"
            customUpload
            uploadHandler={onUpload}
            auto
            disabled={loading}
            multiple={false}
            maxFileSize={6_000_000}
            chooseOptions={{
              icon: tipoImportacao === 'ADORNOS_XML_NFE' ? 'pi pi-file' : 'pi pi-file-pdf',
              label: tipoImportacao === 'ADORNOS_XML_NFE' ? 'Selecionar XML' : 'Selecionar PDF',
              className: 'p-button-primary',
              'aria-label': 'Selecionar arquivo PDF para importação',
            }}
            itemTemplate={fileTemplate}
          />

          <small className="text-muted text-center">
            Dica: envie arquivos gerados por sistemas compatíveis, com layout
            estruturado. <br />
            Tamanho máximo: 5MB. Apenas arquivos PDF.
          </small>
        </div>
      </Card>

      {/* Dados importados */}
      {dados && (
        <>

          {/* Pedido */}
          <Card title="Dados do Pedido" className="mt-4 p-4">
            <FormularioPedido
              pedido={pedido}
              vendedores={vendedores}
              parceiros={parceiros}
              onChange={onChangePedido}
              entregaPrevistaPreview={entregaPrevistaPreview}
            />
          </Card>

          {/* Cliente */}
          {(pedido?.tipo ?? 'venda') === 'venda' && (
            <Card title="Cliente do Pedido" className="mt-4 p-4">
              <div className="grid align-items-end">
                <div className="col-12 md:col-6">
                  <label className="block text-sm font-medium mb-1">
                    Cliente <span className="p-error">*</span>
                  </label>
                  <Dropdown
                    value={clienteSelecionadoId}
                    options={clientes}
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecione o cliente"
                    className="w-full"
                    filter
                    showClear
                    onChange={(e) => handleSelecionarCliente(e.value)}
                  />
                </div>

                <div className="col-12 md:col-3 flex align-items-end">
                  <Button
                    type="button"
                    label="Novo Cliente"
                    icon="pi pi-user-plus"
                    className="p-button-secondary"
                    onClick={() => setMostrarDialogCliente(true)}
                  />
                </div>

                {cliente && cliente.documento && (
                  <div className="col-12 md:col-3 text-right text-xs text-color-secondary">
                    <div>
                      <strong>Documento:</strong> {cliente.documento}
                    </div>
                    {cliente.email && (
                      <div>
                        <strong>E-mail:</strong> {cliente.email}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Parcelas */}
          {pedido.parcelas?.length > 0 && (
            <Card title="Parcelas" className="mt-4">
              <TabelaParcelas parcelas={pedido.parcelas} />
            </Card>
          )}

          {/* Produtos */}
          <Card title="Produtos" className="mt-4 p-4">
            {/* Barra de ações em lote */}
            <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 mb-3">
              <div className="flex align-items-center gap-2">
                <Checkbox
                  inputId="selecionarTodos"
                  checked={itens.length > 0 && itensSelecionados.length === itens.length}
                  onChange={(e) => selecionarTodos(e.checked)}
                />
                <label htmlFor="selecionarTodos">Selecionar todos</label>
              </div>

              <div className="flex align-items-center gap-2">
                <span className="text-sm">Aplicar depósito em lote:</span>
                <Dropdown
                  value={depositoEmLote}
                  options={depositosDropdownOptions}
                  placeholder="Depósito"
                  className="w-15rem p-inputtext-sm"
                  filter
                  showClear
                  onChange={(e) => setDepositoEmLote(e.value)}
                />
                <Button
                  type="button"
                  label="Aplicar"
                  icon="pi pi-share-alt"
                  className="p-button-sm"
                  onClick={aplicarDepositoLote}
                />
              </div>

              <div className="flex align-items-center gap-2">
                <span className="text-sm">% venda sobre custo:</span>
                <InputNumber
                  value={percentualVenda}
                  onValueChange={(e) => setPercentualVenda(e.value ?? 0)}
                  min={0}
                  max={1000}
                  suffix="%"
                  className="w-10rem p-inputtext-sm"
                />
                <Button
                  type="button"
                  label="Aplicar %"
                  icon="pi pi-percentage"
                  className="p-button-sm p-button-help"
                  onClick={aplicarPercentualVendaTodosItens}
                  disabled={itens.length === 0}
                />
              </div>

              <Button
                type="button"
                icon="pi pi-plus"
                label="Adicionar produto"
                className="p-button-sm p-button-secondary"
                onClick={() => setMostrarAdicionarProduto(true)} // <<< AGORA ABRE O MODAL
              />
            </div>

            {/* Listagem de itens: cadastrados em lista, novos em card */}
            {itens.length === 0 && (
              <p className="text-center text-muted mt-3">
                Nenhum produto encontrado no PDF. Você pode adicionar produtos manualmente.
              </p>
            )}

            {itens.map((item, index) =>
              item.id_variacao ? (
                <ProdutoImportadoListItem
                  key={index}
                  item={item}
                  index={index}
                  depositos={depositos}
                  selecionado={itensSelecionados.includes(index)}
                  onToggleSelecionado={(checked) => toggleSelecionado(index, checked)}
                  onChangeItem={onChangeItem}
                  onRemove={removerItem}
                />
              ) : (
                <ProdutoImportadoCard
                  key={index}
                  item={item}
                  index={index}
                  categorias={categoriasNumericas}
                  depositos={depositos}
                  selecionado={itensSelecionados.includes(index)}
                  onToggleSelecionado={(checked) => toggleSelecionado(index, checked)}
                  onChangeItem={onChangeItem}
                  onRemove={removerItem}
                />
              ),
            )}
          </Card>

          <div className="flex justify-content-end mt-4">
            <Button
              label="Confirmar e Salvar Pedido"
              icon="pi pi-check"
              className="p-button-lg p-button-success px-4"
              onClick={confirmarImportacao}
            />
          </div>
        </>
      )}

      {/* Pedido para fábrica */}
      <PedidoFabricaForm
        visible={abrirPedidoFabrica}
        onHide={resetarFormulario}
        pedidoEditavel={null}
        itensIniciais={itensParaFabrica}
        onSave={async (dados) => {
          const tipo = pedido?.tipo ?? 'venda';

          await apiEstoque.post('/pedidos-fabrica', {
            ...dados,
            itens: dados.itens.map((item, idx) => ({
              ...item,
              // ✅ Venda: se não vier definido, vincula ao pedido importado
              // ✅ Reposição: não força vínculo
              pedido_venda_id: (tipo === 'venda')
                ? (item.pedido_venda_id ?? pedidoSalvoId)
                : (item.pedido_venda_id ?? null),

              observacoes: itensParaFabrica[idx]?.observacoes || item.observacoes || '',
            })),
          });

          toast.current?.show({
            severity: 'success',
            summary: 'Pedido para Fábrica',
            detail: 'Pedido para fábrica gerado com sucesso!',
          });

          resetarFormulario();
        }}
      />

      {/* Modal Novo Cliente */}
      <Dialog
        header="Cadastrar Cliente"
        visible={mostrarDialogCliente}
        onHide={() => setMostrarDialogCliente(false)}
        modal
        className="w-7"
      >
        <ClienteForm
          initialData={{}}
          onSaved={(novoCliente) => {
            setClientes((prev) => Array.isArray(prev) ? [...prev, novoCliente] : [novoCliente]);
            setClienteSelecionadoId(novoCliente.id);
            setCliente(novoCliente);

            toast.current?.show({
              severity: 'success',
              summary: 'Cliente criado',
              detail: 'Novo cliente cadastrado com sucesso.',
              life: 2500,
            });

            setMostrarDialogCliente(false);
          }}
          onCancel={() => setMostrarDialogCliente(false)}
        />
      </Dialog>

      {/* Modal Adicionar Produto (busca + novo produto) */}
      <AdicionarProduto
        visible={mostrarAdicionarProduto}
        onHide={() => setMostrarAdicionarProduto(false)}
        onAdicionarItem={adicionarItemImportado}
        categorias={categoriasNumericas}
      />
    </div>
  );
}
