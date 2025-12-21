import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

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
                      }) => {
  const [sortField, setSortField] = useState('produto_nome');
  const [sortOrder, setSortOrder] = useState(1);
  const [rows, setRows] = useState(10);

  const quantidadeTemplate = (rowData) => (
    <span className={rowData.quantidade <= 5 ? 'text-red-500 font-bold' : ''}>
      {rowData.quantidade}
    </span>
  );

  const depositoTemplate = (rowData) => {
    const isZero = Number(rowData?.quantidade ?? 0) === 0;
    if (isZero) return <span className="text-500">—</span>;
    return rowData.deposito_nome ?? '—';
  };

  const localizacaoTemplate = (rowData) => {
    const loc = rowData.localizacao;
    const isZero = Number(rowData?.quantidade ?? 0) === 0;

    if (!loc) {
      if (isZero) {
        return <span className="text-500">—</span>;
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
    const display = codigo ?? area ?? '—';

    return (
      <span className="inline-flex items-center whitespace-nowrap max-w-full" style={{ overflow: 'hidden' }}>
        <span className="truncate">{display}</span>
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-0 ml-2 flex-shrink-0"
          tooltip="Editar localização"
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
      <h3 className="m-0">Estoque Atual por Produto e Depósito</h3>

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
        content="Setor, Coluna e Nível. Áreas e dimensões são gerenciáveis."
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

        <Column field="produto_referencia" header="Referência" sortable />

        <Column field="deposito_nome" header="Depósito" body={depositoTemplate} sortable />

        <Column field="quantidade" header="Quantidade" body={quantidadeTemplate} sortable />
        <Column
          header={
            <span>
              Localização{' '}
              <i id="tooltip-localizacao" className="pi pi-info-circle text-gray-500 ml-1" style={{ cursor: 'pointer' }} />
            </span>
          }
          body={localizacaoTemplate}
        />
        <Column
          header="Ações"
          body={(rowData) => (
            <Button
              icon="pi pi-eye"
              tooltip="Ver movimentações"
              className="p-button-sm"
              onClick={() => verMovimentacoes(rowData)}
            />
          )}
        />
      </DataTable>
    </div>
  );
};

export default EstoqueAtual;
