import React, { useState } from 'react';
import CalendarBR from './CalendarBR';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { OPCOES_STATUS } from '../constants/statusPedido';

export default function PedidosFiltro({ filtros, setFiltros, onBuscar }) {
  const [expanded, setExpanded] = useState(true);

  // Status ordenados alfabeticamente
  const statusOrdenados = [
    { label: 'Todos', value: null },
    ...OPCOES_STATUS.sort((a, b) => a.label.localeCompare(b.label))
  ];

  const limparFiltros = () => {
    const base = { ...filtros, texto: '', status: null, periodo: null };
    setFiltros(base);
    onBuscar(base);
  };

  return (
    <Accordion className="w-full mb-3" activeIndex={expanded ? 0 : null} onTabChange={(e) => setExpanded(e.index !== null)}>
      <AccordionTab header="Filtros de Pesquisa">
        <div className="flex flex-wrap md:flex-nowrap gap-3 mb-3 items-end">

          <div className="flex flex-column w-full md:w-1/4">
            <label htmlFor="filtro-periodo" className="mb-1">Período</label>
            <CalendarBR
              id="filtro-periodo"
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.value })}
              selectionMode="range"
              placeholder="Selecione um intervalo"
            />
          </div>

          <div className="flex flex-column w-full md:w-1/4">
            <label htmlFor="filtro-status" className="mb-1">Status do Pedido</label>
            <Dropdown
              id="filtro-status"
              value={filtros.status}
              options={statusOrdenados}
              onChange={(e) => setFiltros({ ...filtros, status: e.value })}
              placeholder="Selecione o status"
              filter
              filterBy="label"
              showClear
            />
          </div>

          <div className="flex flex-column w-full md:w-2/4">
            <label htmlFor="filtro-texto" className="mb-1">Busca por cliente, parceiro, vendedor ou nº do pedido</label>
            <InputText
              id="filtro-texto"
              value={filtros.texto}
              onChange={(e) => setFiltros({ ...filtros, texto: e.target.value })}
              placeholder="Ex: João Silva, Pedido 1234..."
            />
          </div>

          <div className="flex gap-2 mt-3 md:mt-auto">
            <Button
              label="Buscar"
              icon="pi pi-search"
              className="p-button-primary"
              onClick={() => onBuscar()}
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
