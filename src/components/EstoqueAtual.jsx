import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

const EstoqueAtual = ({ data, loading, total, first, onPage, onEditLocalizacao, verMovimentacoes }) => {
  const [sortField, setSortField] = useState('produto_nome');
  const [sortOrder, setSortOrder] = useState(1);
  const [rows, setRows] = useState(10);

  const quantidadeTemplate = (rowData) => (
    <span className={rowData.quantidade <= 5 ? 'text-red-500 font-bold' : ''}>
      {rowData.quantidade}
    </span>
  );

  const localizacaoTemplate = (rowData) => {
    const loc = rowData.localizacao;
    if (!loc) return '—';

    return (
      <span>
        C:{loc.corredor || '-'} P:{loc.prateleira || '-'} L:{loc.coluna || '-'} N:{loc.nivel || '-'}
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-0 ml-2"
          tooltip="Editar localização"
          onClick={() => onEditLocalizacao(rowData.estoque_id, rowData.localizacao?.id || null)}
        />
      </span>
    );
  };

  const handlePage = (e) => {
    setRows(e.rows);
    onPage({
      ...e,
      sortField,
      sortOrder,
      rows: e.rows
    });
  };

  const handleSort = (e) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
    onPage({
      first,
      rows,
      sortField: e.sortField,
      sortOrder: e.sortOrder
    });
  };

  return (
    <div className="mb-5">
      <h3 className="mb-3">Estoque Atual por Produto e Depósito</h3>

      <Tooltip target="#tooltip-localizacao" content="Corredor, Prateleira, Coluna e Nível" position="top" />

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
      >
        <Column field="produto_nome" header="Produto" sortable />
        <Column field="deposito_nome" header="Depósito" sortable />
        <Column field="quantidade" header="Quantidade" body={quantidadeTemplate} sortable />
        <Column
          header={
            <span>
              Localização{' '}
              <i
                id="tooltip-localizacao"
                className="pi pi-info-circle text-gray-500 ml-1"
                style={{ cursor: 'pointer' }}
              />
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
