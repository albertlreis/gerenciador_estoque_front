import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import apiEstoque from '../../../services/apiEstoque';

export default function AssistenciaSelect({
                                            value,                 // pode ser ID (number|string) ou objeto { id, label }
                                            onChange,              // deve receber sempre ID (number) ou null
                                            placeholder = "Selecione a assistência...",
                                            style
                                          }) {
  const [opts, setOpts] = useState([]);
  const [val, setVal] = useState(null); // ID

  useEffect(() => {
    (async () => {
      const { data } = await apiEstoque.get('/assistencias/autorizadas', { params: { per_page: 100 } });
      const list = (data?.data ?? data ?? []).map((a) => ({ id: a.id, label: a.nome }));
      setOpts(list);
    })();
  }, []);

  // Aceita objeto ou ID como value
  useEffect(() => {
    if (!value) setVal(null);
    else if (typeof value === 'object' && value.id != null) setVal(Number(value.id));
    else setVal(Number(value));
  }, [value]);

  return (
    <Dropdown
      value={val}                 // ID
      options={opts}
      optionLabel="label"
      optionValue="id"            // usa o ID como valor primitivo
      placeholder={placeholder}
      style={style}
      filter
      showClear
      onChange={(e) => {
        const id = e.value == null ? null : Number(e.value);
        setVal(id);
        onChange?.(id);
      }}
      itemTemplate={(op) => <span>{op.label}</span>}
    />
  );
}
