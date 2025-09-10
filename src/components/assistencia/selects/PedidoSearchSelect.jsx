import React, { useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

export default function PedidoSearchSelect({ value, onChange, placeholder="Buscar pedido (número ou cliente)..." }) {
  const [suggestions, setSuggestions] = useState([]);

  async function search(e) {
    const q = e.query || '';
    const { data } = await apiEstoque.get('/assistencias/pedidos/busca', { params: { q } });
    const list = data.map(p => ({
      id: p.id,
      label: `#${p.numero_externo} — ${p.cliente?.nome ?? '—'} — ${new Date(p.data_pedido).toLocaleDateString()}`,
      raw: p
    }));
    setSuggestions(list);
  }

  return (
    <AutoComplete
      value={value}
      suggestions={suggestions}
      completeMethod={search}
      field="label"
      placeholder={placeholder}
      dropdown
      onChange={(e) => onChange?.(e.value)}
      onSelect={(e) => onChange?.(e.value)}
    />
  );
}
