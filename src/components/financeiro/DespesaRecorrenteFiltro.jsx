import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

const statusOpts = [
  { label: 'Todos', value: null },
  { label: 'Ativa', value: 'ATIVA' },
  { label: 'Pausada', value: 'PAUSADA' },
  { label: 'Cancelada', value: 'CANCELADA' },
];

const tipoOpts = [
  { label: 'Todos', value: null },
  { label: 'Fixa', value: 'FIXA' },
  { label: 'Variável', value: 'VARIAVEL' },
];

const freqOpts = [
  { label: 'Todas', value: null },
  { label: 'Diária', value: 'DIARIA' },
  { label: 'Semanal', value: 'SEMANAL' },
  { label: 'Mensal', value: 'MENSAL' },
  { label: 'Anual', value: 'ANUAL' },
  { label: 'Personalizada', value: 'PERSONALIZADA' },
];

export default function DespesaRecorrenteFiltro({ filtros, setFiltros, onBuscar }) {
  return (
    <div className="flex flex-wrap gap-2 align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={filtros.q}
          onChange={(e) => setFiltros((s) => ({ ...s, q: e.target.value }))}
          placeholder="Buscar descrição, categoria, centro custo..."
        />
      </span>

      <Dropdown
        value={filtros.status}
        options={statusOpts}
        onChange={(e) => setFiltros((s) => ({ ...s, status: e.value }))}
        placeholder="Status"
        showClear
        className="w-14rem"
      />

      <Dropdown
        value={filtros.tipo}
        options={tipoOpts}
        onChange={(e) => setFiltros((s) => ({ ...s, tipo: e.value }))}
        placeholder="Tipo"
        showClear
        className="w-14rem"
      />

      <Dropdown
        value={filtros.frequencia}
        options={freqOpts}
        onChange={(e) => setFiltros((s) => ({ ...s, frequencia: e.value }))}
        placeholder="Frequência"
        showClear
        className="w-16rem"
      />

      <Button
        icon="pi pi-filter"
        label="Buscar"
        onClick={() => onBuscar({ ...filtros })}
      />
    </div>
  );
}
