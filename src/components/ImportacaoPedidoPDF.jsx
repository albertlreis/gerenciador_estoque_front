import React, {useState, useRef, useEffect} from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import apiEstoque from '../services/apiEstoque';
import ProdutoImportadoCard from "./ProdutoImportadoCard";

const ImportacaoPedidoPDF = () => {
  const [dados, setDados] = useState(null);
  const [cliente, setCliente] = useState({});
  const [pedido, setPedido] = useState({});
  const [itens, setItens] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef();

  useEffect(() => {
    apiEstoque.get('/categorias')
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
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

  const onChangeCliente = (field, value) => {
    setCliente(prev => ({ ...prev, [field]: value }));
  };

  const onChangePedido = (field, value) => {
    setPedido(prev => ({ ...prev, [field]: value }));
  };

  const onChangeItem = (index, field, value) => {
    const updated = [...itens];
    updated[index][field] = value;
    setItens(updated);
  };

  const editorNumber = (options, field) => (
    <InputNumber
      value={options.rowData[field]}
      onValueChange={(e) => onChangeItem(options.rowIndex, field, e.value)}
      mode="decimal"
      minFractionDigits={2}
    />
  );

  const editorText = (options, field) => (
    <InputText
      value={options.rowData[field]}
      onChange={(e) => onChangeItem(options.rowIndex, field, e.target.value)}
    />
  );

  const onRowEditComplete = (e) => {
    const { newData, index } = e;
    const updated = [...itens];
    updated[index] = newData;
    setItens(updated);
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
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || 'Erro ao salvar o pedido.',
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
            Dica: envie arquivos gerados por sistemas compatíveis, com layout estruturado.<br/>
            Tamanho máximo: 5MB. Apenas arquivos PDF.
          </small>
        </div>
      </Card>

      {dados && (
        <>
          <Card title="Dados do Cliente" className="mt-4 p-4">
            <div className="formgrid grid p-fluid">
              <div className="field col-12 md:col-6">
                <label htmlFor="nome" className="block text-sm font-semibold mb-1">Nome</label>
                <InputText
                  id="nome"
                  value={cliente.nome || ''}
                  onChange={(e) => onChangeCliente('nome', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="documento" className="block text-sm font-semibold mb-1">Documento</label>
                <InputText
                  id="documento"
                  value={cliente.documento || ''}
                  onChange={(e) => onChangeCliente('documento', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="CPF ou CNPJ"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="email" className="block text-sm font-semibold mb-1">E-mail</label>
                <InputText
                  id="email"
                  value={cliente.email || ''}
                  onChange={(e) => onChangeCliente('email', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label htmlFor="telefone" className="block text-sm font-semibold mb-1">Telefone</label>
                <InputText
                  id="telefone"
                  value={cliente.telefone || ''}
                  onChange={(e) => onChangeCliente('telefone', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="(99) 99999-9999"
                />
              </div>

              <div className="field col-12">
                <label htmlFor="endereco" className="block text-sm font-semibold mb-1">Endereço</label>
                <InputText
                  id="endereco"
                  value={cliente.endereco || ''}
                  onChange={(e) => onChangeCliente('endereco', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="field col-12 md:col-3">
                <label htmlFor="bairro" className="block text-sm font-semibold mb-1">Bairro</label>
                <InputText
                  id="bairro"
                  value={cliente.bairro || ''}
                  onChange={(e) => onChangeCliente('bairro', e.target.value)}
                  className="p-inputtext-sm"
                />
              </div>

              <div className="field col-12 md:col-3">
                <label htmlFor="cidade" className="block text-sm font-semibold mb-1">Cidade</label>
                <InputText
                  id="cidade"
                  value={cliente.cidade || ''}
                  onChange={(e) => onChangeCliente('cidade', e.target.value)}
                  className="p-inputtext-sm"
                />
              </div>

              <div className="field col-12 md:col-3">
                <label htmlFor="cep" className="block text-sm font-semibold mb-1">CEP</label>
                <InputText
                  id="cep"
                  value={cliente.cep || ''}
                  onChange={(e) => onChangeCliente('cep', e.target.value)}
                  className="p-inputtext-sm"
                />
              </div>

              <div className="field col-12">
                <label htmlFor="endereco_entrega" className="block text-sm font-semibold mb-1">Endereço de
                  Entrega</label>
                <InputText
                  id="endereco_entrega"
                  value={cliente.endereco_entrega || ''}
                  onChange={(e) => onChangeCliente('endereco_entrega', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="Caso diferente do endereço principal"
                />
              </div>

              <div className="field col-12">
                <label htmlFor="prazo_entrega" className="block text-sm font-semibold mb-1">Prazo de Entrega</label>
                <InputTextarea
                  id="prazo_entrega"
                  value={cliente.prazo_entrega || ''}
                  onChange={(e) => onChangeCliente('prazo_entrega', e.target.value)}
                  rows={3}
                  className="p-inputtextarea-sm"
                  placeholder="Ex: 15 dias úteis após confirmação"
                />
              </div>
            </div>
          </Card>

          <Card title="Dados do Pedido" className="mt-4 p-4">
            <div className="formgrid grid p-fluid">
              <div className="field col-12 md:col-4">
                <label htmlFor="numero" className="block text-sm font-semibold mb-1">Número</label>
                <InputText
                  id="numero"
                  value={pedido.numero || ''}
                  onChange={(e) => onChangePedido('numero', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="Número do pedido"
                />
              </div>

              <div className="field col-12 md:col-4">
                <label htmlFor="vendedor" className="block text-sm font-semibold mb-1">Vendedor</label>
                <InputText
                  id="vendedor"
                  value={pedido.vendedor || ''}
                  onChange={(e) => onChangePedido('vendedor', e.target.value)}
                  className="p-inputtext-sm"
                  placeholder="Nome do vendedor"
                />
              </div>

              <div className="field col-12 md:col-4">
                <label htmlFor="total" className="block text-sm font-semibold mb-1">Valor Total</label>
                <InputNumber
                  id="total"
                  value={pedido.total || 0}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  disabled
                  className="p-inputtext-sm w-full"
                />
              </div>

              <div className="field col-12">
                <label htmlFor="observacoes" className="block text-sm font-semibold mb-1">Observações</label>
                <InputTextarea
                  id="observacoes"
                  value={pedido.observacoes || ''}
                  onChange={(e) => onChangePedido('observacoes', e.target.value)}
                  rows={3}
                  className="p-inputtextarea-sm"
                  placeholder="Observações adicionais sobre o pedido"
                />
              </div>
            </div>
          </Card>

          {pedido.parcelas?.length > 0 && (
            <Card title="Parcelas" className="mt-4">
              <DataTable value={pedido.parcelas}>
                <Column field="descricao" header="Descrição"/>
                <Column field="vencimento" header="Vencimento"/>
                <Column field="forma" header="Forma de Pagamento"/>
                <Column
                  field="valor"
                  header="Valor"
                  body={(row) =>
                    Number(row.valor || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
                  }
                />
              </DataTable>
            </Card>
          )}

          <Card title="Produtos" className="mt-4 p-4">
            {['PEDIDO', 'PRONTA ENTREGA'].map((tipo) => {
              const itensTipo = itens.filter((item) => item.tipo === tipo);
              if (itensTipo.length === 0) return null;

              return (
                <div key={tipo} className="mb-5">
                  <h3 className="text-xl font-bold mb-3 text-primary">{tipo}</h3>
                  {itensTipo.map((item, index) => (
                    <ProdutoImportadoCard
                      key={index}
                      item={item}
                      index={index}
                      categorias={categorias}
                      onChangeItem={onChangeItem}
                    />
                  ))}
                </div>
              );
            })}
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
