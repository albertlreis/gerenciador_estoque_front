import React from 'react';
import { Card } from 'primereact/card';

export default function PendingCard({ title, value, onClick }) {
  return (
    <Card className="shadow-1" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="text-700 text-sm mb-2">{title}</div>
      <div className="text-900 text-xl font-semibold">{Number(value || 0).toLocaleString('pt-BR')}</div>
    </Card>
  );
}
