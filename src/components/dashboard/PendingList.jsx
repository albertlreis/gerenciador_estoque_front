import React from 'react';
import { Card } from 'primereact/card';

export default function PendingList({ title, items = [], renderItem }) {
  return (
    <Card className="shadow-1">
      <div className="text-900 font-semibold mb-3">{title}</div>
      {items.length === 0 ? (
        <div className="text-600 text-sm">Sem itens para este filtro.</div>
      ) : (
        <ul className="m-0 p-0" style={{ listStyle: 'none' }}>
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="py-2 border-bottom-1 surface-border text-sm">
              {renderItem ? renderItem(item) : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
