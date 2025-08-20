import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Tag } from 'primereact/tag';
import apiEstoque from '../../../services/apiEstoque';

export default function DefeitoSelect({ value, onChange, placeholder = "Buscar defeito...", style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (typeof value === 'object' && value?.id) setSelected(value); }, [value]);

  async function search(e) {
    const q = e.query ?? '';
    const { data } = await apiEstoque.get('/assistencias/defeitos', { params: { busca: q, per_page: 20, page: 1 }});
    const list = (data?.data ?? data ?? []).map((d) => ({
      id: d.id,
      label: `${d.codigo} — ${d.descricao}`,
      critico: !!d.critico,
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
        <div className="flex align-items-center gap-2">
          <span className="font-medium">{op.label}</span>
          {op.critico ? <Tag value="CRÍTICO" severity="danger" /> : null}
        </div>
      )}
      onChange={(e) => setSelected(e.value)}
      onSelect={(e) => { setSelected(e.value); onChange?.(e.value); }}
    />
  );
}
