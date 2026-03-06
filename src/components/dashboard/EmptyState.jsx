import React from 'react';
import { Button } from 'primereact/button';

export default function EmptyState({ title = 'Sem dados no período', description, actionLabel, onAction }) {
  return (
    <div className="surface-card p-4 border-round shadow-1 text-center">
      <div className="text-900 font-semibold text-lg mb-2">{title}</div>
      {description ? <div className="text-700 mb-3">{description}</div> : null}
      {actionLabel ? <Button label={actionLabel} onClick={onAction} /> : null}
    </div>
  );
}
