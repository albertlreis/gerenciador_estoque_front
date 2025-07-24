import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

const EstoqueAtual = ({ data, loading, total, first, onPage, onEditLocalizacao, verMovimentacoes }) => {
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

  return (
    <div className="mb-5">
      <h3 className="mb-3">Estoque Atual por Produto e Depósito</h3>

      {/* Tooltip para a coluna de localização */}
      <Tooltip target="#tooltip-localizacao" content="Corredor, Prateleira, Coluna e Nível" position="top" />

      <DataTable
        value={data}
        loading={loading}
        paginator
        first={first}
        rows={10}
        totalRecords={total}
        onPage={onPage}
        lazy
        responsiveLayout="scroll"
        emptyMessage="Nenhum item em estoque"
        sortField="produto_nome"
        sortOrder={1}
      >
        <Column field="produto_nome" header="Produto" />
        <Column field="deposito_nome" header="Depósito" />
        <Column field="quantidade" header="Quantidade" body={quantidadeTemplate} />
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
