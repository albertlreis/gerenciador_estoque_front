import React from 'react';
import { Card } from 'primereact/card';

const formatNumber = (value) => {
  if (typeof value !== 'number') return value ?? 0;
  return value.toLocaleString('pt-BR');
};

export default function KpiCard({ title, kpi, currency = false, onClick }) {
  const value = Number(kpi?.value ?? 0);
  const previous = kpi?.previous;

  const formattedValue = currency
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : formatNumber(value);

  const formattedPrevious = typeof previous === 'number'
    ? (currency
      ? previous.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : formatNumber(previous))
    : null;

  return (
    <Card className="shadow-1" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="text-700 text-sm mb-2">{title}</div>
      <div className="text-900 text-2xl font-bold">{formattedValue}</div>
      {formattedPrevious !== null ? (
        <div className="text-600 text-sm mt-2">
          <span>Anterior: {formattedPrevious}</span>
          <span className="ml-3">Δ {formatNumber(Number(kpi?.delta_abs ?? 0))}</span>
          {kpi?.delta_pct !== null && kpi?.delta_pct !== undefined ? (
            <span className="ml-2">({formatNumber(Number(kpi.delta_pct))}%)</span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
