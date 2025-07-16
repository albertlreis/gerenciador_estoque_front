import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const EstoqueFiltro = ({ filtros, setFiltros, depositos, tipos, onBuscar, onLimpar }) => {
  return (
    <div className="surface-card border-round shadow-1 p-4 mb-4">
      <div className="grid formgrid">
        <div className="col-12 md:col-3">
          <Dropdown
            value={filtros.tipo}
            options={tipos}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.value })}
            placeholder="Filtrar por tipo"
            showClear
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-3">
          <Dropdown
            value={filtros.deposito}
            options={depositos}
            onChange={(e) => setFiltros({ ...filtros, deposito: e.value })}
            placeholder="Filtrar por depósito"
            showClear
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-3">
          <InputText
            value={filtros.produto}
            onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
            placeholder="Buscar produto"
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-3">
          <Calendar
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.value })}
            selectionMode="range"
            placeholder="Filtrar por período"
            showIcon
            readOnlyInput
            className="w-full"
          />
        </div>
        <div className="col-12 flex justify-end gap-2 mt-3">
          <Button label="Filtrar" icon="pi pi-search" onClick={onBuscar} />
          <Button label="Limpar" icon="pi pi-times" className="p-button-secondary" onClick={onLimpar} />
        </div>
      </div>
    </div>
  );
};

export default EstoqueFiltro;
