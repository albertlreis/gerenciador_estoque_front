import React, { useEffect, useRef, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

import apiEstoque from '../services/apiEstoque';
import apiAuth from '../services/apiAuth';

import ProdutoImportadoCard from './importacaoPedido/ProdutoImportadoCard';
import FormularioCliente from './importacaoPedido/FormularioCliente';
import FormularioPedido from './importacaoPedido/FormularioPedido';
import TabelaParcelas from './importacaoPedido/TabelaParcelas';
import PedidoFabricaForm from './PedidoFabricaForm';

/**
 * Componente responsável pela importação de pedidos via PDF.
 * Realiza upload, parsing e persistência com integração à API Laravel.
 */
export default function ImportacaoPedidoPDF() {
  const [dados, setDados] = useState(null);
  const [cliente, setCliente] = useState({});
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
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  /** 🔄 Carrega listas iniciais */
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [cat, dep, par, ven] = await Promise.all([
          apiEstoque.get('/categorias'),
          apiEstoque.get('/depositos'),
          apiEstoque.get('/parceiros'),
          apiAuth.get('/usuarios/vendedores'),
        ]);

        setCategorias(Array.isArray(cat.data) ? cat.data : []);
        setDepositos(Array.isArray(dep.data) ? dep.data : []);
        setParceiros(Array.isArray(par.data) ? par.data : []);
        setVendedores(Array.isArray(ven.data) ? ven.data : []);
      } catch (err) {
        console.warn('Falha ao carregar listas iniciais', err);
        setCategorias([]);
        setDepositos([]);
        setParceiros([]);
        setVendedores([]);
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
      const response = await apiEstoque.post('/pedidos/importar-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Confere se retorno é JSON válido
      if (typeof response.data !== 'object' || !response.data) {
        throw new Error('Resposta inesperada da API.');
      }

      setDados(response.data);
      setCliente(response.data.cliente || {});
      setPedido(response.data.pedido || {});
      setItens(response.data.itens || []);
      setUploadStatus('done');

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'PDF importado com sucesso.',
      });
    } catch (err) {
      console.error('Erro no upload do PDF:', err);
      setUploadStatus('error');
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || 'Falha ao importar PDF.',
      });
    } finally {
      setLoading(false);
    }
  };

  const categoriasNumericas = Array.isArray(categorias)
    ? categorias.map((cat) => ({ ...cat, id: Number(cat.id) }))
    : [];

  /** 🧍‍♂️ Atualizações de estado */
  const onChangeCliente = (field, value) =>
    setCliente((prev) => ({ ...prev, [field]: value }));

  const onChangePedido = (field, value) =>
    setPedido((prev) => ({ ...prev, [field]: value }));

  const onChangeItem = (index, field, value) => {
    setItens((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], [field]: value };
      return novos;
    });
  };

  /** 🧹 Limpeza e reimportação */
  const resetarFormulario = () => {
    fileUploadRef.current?.clear();
    setUploadStatus(null);
    setDados(null);
    setCliente({});
    setPedido({});
    setItens([]);
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
            (v) => v.referencia === item.ref && v.nome_produto === item.nome
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
        <small className="text-muted">{(file.size / 1024).toFixed(1)} KB</small>
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
            extrair informações como cliente, produtos, parcelas e observações.
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
          <Card title="Dados do Cliente" className="mt-4 p-4">
            <FormularioCliente cliente={cliente} onChange={onChangeCliente} />
          </Card>

          <Card title="Dados do Pedido" className="mt-4 p-4">
            <FormularioPedido
              pedido={pedido}
              vendedores={vendedores}
              parceiros={parceiros}
              onChange={onChangePedido}
            />
          </Card>

          {pedido.parcelas?.length > 0 && (
            <Card title="Parcelas" className="mt-4">
              <TabelaParcelas parcelas={pedido.parcelas} />
            </Card>
          )}

          <Card title="Produtos" className="mt-4 p-4">
            {itens.map((item, index) => (
              <ProdutoImportadoCard
                key={index}
                item={item}
                index={index}
                categorias={categoriasNumericas}
                depositos={depositos}
                parceiros={parceiros}
                vendedores={vendedores}
                onChangeItem={onChangeItem}
              />
            ))}
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
    </div>
  );
}
