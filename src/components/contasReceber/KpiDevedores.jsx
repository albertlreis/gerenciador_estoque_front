import React from "react";
import { Card } from "primereact/card";

export default function KpiDevedores({ kpis }) {
  if (!kpis) return null;
  const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid mb-3">
      <div className="col-12 md:col-3">
        <Card title="Total Clientes Devedores">{kpis.total_clientes}</Card>
      </div>
      <div className="col-12 md:col-3">
        <Card title="Total em Aberto">{fmt(kpis.soma_aberto)}</Card>
      </div>
      <div className="col-12 md:col-3">
        <Card title="Total Vencido">{fmt(kpis.soma_vencido)}</Card>
      </div>
    </div>
  );
}
