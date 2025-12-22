import React from 'react';
import { Dropdown } from 'primereact/dropdown';

const ClienteTipoSelect = ({ tipoSelecionado, tipoOptions, onChange, error }) => {
  return (
    <div className="p-fluid">
      <div className="flex align-items-center justify-content-between mb-3">
        <div>
          <h3 className="m-0">Cliente</h3>
          <small className="text-600">Escolha o tipo para continuar</small>
        </div>
      </div>

      <div className="field">
        <label htmlFor="tipo">Tipo de Cliente</label>
        <Dropdown
          id="tipo"
          value={tipoSelecionado}
          options={tipoOptions}
          onChange={(e) => onChange?.(e.value)}
          placeholder="Selecione o tipo"
          className={error ? 'p-invalid' : ''}
        />
        {!!error && <small className="p-error">{error}</small>}
      </div>
    </div>
  );
};

export default ClienteTipoSelect;
