import React, { useEffect } from 'react';
import { MultiSelect } from 'primereact/multiselect';

const ColumnSelector = ({
                          columns = [],
                          value,
                          onChange,
                          storageKey = 'colunasVisiveis',
                        }) => {
  const colunaOptionTemplate = (option) => (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-table" />
      <span>{option.header}</span>
    </div>
  );

  // Persistência
  useEffect(() => {
    if (value && Array.isArray(value)) {
      const campos = value.map((col) => col.field);
      localStorage.setItem(storageKey, JSON.stringify(campos));
    }
  }, [value, storageKey]);

  return (
    <div className="p-3 border-1 surface-border surface-card border-round mb-3">
      <div className="flex align-items-center gap-2 mb-2">
        <i className="pi pi-sliders-h text-primary" />
        <span className="font-medium">Exibir colunas:</span>
      </div>
      <MultiSelect
        value={value}
        options={columns}
        optionLabel="header"
        onChange={(e) => onChange(e.value)}
        placeholder="Selecionar colunas"
        display="chip"
        className="w-full sm:w-30rem"
        maxSelectedLabels={3}
        filter
        panelClassName="p-2"
        optionTemplate={colunaOptionTemplate}
        selectedItemsLabel="{0} colunas selecionadas"
      />
    </div>
  );
};

export default ColumnSelector;
