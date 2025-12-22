import React from 'react';
import { Button } from 'primereact/button';

export function RelatoriosHeader({ tipo, setTipo, tiposRelatorio }) {
  return (
    <div className="flex gap-2 flex-wrap mb-3" role="tablist" aria-label="Tipo de Relatório">
      {tiposRelatorio.map((op) => (
        <Button
          key={op.value}
          label={op.label}
          icon={op.icon}
          className={`p-button-rounded ${tipo === op.value ? 'p-button-primary' : 'p-button-text'}`}
          onClick={() => setTipo(op.value)}
          aria-pressed={tipo === op.value}
        />
      ))}
      <span
        className="help-tip pi pi-info-circle text-500 ml-2"
        data-pr-tooltip="Escolha o tipo para exibir os filtros específicos."
      />
    </div>
  );
}
