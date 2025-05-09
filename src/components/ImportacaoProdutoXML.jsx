import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiEstoque from '../services/apiEstoque';

const ImportacaoProdutoXML = () => {
  const [nota, setNota] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [variacoes, setVariacoes] = useState([]);
  const [depositoSelecionado, setDepositoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useRef();

  useEffect(() => {
    apiEstoque.get('/depositos').then(res => setDepositos(res.data));
    apiEstoque.get('/variacoes').then(res => setVariacoes(res.data));
    apiEstoque.get('/categorias').then(res => setCategorias(res.data));
  }, []);

  const onUpload = async ({ files }) => {
    const formData = new FormData();
    formData.append('arquivo', files[0]);

    setLoading(true);
    try {
      const response = await apiEstoque.post('/produtos/importar-xml', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNota(response.data.nota);
      setProdutos(response.data.produtos);
      toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'XML importado com sucesso.' });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || 'Falha ao importar XML.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value, rowIndex, field) => {
    const updated = [...produtos];
    updated[rowIndex][field] = value;
    setProdutos(updated);
  };

  const handleSelecionaVariacao = (rowIndex, variacaoId) => {
    const updated = [...produtos];
    updated[rowIndex].variacao_id_manual = variacaoId;
    setProdutos(updated);
  };

  const removerProduto = (produto) => {
    setProdutos(prev => prev.filter((p) => p.descricao_xml !== produto.descricao_xml));
  };

  const removerTemplate = (rowData) => (
    <Button
      icon="pi pi-trash"
      className="p-button-danger p-button-text"
      onClick={() => removerProduto(rowData)}
      tooltip="Remover produto"
    />
  );

  const confirmarSalvarImportacao = () => {
    const produtosInvalidos = produtos.filter(p => {
      const semVinculo = !p.variacao_id && !p.variacao_id_manual;
      return semVinculo && !p.id_categoria;
    });

    if (produtosInvalidos.length > 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Todos os produtos novos devem ter uma categoria selecionada.'
      });
      return;
    }

    setShowConfirm(true);
  };

  const confirmarImportacao = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await apiEstoque.post('/produtos/importar-xml/confirmar', {
        nota,
        produtos,
        deposito_id: depositoSelecionado?.id,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Salvo',
        detail: 'Importação confirmada com sucesso.'
      });

      setProdutos([]);
      setNota(null);
      setDepositoSelecionado(null);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || 'Erro ao salvar os produtos.'
      });
    } finally {
      setLoading(false);
    }
  };

  const editorInput = (options, field) => (
    <InputText value={options.rowData[field]} onChange={(e) => handleInputChange(e.target.value, options.rowIndex, field)} />
  );

  const editorNumber = (options, field) => (
    <InputNumber value={options.rowData[field]} onValueChange={(e) => handleInputChange(e.value, options.rowIndex, field)} mode="decimal" minFractionDigits={2} />
  );

  return (
    <div className="p-fluid p-4">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        message="Deseja realmente salvar esses produtos no sistema e registrar a entrada no estoque?"
        header="Confirmar Importação"
        icon="pi pi-question-circle"
        accept={confirmarImportacao}
        reject={() => setShowConfirm(false)}
        acceptLabel="Sim"
        rejectLabel="Cancelar"
      />

      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ProgressSpinner style={{ width: '60px', height: '60px' }} />
        </div>
      )}

      <h2>Importar Produtos via XML da NF-e</h2>
      <FileUpload
        name="arquivo"
        accept=".xml"
        mode="basic"
        customUpload
        uploadHandler={onUpload}
        auto
        chooseLabel="Selecionar XML"
        disabled={loading}
      />

      {produtos.length > 0 && (
        <>
          <h3 className="mt-4">Selecione o depósito de destino</h3>
          <Dropdown
            value={depositoSelecionado}
            options={depositos}
            optionLabel="nome"
            placeholder="Escolha o depósito"
            className="mb-4"
            onChange={(e) => setDepositoSelecionado(e.value)}
            disabled={loading}
          />

          <h3>Produtos extraídos</h3>
          <DataTable
            value={produtos}
            editMode="row"
            dataKey="descricao_xml"
            responsiveLayout="scroll"
            rowClassName={(row) => (!row.variacao_id && !row.variacao_id_manual ? 'bg-yellow-50' : '')}
          >
            <Column field="ncm" header="Código NCM" style={{ width: '10%' }} />
            <Column field="descricao_xml" header="Descrição XML" />
            <Column
              header="Categoria"
              body={(rowData, { rowIndex }) => {
                if (rowData.variacao_id || rowData.variacao_id_manual) return <span>-</span>;

                return (
                  <Dropdown
                    value={rowData.id_categoria}
                    options={categorias}
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecionar"
                    onChange={(e) => handleInputChange(e.value, rowIndex, 'id_categoria')}
                    style={{ width: '100%' }}
                  />
                );
              }}
              style={{ width: '20%' }}
            />
            <Column
              header="Variação vinculada"
              body={(rowData, { rowIndex }) =>
                rowData.variacao_id ? (
                  <span>{rowData.variacao_nome}</span>
                ) : (
                  <Dropdown
                    value={rowData.variacao_id_manual}
                    options={variacoes}
                    optionLabel="nome_completo"
                    optionValue="id"
                    placeholder="Selecionar variação"
                    onChange={(e) => handleSelecionaVariacao(rowIndex, e.value)}
                    style={{ width: '100%' }}
                  />
                )
              }
            />
            <Column
              header="Status"
              body={(row) =>
                row.variacao_id || row.variacao_id_manual ? (
                  <span className="p-tag p-tag-success">Vinculado</span>
                ) : (
                  <span className="p-tag p-tag-warning">Novo produto</span>
                )
              }
              style={{ width: '10%' }}
            />
            <Column field="quantidade" header="Qtd" editor={(options) => editorNumber(options, 'quantidade')} style={{ width: '10%' }} />
            <Column field="preco_unitario" header="Preço Unit." editor={(options) => editorNumber(options, 'preco_unitario')} style={{ width: '15%' }} />
            <Column field="valor_total" header="Total" body={(row) => (row.quantidade * row.preco_unitario).toFixed(2)} style={{ width: '15%' }} />
            <Column body={removerTemplate} header="Ações" style={{ width: '8%' }} />
          </DataTable>

          <Button
            label={`Confirmar Importação (${produtos.filter(p => !p.variacao_id && !p.variacao_id_manual).length} novos)`}
            className="mt-4"
            icon="pi pi-save"
            onClick={confirmarSalvarImportacao}
            disabled={!depositoSelecionado || loading}
          />
        </>
      )}
    </div>
  );
};

export default ImportacaoProdutoXML;
