import React, { useEffect, useRef, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

import apiEstoque from '../services/apiEstoque';
import apiAuth from "../services/apiAuth";

import ProdutoImportadoCard from './importacaoPedido/ProdutoImportadoCard';
import FormularioCliente from './importacaoPedido/FormularioCliente';
import FormularioPedido from './importacaoPedido/FormularioPedido';
import TabelaParcelas from './importacaoPedido/TabelaParcelas';

const ImportacaoPedidoPDF = () => {
  const [dados, setDados] = useState(null);
  const [cliente, setCliente] = useState({});
  const [pedido, setPedido] = useState({});
  const [itens, setItens] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef();
  const fileUploadRef = useRef();

  useEffect(() => {
    apiEstoque.get('/categorias').then(res => setCategorias(res.data)).catch(() => setCategorias([]));
    apiEstoque.get('/depositos').then(res => setDepositos(res.data)).catch(() => setDepositos([]));
    apiEstoque.get('/parceiros').then(res => setParceiros(res.data)).catch(() => setParceiros([]));
    apiAuth.get('/usuarios/vendedores').then(res => setVendedores(res.data)).catch(() => setVendedores([]));
  }, []);

  const onUpload = async ({ files }) => {
    const formData = new FormData();
    formData.append('arquivo', files[0]);

    setLoading(true);
    try {
      const response = await apiEstoque.post('/pedidos/importar-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDados(response.data);
      setCliente(response.data.cliente || {});
      setPedido(response.data.pedido || {});
      setItens(response.data.itens || []);

      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'PDF importado com sucesso.' });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || 'Falha ao importar PDF.'
      });
    } finally {
      setLoading(false);
    }
  };

  const categoriasNumericas = categorias.map((cat) => ({
    ...cat,
    id: Number(cat.id)
  }));

  const onChangeCliente = (field, value) => {
    setCliente(prev => ({ ...prev, [field]: value }));
  };

  const onChangePedido = (field, value) => {
    setPedido(prev => ({ ...prev, [field]: value }));
  };

  const onChangeItem = (index, field, value) => {
    setItens((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], [field]: value };
      return novos;
    });
  };

  const confirmarImportacao = async () => {
    const semCategoria = itens.filter(item => !item.id_categoria);

    if (semCategoria.length > 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Categoria obrigatória',
        detail: `Todos os produtos devem ter uma categoria. Preencha os campos destacados.`,
        life: 4000
      });
      return;
    }

    try {
      await apiEstoque.post('/pedidos/importar-pdf/confirmar', {
        cliente,
        pedido,
        itens: itens.map(item => ({
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
        life: 3000
      });

      setDados(null);
      setCliente({});
      setPedido({});
      setItens([]);
      fileUploadRef.current?.clear();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      const erroNumeroExterno = fieldErrors?.['pedido.numero_externo']?.[0];
      let detalhe = 'Erro ao salvar o pedido.';

      if (erroNumeroExterno?.includes('has already been taken')) {
        detalhe = 'Já existe um pedido com esse número. Verifique se ele já foi importado anteriormente.';
      }

      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: detalhe,
        life: 4000
      });
    }
  };

  return (
    <div className="p-fluid p-4">
      <Toast ref={toast} />

      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProgressSpinner style={{ width: '60px', height: '60px' }} />
        </div>
      )}

      <Card className="mb-4" title="Enviar Arquivo PDF">
        <div className="flex flex-column align-items-center gap-3 p-4">
          <p className="text-center text-muted max-w-60rem">
            Selecione um arquivo PDF com os dados do pedido. O sistema tentará extrair informações como cliente, produtos, parcelas e observações.
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
            maxFileSize={6000000}
            chooseOptions={{
              icon: 'pi pi-file-pdf',
              label: 'Selecionar PDF',
              className: 'p-button-primary',
              'aria-label': 'Selecionar arquivo PDF para importação'
            }}
            uploadLabel="Enviar"
            cancelLabel="Cancelar"
          />
          <small className="text-muted text-center">
            Dica: envie arquivos gerados por sistemas compatíveis, com layout estruturado.<br />
            Tamanho máximo: 5MB. Apenas arquivos PDF.
          </small>
        </div>
      </Card>

      {dados && (
        <>
          <Card title="Dados do Cliente" className="mt-4 p-4">
            <FormularioCliente cliente={cliente} onChange={onChangeCliente} />
          </Card>

          <Card title="Dados do Pedido" className="mt-4 p-4">
            <FormularioPedido pedido={pedido} vendedores={vendedores} parceiros={parceiros} onChange={onChangePedido} />
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
    </div>
  );
};

export default ImportacaoPedidoPDF;
