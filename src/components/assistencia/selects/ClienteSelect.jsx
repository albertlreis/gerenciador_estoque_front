import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

export default function ClienteSelect({ value, onChange, placeholder = "Buscar cliente...", style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { if (typeof value === 'object' && value?.id) setSelected(value); }, [value]);

  async function search(e) {
    const q = e.query ?? '';
    const { data } = await apiEstoque.get('/clientes', { params: { search: q, per_page: 20, page: 1 }});
    const list = (data?.data ?? data ?? []).map((c) => ({
      id: c.id,
      label: c.nome || c.fantasia || `Cliente #${c.id}`,
      doc: c.cpf || c.cnpj || c.documento || '',
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
          {op.doc ? <small className="text-500">{op.doc}</small> : null}
        </div>
      )}
      onChange={(e) => setSelected(e.value)}
      onSelect={(e) => { setSelected(e.value); onChange?.(e.value); }}
    />
  );
}
