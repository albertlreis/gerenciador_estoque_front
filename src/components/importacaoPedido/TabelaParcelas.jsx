import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function TabelaParcelas({ parcelas }) {
  return (
    <DataTable value={parcelas}>
      <Column field="parcela" header="Parcela" />
      <Column field="vencimento" header="Vencimento" />
      <Column field="forma_pagamento" header="Forma de Pagamento" />
      <Column
        field="valor"
        header="Valor"
        body={(row) =>
          Number(row.valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        }
      />
    </DataTable>
  );
}
