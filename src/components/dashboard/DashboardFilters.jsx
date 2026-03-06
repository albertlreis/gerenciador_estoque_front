import React from 'react';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: 'month', label: 'Mês' },
  { value: '6m', label: '6 meses' },
  { value: 'custom', label: 'Personalizado' },
];

export default function DashboardFilters({ filters, onChange, onRefresh, allowCompare = false }) {
  return (
    <div className="surface-card p-3 border-round shadow-1 mb-3">
      <div className="grid">
        <div className="col-12 md:col-3">
          <label className="text-700 text-sm block mb-1">Período</label>
          <select
            className="w-full p-2 border-1 surface-border border-round"
            value={filters.period || 'month'}
            onChange={(event) => onChange({ ...filters, period: event.target.value })}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {filters.period === 'custom' ? (
          <>
            <div className="col-12 md:col-3">
              <label className="text-700 text-sm block mb-1">Início</label>
              <input
                className="w-full p-2 border-1 surface-border border-round"
                type="date"
                value={filters.inicio || ''}
                onChange={(event) => onChange({ ...filters, inicio: event.target.value })}
              />
            </div>
            <div className="col-12 md:col-3">
              <label className="text-700 text-sm block mb-1">Fim</label>
              <input
                className="w-full p-2 border-1 surface-border border-round"
                type="date"
                value={filters.fim || ''}
                onChange={(event) => onChange({ ...filters, fim: event.target.value })}
              />
            </div>
          </>
        ) : null}

        {allowCompare ? (
          <div className="col-12 md:col-2">
            <label className="text-700 text-sm block mb-1">Comparar</label>
            <select
              className="w-full p-2 border-1 surface-border border-round"
              value={String(filters.compare ?? 0)}
              onChange={(event) => onChange({ ...filters, compare: Number(event.target.value) })}
            >
              <option value="0">Não</option>
              <option value="1">Sim</option>
            </select>
          </div>
        ) : null}

        <div className="col-12 md:col-2 flex align-items-end">
          <button className="p-button p-component p-button-sm" onClick={onRefresh} type="button">
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}
