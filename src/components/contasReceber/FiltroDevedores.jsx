import React, { useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";

export default function FiltroDevedores({ onBuscar }) {
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
          <Calendar
            value={filtros.periodo || null}
            onChange={(e) => handleChange("periodo", e.value)}
            selectionMode="range"
            dateFormat="dd/mm/yy"
            placeholder="Período de Vencimento"
          />
        </div>
        <div className="field col-12 md:col-2">
          <InputNumber
            value={filtros.valor_min || ""}
            onValueChange={(e) => handleChange("valor_min", e.value)}
            placeholder="Valor Mínimo"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
        </div>
        <div className="field col-12 md:col-2">
          <InputNumber
            value={filtros.valor_max || ""}
            onValueChange={(e) => handleChange("valor_max", e.value)}
            placeholder="Valor Máximo"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
        </div>
        <div className="field col-12 md:col-2 flex align-items-center">
          <Button label="Filtrar" icon="pi pi-search" onClick={aplicar} className="p-button-sm" />
        </div>
      </div>
    </div>
  );
}
