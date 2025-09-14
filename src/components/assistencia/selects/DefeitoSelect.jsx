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
    let list = (data?.data ?? data ?? []).map((d) => ({
      id: d.id,
      label: d.descricao,
      critico: !!d.critico,
      isNew: false,
    }));
    if (q && !list.length) {
      list = [{ id: null, label: `+ Cadastrar novo defeito: "${q}"`, isNew: true, raw: { descricao: q } }];
    }
    setSuggestions(list);
  }

  async function handleSelect(op) {
    if (op?.isNew) {
      const descricao = op.raw.descricao;
      const resp = await apiEstoque.post('/assistencias/defeitos', { descricao }); // ajuste schema conforme seu back
      const novo = resp.data?.data || resp.data;
      const v = { id: novo.id, label: `${novo.codigo} — ${novo.descricao}`, critico: !!novo.critico };
      setSelected(v);
      onChange?.(v);
    } else {
      setSelected(op);
      onChange?.(op);
    }
  }

  return (
    <div className="flex gap-2 items-center" style={style}>
      <AutoComplete
        value={selected}
        suggestions={suggestions}
        completeMethod={search}
        field="label"
        placeholder={placeholder}
        dropdown
        itemTemplate={(op) => (
          <div className="flex align-items-center gap-2">
            <span className="font-medium">{op.label}</span>
            {op.critico ? <Tag value="CRÍTICO" severity="danger" /> : null}
          </div>
        )}
        onChange={(e) => setSelected(e.value)}
        onSelect={(e) => handleSelect(e.value)}
      />
    </div>
  );
}
