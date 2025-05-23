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
              {[
                ['nome', 'Nome'], ['documento', 'Documento'], ['email', 'E-mail'], ['telefone', 'Telefone'],
                ['endereco', 'Endereço'], ['bairro', 'Bairro'], ['cidade', 'Cidade'], ['cep', 'CEP'],
                ['endereco_entrega', 'Endereço de Entrega']
              ].map(([field, label]) => (
                <div className={`p-col-12 ${field === 'endereco' || field === 'endereco_entrega' ? '' : 'p-md-6'}`} key={field}>
                  <label>{label}</label>
                  <InputText value={cliente[field] || ''} onChange={(e) => onChangeCliente(field, e.target.value)} />
                </div>
              ))}
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
                <InputNumber value={pedido.total || 0} mode="currency" currency="BRL" locale="pt-BR" disabled />
              </div>
              <div className="p-col-12">
                <label>Observações</label>
                <InputTextarea value={pedido.observacoes || ''} onChange={(e) => onChangePedido('observacoes', e.target.value)} rows={3} />
              </div>
            </div>
          </Card>

          {pedido.parcelas?.length > 0 && (
            <Card title="Parcelas" className="mt-4">
              <DataTable value={pedido.parcelas}>
                <Column field="descricao" header="Descrição" />
                <Column field="vencimento" header="Vencimento" />
                <Column field="forma" header="Forma de Pagamento" />
                <Column
                  field="valor"
                  header="Valor"
                  body={(row) =>
                    Number(row.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  }
                />
              </DataTable>
            </Card>
          )}

          <Card title="Produtos" className="mt-4">
            <DataTable value={itens} editMode="row" dataKey="descricao" responsiveLayout="scroll" scrollable scrollHeight="400px">
              <Column field="descricao" header="Descrição Completa" style={{ minWidth: '250px' }} />

              {/** Dicionário de rótulos para cabeçalhos legíveis */}
              {(() => {
                const atributoLabels = {
                  cores: { cor: 'Cor', cor_do_ferro: 'Cor do Ferro', cor_inox: 'Cor Inox' },
                  tecidos: { tecido: 'Tecido', tec: 'Tec' },
                  acabamentos: { pesp: 'Pesponto', marmore: 'Mármore' },
                  observacoes: { observacao: 'Observação', observacao_extra: 'Observação Extra' },
                };

                return Object.entries(itens[0]?.atributos || {}).flatMap(([grupo, campos]) =>
                  Object.keys(campos || {}).map((campo) => (
                    <Column
                      key={`${grupo}_${campo}`}
                      header={atributoLabels?.[grupo]?.[campo] ?? `${grupo} - ${campo}`}
                      editor={(options) => {
                        const updated = [...itens];
                        if (!updated[options.rowIndex].atributos[grupo]) {
                          updated[options.rowIndex].atributos[grupo] = {};
                        }
                        return (
                          <InputText
                            value={options.rowData.atributos[grupo]?.[campo] || ''}
                            onChange={(e) => {
                              updated[options.rowIndex].atributos[grupo][campo] = e.target.value;
                              setItens(updated);
                            }}
                          />
                        );
                      }}
                      body={(row) => row.atributos?.[grupo]?.[campo] || '-'}
                    />
                  ))
                );
              })()}

              {/** Campos fixos (medidas) com body e editor */}
              {['largura', 'profundidade', 'altura'].map((chave) => (
                <Column
                  key={chave}
                  header={chave.charAt(0).toUpperCase() + chave.slice(1)}
                  body={(row) => row.fixos?.[chave] ?? '-'}
                  editor={(options) => {
                    const updated = [...itens];
                    if (!updated[options.rowIndex].fixos) updated[options.rowIndex].fixos = {};
                    return (
                      <InputNumber
                        value={options.rowData.fixos?.[chave] || null}
                        onValueChange={(e) => {
                          updated[options.rowIndex].fixos[chave] = e.value;
                          setItens(updated);
                        }}
                        mode="decimal"
                        minFractionDigits={0}
                      />
                    );
                  }}
                />
              ))}

              <Column field="quantidade" header="Qtd" editor={(options) => (
                <InputNumber
                  value={options.rowData.quantidade}
                  onValueChange={(e) => onChangeItem(options.rowIndex, 'quantidade', e.value)}
                  mode="decimal"
                  minFractionDigits={0}
                />
              )} />

              <Column field="valor" header="Valor Unit." editor={(options) => (
                <InputNumber
                  value={options.rowData.valor}
                  onValueChange={(e) => onChangeItem(options.rowIndex, 'valor', e.value)}
                  mode="currency"
                  currency="BRL"
                />
              )} />

              <Column
                header="Total"
                body={(row) => (row.quantidade * row.valor).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
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
