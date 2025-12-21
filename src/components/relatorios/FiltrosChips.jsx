import React from 'react';
import { Chip } from 'primereact/chip';

export function FiltrosChips({ filtrosAtivos }) {
  if (!filtrosAtivos?.length) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {filtrosAtivos.map((t, i) => (
        <Chip key={i} label={t} className="bg-primary-50 text-primary-800 border-1 border-primary-100" />
      ))}
    </div>
  );
}
