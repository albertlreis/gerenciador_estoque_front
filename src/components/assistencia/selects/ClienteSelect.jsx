import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

export default function ClienteSelect({
                                        value,                 // pode ser ID (number|string) ou objeto { id, label?... }
                                        onChange,              // deve receber sempre ID (number) ou null
                                        placeholder = "Buscar cliente...",
                                        style
                                      }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null); // objeto { id, label, doc }

  // Carrega um cliente por ID para exibir o rótulo no input
  async function loadById(id) {
    if (id == null) return setSelected(null);
    try {
      const resp = await apiEstoque.get(`/clientes/${id}`);
      const c = resp.data?.data ?? resp.data;
      const opt = c
        ? { id: c.id, label: c.nome || c.fantasia || `Cliente #${c.id}`, doc: c.cpf || c.cnpj || c.documento || '' }
        : { id: Number(id), label: `Cliente #${id}`, doc: '' };
      setSelected(opt);
    } catch {
      setSelected({ id: Number(id), label: `Cliente #${id}`, doc: '' });
    }
  }

  // Sincroniza quando `value` mudar (ID ou objeto)
  useEffect(() => {
    if (!value) {
      setSelected(null);
    } else if (typeof value === 'object' && value.id) {
      const opt = {
        id: value.id,
        label: value.label || value.nome || value.fantasia || `Cliente #${value.id}`,
        doc: value.doc || value.cpf || value.cnpj || value.documento || '',
      };
      setSelected(opt);
    } else {
      loadById(value);
    }
  }, [value]);

  async function search(e) {
    const q = e.query ?? '';
    const { data } = await apiEstoque.get('/clientes', { params: { search: q, per_page: 20, page: 1 } });
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
      forceSelection
      itemTemplate={(op) => (
        <div className="flex flex-column">
          <span className="font-medium">{op.label}</span>
          {op.doc ? <small className="text-500">{op.doc}</small> : null}
        </div>
      )}
      onChange={(e) => {
        // digitando/limpando manualmente
        if (!e.value || typeof e.value === 'string') {
          setSelected(null);
          onChange?.(null);
        } else {
          setSelected(e.value);
        }
      }}
      onSelect={(e) => {            // ao selecionar uma opção
        const opt = e.value || null;
        setSelected(opt);
        onChange?.(opt ? Number(opt.id) : null);
      }}
      onClear={() => { setSelected(null); onChange?.(null); }}
    />
  );
}
