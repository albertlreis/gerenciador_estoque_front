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

import apiEstoque from '../services/apiEstoque';
import apiAuth from '../services/apiAuth';

import ProdutoImportadoCard from './importacaoPedido/ProdutoImportadoCard';
import ProdutoImportadoListItem from './importacaoPedido/ProdutoImportadoListItem';
import FormularioPedido from './importacaoPedido/FormularioPedido';
import TabelaParcelas from './importacaoPedido/TabelaParcelas';
import PedidoFabricaForm from './PedidoFabricaForm';
import ClienteForm from './ClienteForm';
import AdicionarProduto from './produto/AdicionarProduto'; // <<< NOVO

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
      const valAtual = Number(mapa[ref].valor || 0);
      const valNovo = Number(item.valor || 0);

      mapa[ref].quantidade = qtdAtual + qtdNova;
      mapa[ref].valor = valAtual + valNovo;
    }
  });

  return Object.values(mapa);
}

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
  const [categorias, setCategorias] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const [abrirPedidoFabrica, setAbrirPedidoFabrica] = useState(false);
  const [itensParaFabrica, setItensParaFabrica] = useState([]);
  const [pedidoSalvoId, setPedidoSalvoId] = useState(null);

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
          apiAuth.get('/usuarios/vendedores'),
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

    const formData = new FormData();
    formData.append('arquivo', files[0]);

    setLoading(true);
    setUploadStatus('uploading');

    try {
      const response = await apiEstoque.post('/pedidos/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = response.data?.dados;
      if (!payload) throw new Error('Resposta inesperada da API');

      // ================================
      // 📌 PEDIDO
      // ================================
      const p = payload.pedido || {};

      const pedidoNormalizado = {
        numero_externo: p.numero_externo || '',
        data_pedido: p.data_pedido || null,
        data_inclusao: p.data_inclusao || null,
        data_entrega: p.data_entrega || null,
        total: Number(p.total) || 0,
        observacoes: p.observacoes || '',
        parcelas: p.parcelas || [],
      };

      // ================================
      // 📌 ITENS (normaliza + mescla refs iguais)
      // ================================
      const itensNormalizadosBase = (payload.itens || []).map((item) => ({
        ref: item.ref || item.codigo || '',
        nome: item.nome || item.descricao || '',
        nome_completo: item.nome_completo || '',
        quantidade: Number(item.quantidade ?? 0),
        valor: Number(item.valor_total ?? item.valor ?? 0),
        preco_unitario: Number(item.preco_unitario ?? 0),
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
      // ✔️ Atribuir ao estado
      // ================================
      setDados(payload);
      setCliente({});
      setClienteSelecionadoId(null);
      setPedido(pedidoNormalizado);
      setItens(itensNormalizados);
      setItensSelecionados([]);
      setUploadStatus('done');

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
    setPedido((prev) => ({ ...prev, [field]: value }));

  /** Atualizações de item */
  const onChangeItem = (index, field, value) => {
    setItens((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], [field]: value };
      return novos;
    });
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
    console.log(index)
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
  const confirmarImportacao = async () => {
    if (!clienteSelecionadoId || !cliente?.nome) {
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

    try {
      const response = await apiEstoque.post('/pedidos/importar-pdf/confirmar', {
        cliente,
        pedido,
        itens: itens.map((item) => ({
          ...item,
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

      // Monta pedido para fábrica
      const fabrica = itens
        .filter((i) => i.enviar_fabrica)
        .map((item) => {
          const encontrado = variacoesConfirmadas.find(
            (v) => v.referencia === item.ref && v.nome_produto === item.nome,
          );
          return {
            produto_variacao_id: encontrado?.id_variacao,
            produto_variacao_nome: encontrado?.nome_completo || '',
            quantidade: item.quantidade,
            deposito_id: item.id_deposito ?? null,
            pedido_venda_id: pedidoId,
            pedido_venda_label: pedido.numero_externo
              ? `Pedido #${pedido.numero_externo}`
              : `Pedido #${pedidoId}`,
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
          <p className="text-center text-muted max-w-60rem">
            Selecione um arquivo PDF com os dados do pedido. O sistema tentará
            extrair informações como produtos, parcelas e observações.
          </p>

          <FileUpload
            ref={fileUploadRef}
            name="arquivo"
            accept=".pdf"
            mode="advanced"
            customUpload
            uploadHandler={onUpload}
            auto
            disabled={loading}
            multiple={false}
            maxFileSize={6_000_000}
            chooseOptions={{
              icon: 'pi pi-file-pdf',
              label: 'Selecionar PDF',
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
          {/* Cliente */}
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

          {/* Pedido */}
          <Card title="Dados do Pedido" className="mt-4 p-4">
            <FormularioPedido
              pedido={pedido}
              vendedores={vendedores}
              parceiros={parceiros}
              onChange={onChangePedido}
            />
          </Card>

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
          await apiEstoque.post('/pedidos-fabrica', {
            ...dados,
            itens: dados.itens.map((item, idx) => ({
              ...item,
              pedido_venda_id: pedidoSalvoId,
              observacoes: itensParaFabrica[idx]?.observacoes || '',
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
          onSubmit={async (clienteData) => {
            try {
              const { data: novoCliente } = await apiEstoque.post(
                '/clientes',
                clienteData,
              );
              setClientes((prev) =>
                Array.isArray(prev) ? [...prev, novoCliente] : [novoCliente],
              );
              setClienteSelecionadoId(novoCliente.id);
              setCliente(novoCliente);

              toast.current?.show({
                severity: 'success',
                summary: 'Cliente criado',
                detail: 'Novo cliente cadastrado com sucesso.',
                life: 2500,
              });

              setMostrarDialogCliente(false);
              return novoCliente;
            } catch (error) {
              // ClienteForm já trata fieldErrors via extractApiError
              throw error;
            }
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
