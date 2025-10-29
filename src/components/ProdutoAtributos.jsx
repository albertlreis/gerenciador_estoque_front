import React, { useMemo, useRef, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import apiEstoque from '../services/apiEstoque';

export default function ProdutoAtributos({ atributos = [], onChange, onAdd, onRemove }) {
  const [sugNomes, setSugNomes] = useState({});
  const [sugValores, setSugValores] = useState({});
  const timers = useRef({}); // debounce por chave

  const debounce = (key, fn, delay = 250) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(fn, delay);
  };

  const buscarNomes = (query, idx) => {
    debounce(`nomes-${idx}`, async () => {
      try {
        const { data } = await apiEstoque.get('/atributos/sugestoes', { params: { q: query } });
        setSugNomes((prev) => ({ ...prev, [idx]: data || [] }));
      } catch {
        setSugNomes((prev) => ({ ...prev, [idx]: [] }));
      }
    });
  };

  const buscarValores = (query, idx) => {
    const attr = (atributos[idx]?.atributo || '').trim() || '';
    if (!attr) {
      setSugValores((prev) => ({ ...prev, [idx]: [] }));
      return;
    }
    debounce(`val-${idx}`, async () => {
      try {
        const { data } = await apiEstoque.get(`/atributos/${encodeURIComponent(attr)}/valores`, {
          params: { q: query },
        });
        setSugValores((prev) => ({ ...prev, [idx]: data || [] }));
      } catch {
        setSugValores((prev) => ({ ...prev, [idx]: [] }));
      }
    });
  };

  const linhas = useMemo(() => atributos, [atributos]);

  return (
    <div className="mt-3">
      <div className="flex align-items-center justify-content-between mb-2">
        <h6 className="m-0">Atributos</h6>
      </div>

      {linhas.length === 0 && <div className="text-500 text-sm">Nenhum atributo adicionado.</div>}

      {linhas.map((attr, idx) => (
        <div key={idx} className="formgrid grid mb-2 align-items-end">
          <div className="field col-12 md:col-5">
            <label>Nome do atributo</label>
            <AutoComplete
              value={attr.atributo || ''}
              suggestions={sugNomes[idx] || []}
              completeMethod={(e) => buscarNomes(e.query, idx)}
              onChange={(e) => onChange(idx, 'atributo', (e.value || '').toString())}
              placeholder="Ex.: cor, tamanho, acabamento"
              dropdown
            />
          </div>

          <div className="field col-12 md:col-5">
            <label>Valor</label>
            <AutoComplete
              value={attr.valor || ''}
              suggestions={sugValores[idx] || []}
              completeMethod={(e) => buscarValores(e.query, idx)}
              onChange={(e) => onChange(idx, 'valor', (e.value || '').toString())}
              placeholder="Ex.: Vermelho, M, Polido"
              dropdown
            />
          </div>

          <div className="field col-12 md:col-2 flex align-items-end justify-content-end">
            <Button
              type="button"
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => onRemove(idx)}
              aria-label="Remover atributo"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        icon="pi pi-plus"
        label="Adicionar atributo"
        className="p-button-sm mt-2"
        aria-label="Adicionar novo atributo"
        onClick={onAdd}
      />
    </div>
  );
}
