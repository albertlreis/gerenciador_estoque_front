import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import apiFinanceiro from '../../services/apiFinanceiro';
import { useFinanceiroCatalogos } from '../../hooks/useFinanceiroCatalogos';

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
  const { loadCategorias } = useFinanceiroCatalogos();
  const [categoriaOpts, setCategoriaOpts] = useState([]);
  const [centroCustoOpts, setCentroCustoOpts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await loadCategorias({ tipo: 'despesa', ativo: true });
        setCategoriaOpts(cats || []);
      } catch {
        setCategoriaOpts([]);
      }

      try {
        const res = await apiFinanceiro.get('/financeiro/centros-custo', { params: { ativo: true } });
        const list = res?.data?.data || [];
        setCentroCustoOpts(list.map((c) => ({ label: c.nome, value: c.id, raw: c })));
      } catch {
        setCentroCustoOpts([]);
      }
    })();
    // eslint-disable-next-line
  }, []);

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

      <Dropdown
        value={filtros.categoria_id || null}
        options={categoriaOpts}
        onChange={(e) => setFiltros((s) => ({ ...s, categoria_id: e.value }))}
        placeholder="Categoria"
        showClear
        filter
        className="w-16rem"
      />

      <Dropdown
        value={filtros.centro_custo_id || null}
        options={centroCustoOpts}
        onChange={(e) => setFiltros((s) => ({ ...s, centro_custo_id: e.value }))}
        placeholder="Centro de custo"
        showClear
        filter
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
