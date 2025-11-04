import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

export default function TabelaDevedores({ dados, loading, onSelecionarCliente }) {
  const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const vencidoTag = (v) =>
    v > 0 ? <Tag value={fmt(v)} severity="danger" /> : <Tag value={fmt(v)} severity="success" />;

  return (
    <div className="card">
      <DataTable
        value={dados}
        paginator
        rows={10}
        loading={loading}
        dataKey="id_cliente"
        emptyMessage="Nenhum cliente devedor encontrado."
        onRowClick={(e) => onSelecionarCliente(e.data)}
      >
        <Column field="cliente_nome" header="Cliente" />
        <Column field="qtd_titulos" header="Títulos" />
        <Column field="total_liquido" header="Total Líquido" body={(r) => fmt(r.total_liquido)} />
        <Column field="total_recebido" header="Recebido" body={(r) => fmt(r.total_recebido)} />
        <Column field="total_aberto" header="Aberto" body={(r) => fmt(r.total_aberto)} />
        <Column field="total_vencido" header="Vencido" body={(r) => vencidoTag(r.total_vencido)} />
        <Column field="ultimo_vencimento" header="Último Vencimento" />
      </DataTable>
    </div>
  );
}
