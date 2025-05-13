import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';

const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Em andamento', value: 'andamento' },
  { label: 'Concluído', value: 'concluido' },
  { label: 'Cancelado', value: 'cancelado' },
];

const tipoBuscaOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Cliente', value: 'cliente' },
  { label: 'Parceiro', value: 'parceiro' },
  { label: 'Vendedor', value: 'vendedor' },
];

export default function PedidosFiltro({ filtros, setFiltros, onBuscar }) {
  const [expanded, setExpanded] = useState(false);

  const limparFiltros = () => {
    setFiltros({ texto: '', status: null, tipo: 'todos', periodo: null });
  };

  return (
    <Accordion className="w-full mb-3" activeIndex={expanded ? 0 : null} onTabChange={(e) => setExpanded(e.index !== null)}>
      <AccordionTab header="Filtros de Pesquisa">
        <div className="flex flex-wrap md:flex-nowrap gap-2 mb-2 items-end">
          <Calendar
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.value })}
            selectionMode="range"
            placeholder="Período"
            locale="pt-BR"
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full md:w-1/5"
          />
          <Dropdown
            value={filtros.status}
            options={statusOptions}
            onChange={(e) => setFiltros({ ...filtros, status: e.value })}
            placeholder="Status"
            className="w-full md:w-1/5"
          />
          <Dropdown
            value={filtros.tipo}
            options={tipoBuscaOptions}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.value })}
            placeholder="Buscar em"
            className="w-full md:w-1/5"
          />
          <InputText
            value={filtros.texto}
            onChange={(e) => setFiltros({ ...filtros, texto: e.target.value })}
            placeholder="Buscar..."
            className="w-full md:w-2/5"
          />
          <div className="flex gap-2">
            <Button
              label="Buscar"
              icon="pi pi-search"
              className="p-button-primary"
              onClick={onBuscar}
            />
            <Button
              label="Limpar"
              icon="pi pi-filter-slash"
              className="p-button-secondary"
              onClick={limparFiltros}
            />
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  );
}
