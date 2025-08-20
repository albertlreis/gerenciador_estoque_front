import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

export default function VariacaoSelect({ produto, value, onChange, placeholder = "Buscar variação...", style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (typeof value === 'object' && value?.id) setSelected(value); }, [value]);

  async function search(e) {
    if (!produto?.id) { setSuggestions([]); return; }
    const q = e.query ?? '';
    const { data } = await apiEstoque.get(`/produtos/${produto.id}/variacoes`, { params: { search: q, per_page: 20, page: 1 }});
    const list = (data?.data ?? data ?? []).map((v) => ({
      id: v.id,
      label: v.nome || v.titulo || v.referencia || v.sku || `Variação #${v.id}`,
      sku: v.sku || v.referencia || '',
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
      disabled={!produto?.id}
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
