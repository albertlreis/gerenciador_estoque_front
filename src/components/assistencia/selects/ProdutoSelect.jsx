import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

export default function ProdutoSelect({ value, onChange, placeholder = "Buscar produto...", style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (typeof value === 'object' && value?.id) setSelected(value); }, [value]);

  async function search(e) {
    const q = e.query ?? '';
    const { data } = await apiEstoque.get('/produtos', { params: { search: q, per_page: 20, page: 1 }});
    const list = (data?.data ?? data ?? []).map((p) => ({
      id: p.id,
      label: p.nome || p.titulo || `Produto #${p.id}`,
      sku: p.sku || p.codigo || '',
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
          {op.sku ? <small className="text-500">{op.sku}</small> : null}
        </div>
      )}
      onChange={(e) => setSelected(e.value)}
      onSelect={(e) => { setSelected(e.value); onChange?.(e.value); }}
    />
  );
}
