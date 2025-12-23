import React from "react";
import { Card } from "primereact/card";

export default function KpiContasReceber({ kpis }) {
  if (!kpis) return null;
  const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <div className="grid mb-3">
      <div className="col-12 md:col-3"><Card title="Total a Receber">{fmt(kpis.total_liquido)}</Card></div>
      <div className="col-12 md:col-3"><Card title="Total Recebido">{fmt(kpis.total_recebido)}</Card></div>
      <div className="col-12 md:col-3"><Card title="Em Aberto">{fmt(kpis.total_aberto)}</Card></div>
      <div className="col-12 md:col-3"><Card title="Vencido">{fmt(kpis.total_vencido)}</Card></div>
    </div>
  );
}
