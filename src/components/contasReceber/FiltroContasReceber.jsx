import React, { useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

export default function FiltroContasReceber({ onBuscar }) {
  const [filtros, setFiltros] = useState({});
  const handleChange = (field, value) => setFiltros((prev) => ({ ...prev, [field]: value }));

  const aplicar = () => {
    const payload = { ...filtros };
    if (payload.periodo) {
      payload.data_inicio = payload.periodo[0]?.toISOString().split("T")[0];
      payload.data_fim = payload.periodo[1]?.toISOString().split("T")[0];
    }
    delete payload.periodo;
    onBuscar(payload);
  };

  return (
    <div className="card mb-3">
      <div className="p-fluid grid formgrid">
        <div className="field col-12 md:col-3">
          <InputText
            value={filtros.cliente || ""}
            onChange={(e) => handleChange("cliente", e.target.value)}
            placeholder="Cliente"
          />
        </div>
        <div className="field col-12 md:col-2">
          <Dropdown
            value={filtros.status || ""}
            options={[
              { label: "Todos", value: "" },
              { label: "Aberto", value: "ABERTO" },
              { label: "Parcial", value: "PARCIAL" },
              { label: "Pago", value: "PAGO" },
              { label: "Cancelado", value: "CANCELADO" },
            ]}
            onChange={(e) => handleChange("status", e.value)}
            placeholder="Status"
          />
        </div>
        <div className="field col-12 md:col-3">
          <Calendar
            value={filtros.periodo || null}
            onChange={(e) => handleChange("periodo", e.value)}
            selectionMode="range"
            dateFormat="dd/mm/yy"
            placeholder="Período"
          />
        </div>
        <div className="field col-12 md:col-2 flex align-items-center">
          <Button label="Filtrar" icon="pi pi-search" onClick={aplicar} className="p-button-sm" />
        </div>
      </div>
    </div>
  );
}
