import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

const TRAILER_DASH = '\u2014';

const EstoqueAtual = ({
  data,
  loading,
  total,
  first,
  onPage,
  onEditLocalizacao,
  verMovimentacoes,
  onExportPdf,
  loadingExportPdf,
  onCadastrarOutlet,
  podeCadastrarOutlet,
}) => {
  const [sortField, setSortField] = useState('produto_nome');
  const [sortOrder, setSortOrder] = useState(1);
  const [rows, setRows] = useState(10);

  const quantidadeTemplate = (rowData) => (
    <span className={rowData.quantidade <= 5 ? 'text-red-500 font-bold' : ''}>
      {rowData.quantidade}
    </span>
  );

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || valor === '') return TRAILER_DASH;
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return TRAILER_DASH;
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (valor) => {
    if (!valor) return TRAILER_DASH;
    const date = new Date(valor);
    if (Number.isNaN(date.getTime())) return TRAILER_DASH;
    return date.toLocaleDateString('pt-BR');
  };

  const depositoTemplate = (rowData) => {
    const isZero = Number(rowData?.quantidade ?? 0) === 0;
    if (isZero) return <span className="text-500">{TRAILER_DASH}</span>;
    return rowData.deposito_nome ?? TRAILER_DASH;
  };

  const localizacaoTemplate = (rowData) => {
    const loc = rowData.localizacao;
    const isZero = Number(rowData?.quantidade ?? 0) === 0;

    if (!loc) {
      if (isZero) {
        return <span className="text-500">{TRAILER_DASH}</span>;
      }

      return (
        <Button
          icon="pi pi-plus"
          label="Definir"
          className="p-button-text p-0"
          onClick={() => onEditLocalizacao(rowData.estoque_id, null)}
        />
      );
    }

    const codigo = loc.codigo_composto && loc.codigo_composto.trim() !== '' ? loc.codigo_composto : null;
    const area = loc.area?.nome || null;
    const display = codigo ?? area ?? TRAILER_DASH;

    return (
      <span className="inline-flex items-center whitespace-nowrap max-w-full" style={{ overflow: 'hidden' }}>
        <span className="truncate">{display}</span>
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-0 ml-2 flex-shrink-0"
          tooltip="Editar localizacao"
          onClick={() => onEditLocalizacao(rowData.estoque_id, rowData.localizacao?.id || null)}
        />
      </span>
    );
  };

  const handlePage = (e) => {
    setRows(e.rows);
    onPage({ ...e, sortField, sortOrder, rows: e.rows });
  };

  const handleSort = (e) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
    onPage({ first, rows, sortField: e.sortField, sortOrder: e.sortOrder });
  };

  return (
    <div className="justify-between items-center mb-4 gap-2">
      <h3 className="m-0">Estoque Atual por Produto e Deposito</h3>

      <Button
        icon="pi pi-file-pdf"
        label={loadingExportPdf ? 'Gerando PDF...' : 'Exportar PDF'}
        className="p-button-sm p-button-danger ml-auto m-2"
        style={{ minWidth: 160 }}
        onClick={onExportPdf}
        loading={loadingExportPdf}
        disabled={loadingExportPdf}
      />

      <Tooltip
        target="#tooltip-localizacao"
        content="Setor, Coluna e Nivel. Areas e dimensoes sao gerenciaveis."
        position="top"
      />

      <DataTable
        value={data}
        loading={loading}
        paginator
        first={first}
        rows={rows}
        rowsPerPageOptions={[10, 20, 50]}
        totalRecords={total}
        onPage={handlePage}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
        lazy
        responsiveLayout="scroll"
        emptyMessage="Nenhum item em estoque"
        style={{ fontSize: '0.8em' }}
      >
        <Column field="produto_nome" header="Produto" sortable />
        <Column field="produto_referencia" header="Referencia" sortable />
        <Column field="deposito_nome" header="Deposito" body={depositoTemplate} sortable />
        <Column field="quantidade" header="Quantidade" body={quantidadeTemplate} sortable />
        <Column
          field="custo_unitario"
          header="Custo"
          body={(rowData) => formatarMoeda(rowData.custo_unitario)}
          sortable
        />
        <Column
          field="data_entrada_estoque_atual"
          header="Data de entrada"
          body={(rowData) => formatarData(rowData.data_entrada_estoque_atual)}
          sortable
        />
        <Column
          field="ultima_venda_em"
          header="Ultima venda"
          body={(rowData) => formatarData(rowData.ultima_venda_em)}
          sortable
        />
        <Column
          field="dias_sem_venda"
          header="Dias sem venda"
          body={(rowData) =>
            rowData.dias_sem_venda === null || rowData.dias_sem_venda === undefined
              ? TRAILER_DASH
              : Number(rowData.dias_sem_venda)
          }
          sortable
        />
        <Column
          header={(
            <span>
              Localizacao{' '}
              <i
                id="tooltip-localizacao"
                className="pi pi-info-circle text-gray-500 ml-1"
                style={{ cursor: 'pointer' }}
              />
            </span>
          )}
          body={localizacaoTemplate}
        />
        <Column
          header="Acoes"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-eye"
                tooltip="Ver movimentacoes"
                className="p-button-sm"
                onClick={() => verMovimentacoes(rowData)}
              />
              <Button
                icon="pi pi-tag"
                tooltip="Cadastrar em Outlet"
                className="p-button-sm p-button-warning"
                onClick={() => onCadastrarOutlet && onCadastrarOutlet(rowData)}
                disabled={!podeCadastrarOutlet || !rowData?.variacao_id}
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
};

export default EstoqueAtual;
