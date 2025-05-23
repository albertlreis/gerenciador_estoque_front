import React, { useState, useRef } from 'react';
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
import apiEstoque from '../services/apiEstoque';

const ImportacaoPedidoPDF = () => {
  const [dados, setDados] = useState(null);
  const [cliente, setCliente] = useState({});
  const [pedido, setPedido] = useState({});
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef();

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

  const confirmarImportacao = async () => {
    try {
      await apiEstoque.post('/pedidos/importar-pdf/confirmar', {
        cliente,
        pedido,
        itens: itens.map(item => ({
          ...item,
          descricao: item.descricao,
        })),
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Pedido salvo',
        detail: 'Importação confirmada com sucesso.',
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ProgressSpinner style={{ width: '60px', height: '60px' }} />
        </div>
      )}

      <FileUpload
        name="arquivo"
        accept=".pdf"
        mode="basic"
        customUpload
        uploadHandler={onUpload}
        auto
        chooseLabel="Selecionar PDF"
        disabled={loading}
      />

      {dados && (
        <>
          <Card title="Dados do Cliente" className="mt-4">
            <div className="p-grid p-fluid">
              <div className="p-col-12 p-md-6">
                <label>Nome</label>
                <InputText value={cliente.nome || ''} onChange={(e) => onChangeCliente('nome', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-6">
                <label>Documento</label>
                <InputText value={cliente.documento || ''} onChange={(e) => onChangeCliente('documento', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-6">
                <label>E-mail</label>
                <InputText value={cliente.email || ''} onChange={(e) => onChangeCliente('email', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-6">
                <label>Telefone</label>
                <InputText value={cliente.telefone || ''} onChange={(e) => onChangeCliente('telefone', e.target.value)} />
              </div>
              <div className="p-col-12">
                <label>Endereço</label>
                <InputText value={cliente.endereco || ''} onChange={(e) => onChangeCliente('endereco', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-6">
                <label>Bairro</label>
                <InputText value={cliente.bairro || ''} onChange={(e) => onChangeCliente('bairro', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-6">
                <label>Cidade</label>
                <InputText value={cliente.cidade || ''} onChange={(e) => onChangeCliente('cidade', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-6">
                <label>CEP</label>
                <InputText value={cliente.cep || ''} onChange={(e) => onChangeCliente('cep', e.target.value)} />
              </div>
              <div className="p-col-12">
                <label>Endereço de Entrega</label>
                <InputText value={cliente.endereco_entrega || ''} onChange={(e) => onChangeCliente('endereco_entrega', e.target.value)} />
              </div>
              <div className="p-col-12">
                <label>Prazo de Entrega</label>
                <InputTextarea value={cliente.prazo_entrega || ''} onChange={(e) => onChangeCliente('prazo_entrega', e.target.value)} rows={2} />
              </div>
            </div>
          </Card>

          <Card title="Dados do Pedido" className="mt-4">
            <div className="p-grid p-fluid">
              <div className="p-col-12 p-md-4">
                <label>Número</label>
                <InputText value={pedido.numero || ''} onChange={(e) => onChangePedido('numero', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-4">
                <label>Vendedor</label>
                <InputText value={pedido.vendedor || ''} onChange={(e) => onChangePedido('vendedor', e.target.value)} />
              </div>
              <div className="p-col-12 p-md-4">
                <label>Valor Total</label>
                <InputNumber value={parseFloat(pedido.total || 0)} onValueChange={(e) => onChangePedido('total', e.value)} mode="currency" currency="BRL" />
              </div>
              <div className="p-col-12">
                <label>Observações</label>
                <InputTextarea value={pedido.observacoes || ''} onChange={(e) => onChangePedido('observacoes', e.target.value)} rows={3} />
              </div>
            </div>
          </Card>

          <Card title="Produtos" className="mt-4">
            <DataTable value={itens} editMode="row" dataKey="descricao_original" responsiveLayout="scroll" scrollable scrollHeight="400px">
              <Column field="descricao" header="Descrição Completa" style={{ minWidth: '250px' }} />

              <Column
                header="Cor"
                editor={(options) => {
                  const updated = [...itens];
                  if (!updated[options.rowIndex].atributos) updated[options.rowIndex].atributos = {};
                  return (
                    <InputText
                      value={options.rowData.atributos?.cor || ''}
                      onChange={(e) => {
                        updated[options.rowIndex].atributos.cor = e.target.value;
                        setItens(updated);
                      }}
                    />
                  );
                }}
              />

              <Column
                header="Tecido"
                editor={(options) => {
                  const updated = [...itens];
                  if (!updated[options.rowIndex].atributos) updated[options.rowIndex].atributos = {};
                  return (
                    <InputText
                      value={options.rowData.atributos?.tecido || ''}
                      onChange={(e) => {
                        updated[options.rowIndex].atributos.tecido = e.target.value;
                        setItens(updated);
                      }}
                    />
                  );
                }}
              />

              <Column
                header="Medidas"
                editor={(options) => {
                  const updated = [...itens];
                  if (!updated[options.rowIndex].atributos) updated[options.rowIndex].atributos = {};
                  return (
                    <InputText
                      value={options.rowData.atributos?.medidas || ''}
                      onChange={(e) => {
                        updated[options.rowIndex].atributos.medidas = e.target.value;
                        setItens(updated);
                      }}
                    />
                  );
                }}
              />

              <Column
                header="Pesponto"
                editor={(options) => {
                  const updated = [...itens];
                  if (!updated[options.rowIndex].atributos) updated[options.rowIndex].atributos = {};
                  return (
                    <InputText
                      value={options.rowData.atributos?.pesponto || ''}
                      onChange={(e) => {
                        updated[options.rowIndex].atributos.pesponto = e.target.value;
                        setItens(updated);
                      }}
                    />
                  );
                }}
              />

              {/* Atributos Fixos */}
              <Column
                header="Altura (cm)"
                editor={(options) => {
                  const updated = [...itens];
                  if (!updated[options.rowIndex].fixos) updated[options.rowIndex].fixos = {};
                  return (
                    <InputNumber
                      value={options.rowData.fixos?.altura || null}
                      onValueChange={(e) => {
                        updated[options.rowIndex].fixos.altura = e.value;
                        setItens(updated);
                      }}
                      mode="decimal"
                      minFractionDigits={0}
                    />
                  );
                }}
              />

              <Column
                header="Largura (cm)"
                editor={(options) => {
                  const updated = [...itens];
                  if (!updated[options.rowIndex].fixos) updated[options.rowIndex].fixos = {};
                  return (
                    <InputNumber
                      value={options.rowData.fixos?.largura || null}
                      onValueChange={(e) => {
                        updated[options.rowIndex].fixos.largura = e.value;
                        setItens(updated);
                      }}
                      mode="decimal"
                      minFractionDigits={0}
                    />
                  );
                }}
              />

              <Column
                header="Profundidade (cm)"
                editor={(options) => {
                  const updated = [...itens];
                  if (!updated[options.rowIndex].fixos) updated[options.rowIndex].fixos = {};
                  return (
                    <InputNumber
                      value={options.rowData.fixos?.profundidade || null}
                      onValueChange={(e) => {
                        updated[options.rowIndex].fixos.profundidade = e.value;
                        setItens(updated);
                      }}
                      mode="decimal"
                      minFractionDigits={0}
                    />
                  );
                }}
              />

              {/* Qtd e Valor */}
              <Column field="quantidade" header="Qtd" editor={(options) => editorNumber(options, 'quantidade')} />
              <Column field="valor" header="Valor Unit." editor={(options) => editorNumber(options, 'valor')} />
              <Column
                header="Total"
                body={(row) => (row.quantidade * row.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              />
            </DataTable>

          </Card>

          <Button label="Salvar Pedido" icon="pi pi-check" className="mt-4" onClick={confirmarImportacao} />
        </>
      )}
    </div>
  );
};

export default ImportacaoPedidoPDF;
