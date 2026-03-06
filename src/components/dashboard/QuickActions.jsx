import React from 'react';
import { Button } from 'primereact/button';

export default function QuickActions({ actions = [] }) {
  return (
    <div className="surface-card p-3 border-round shadow-1">
      <div className="text-900 font-semibold mb-3">Ações rápidas</div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            label={action.label}
            icon={action.icon}
            className="p-button-sm"
            onClick={action.onClick}
            outlined={!action.primary}
          />
        ))}
      </div>
    </div>
  );
}
