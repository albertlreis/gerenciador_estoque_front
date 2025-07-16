import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';

const EstoqueMovimentacoes = ({ data, loading, total, first, onPage }) => {
  const tipoTemplate = (tipo) => (
    <Tag value={tipo} severity={tipo === 'entrada' ? 'success' : 'danger'} />
  );

  const movimentacaoTemplate = (rowData) => {
    const origem = rowData.deposito_origem_nome || '—';
    const destino = rowData.deposito_destino_nome || '—';

    if (rowData.tipo === 'entrada') {
      return <span><i className="pi pi-arrow-down text-success mr-1" /> {destino}</span>;
    }

    if (rowData.tipo === 'saida') {
      return <span><i className="pi pi-arrow-up text-danger mr-1" /> {origem}</span>;
    }

    if (rowData.tipo === 'transferencia') {
      return <span><i className="pi pi-refresh text-primary mr-1" /> {origem} → {destino}</span>;
    }

    return `${origem} → ${destino}`;
  };

  return (
    <div className="mb-6">
      <h3 className="mb-3">Movimentações Recentes</h3>
      <DataTable
        value={data}
        loading={loading}
        paginator
        rows={10}
        first={first}
        totalRecords={total}
        onPage={onPage}
        lazy
        responsiveLayout="scroll"
        emptyMessage="Nenhuma movimentação encontrada"
      >
        <Column field="data_movimentacao" header="Data" />
        <Column field="produto_nome" header="Produto" />
        <Column header="Movimentação" body={movimentacaoTemplate} />
        <Column field="tipo" header="Tipo" body={(row) => tipoTemplate(row.tipo)} />
        <Column field="quantidade" header="Quantidade" />
      </DataTable>
    </div>
  );
};

export default EstoqueMovimentacoes;
