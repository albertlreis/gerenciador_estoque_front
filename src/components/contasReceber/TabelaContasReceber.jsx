import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";

export default function TabelaContasReceber({ contas, loading, onBaixar }) {
  const valorFmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "-";
  const statusTemplate = (row) => {
    const color = { ABERTO: "danger", PARCIAL: "warning", PAGO: "success" }[row.status] || "info";
    return <Tag value={row.status} severity={color} />;
  };
  const botoes = (row) => (
    <Button icon="pi pi-wallet" className="p-button-text p-button-sm" tooltip="Baixar Pagamento" onClick={() => onBaixar(row)} />
  );

  return (
    <div className="card">
      <DataTable value={contas} paginator rows={10} loading={loading} dataKey="id" emptyMessage="Nenhuma conta encontrada.">
        <Column field="id" header="#" style={{ width: "4rem" }} />
        <Column field="pedido.numero" header="Pedido" body={(r) => r?.pedido?.numero || '-'} />
        <Column field="pedido.cliente" header="Cliente" body={(r) => r?.pedido?.cliente || '-'} />
        <Column field="descricao" header="Descrição" />
        <Column field="data_vencimento" header="Vencimento" />
        <Column field="valor_liquido" header="Valor Líquido" body={(r) => valorFmt(r.valor_liquido)} />
        <Column field="saldo_aberto" header="Saldo" body={(r) => valorFmt(r.saldo_aberto)} />
        <Column field="status" header="Status" body={statusTemplate} />
        <Column header="Ações" body={botoes} style={{ textAlign: "center", width: "8rem" }} />
      </DataTable>
    </div>
  );
}
