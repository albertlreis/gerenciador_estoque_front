import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import apiEstoque from '../../../services/apiEstoque';

export default function AssistenciaSelect({ value, onChange, placeholder = "Selecione a assistência...", style }) {
  const [opts, setOpts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await apiEstoque.get('/assistencias/autorizadas', { params: { per_page: 100 }});
      const list = (data?.data ?? data ?? []).map((a) => ({ id: a.id, label: a.nome }));
      setOpts(list);
    })();
  }, []);

  useEffect(() => { if (typeof value === 'object' && value?.id) setSelected(value); }, [value]);

  return (
    <Dropdown
      value={selected}
      options={opts}
      optionLabel="label"
      placeholder={placeholder}
      style={style}
      filter
      showClear
      onChange={(e) => { setSelected(e.value || null); onChange?.(e.value || null); }}
      itemTemplate={(op) => <span>{op.label}</span>}
    />
  );
}
