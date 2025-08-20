import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

export default function DepositoSelect({ value, onChange, placeholder = "Buscar depósito...", style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (typeof value === 'object' && value?.id) setSelected(value); }, [value]);

  async function search(e) {
    const q = e.query ?? '';
    const { data } = await apiEstoque.get('/depositos', { params: { search: q, per_page: 20, page: 1 }});
    const list = (data?.data ?? data ?? []).map((d) => ({
      id: d.id,
      label: d.nome || `Depósito #${d.id}`,
      sigla: d.sigla || '',
    }));
    setSuggestions(list);
  }

  return (
    <AutoComplete
      value={selected}
      suggestions={suggestions}
      completeMethod={search}
      field="label"
      placeholder={placeholder}
      style={style}
      dropdown
      itemTemplate={(op) => (
        <div className="flex flex-column">
          <span className="font-medium">{op.label}</span>
          {op.sigla ? <small className="text-500">{op.sigla}</small> : null}
        </div>
      )}
      onChange={(e) => setSelected(e.value)}
      onSelect={(e) => { setSelected(e.value); onChange?.(e.value); }}
    />
  );
}
