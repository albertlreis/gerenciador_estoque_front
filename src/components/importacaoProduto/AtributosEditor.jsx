import React, { useRef, useState, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import apiEstoque from '../../services/apiEstoque';

/**
 * Editor de atributos otimizado:
 * - Busca nomes e valores com debounce e cache
 * - Evita flood de requisições
 * - Adição imediata com feedback visual
 * - Lista atualiza em tempo real (sem precisar fechar o modal)
 */
export default function AtributosEditor({ value = [], onChange, toast }) {
  const [localValue, setLocalValue] = useState(value);
  const [novo, setNovo] = useState({ atributo: '', valor: '' });

  const [sugNomes, setSugNomes] = useState({});
  const [sugValores, setSugValores] = useState({});
  const cacheNomes = useRef({});
  const cacheValores = useRef({});
  const timers = useRef({});

  /** 🔄 Sincroniza quando o valor vindo do pai muda */
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /** Normaliza strings */
  const normalizar = texto =>
    (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  /** Debounce genérico */
  const debounce = (key, fn, delay = 400) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(fn, delay);
  };

  /** Atualiza atributo existente */
  const update = (idx, field, val) => {
    const nova = [...localValue];
    nova[idx][field] = val;
    setLocalValue(nova);
    onChange(nova);
  };

  /** Remove atributo */
  const remove = idx => {
    const nova = [...localValue];
    nova.splice(idx, 1);
    setLocalValue(nova);
    onChange(nova);
  };

  /** Adiciona novo atributo com validações e feedback */
  const add = () => {
    const nome = normalizar(novo.atributo);
    const valor = novo.valor.trim();

    if (!nome || !valor) {
      toast?.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Informe nome e valor do atributo antes de adicionar.',
      });
      return;
    }

    // Evita duplicados
    const duplicado = localValue.some(
      a => normalizar(a.atributo) === nome && a.valor.trim().toLowerCase() === valor.toLowerCase()
    );
    if (duplicado) {
      toast?.current?.show({
        severity: 'info',
        summary: 'Atributo já adicionado',
        detail: `"${nome}: ${valor}" já está na lista.`,
      });
      return;
    }

    const novoItem = { atributo: nome, valor };
    const novaLista = [...localValue, novoItem];
    setLocalValue(novaLista);
    onChange(novaLista);

    setNovo({ atributo: '', valor: '' });
    toast?.current?.show({
      severity: 'success',
      summary: 'Atributo adicionado',
      detail: `"${nome}: ${valor}" incluído com sucesso.`,
    });
  };

  /** Busca nomes com cache */
  const buscarNomes = (query, idx) => {
    const termo = normalizar(query);
    if (!termo || termo.length < 2) {
      setSugNomes(prev => ({ ...prev, [idx]: [] }));
      return;
    }

    if (cacheNomes.current[termo]) {
      setSugNomes(prev => ({ ...prev, [idx]: cacheNomes.current[termo] }));
      return;
    }

    debounce(`nome-${idx}`, async () => {
      try {
        const { data } = await apiEstoque.get('/atributos/sugestoes', { params: { q: termo } });
        cacheNomes.current[termo] = data || [];
        setSugNomes(prev => ({ ...prev, [idx]: data || [] }));
      } catch {
        setSugNomes(prev => ({ ...prev, [idx]: [] }));
      }
    });
  };

  /** Busca valores com cache */
  const buscarValores = (query, idx) => {
    const attr = normalizar(localValue[idx]?.atributo || novo?.atributo);
    const termo = normalizar(query);
    if (!attr || termo.length < 1) {
      setSugValores(prev => ({ ...prev, [idx]: [] }));
      return;
    }

    const cacheKey = `${attr}|${termo}`;
    if (cacheValores.current[cacheKey]) {
      setSugValores(prev => ({ ...prev, [idx]: cacheValores.current[cacheKey] }));
      return;
    }

    debounce(`valor-${idx}`, async () => {
      try {
        const { data } = await apiEstoque.get(`/atributos/${encodeURIComponent(attr)}/valores`, {
          params: { q: termo },
        });
        cacheValores.current[cacheKey] = data || [];
        setSugValores(prev => ({ ...prev, [idx]: data || [] }));
      } catch {
        setSugValores(prev => ({ ...prev, [idx]: [] }));
      }
    });
  };

  return (
    <div className="gap-3">
      {(localValue || []).map((a, idx) => (
        <div
          key={idx}
          className="p-3 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-3 transition-all"
        >
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-sm font-medium text-gray-600">Nome do atributo</label>
              <AutoComplete
                value={a.atributo}
                suggestions={sugNomes[idx] || []}
                completeMethod={e => buscarNomes(e.query, idx)}
                onChange={e => update(idx, 'atributo', normalizar(e.value || ''))}
                placeholder="Ex.: cor, tamanho, acabamento"
                dropdown
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Valor</label>
              <AutoComplete
                value={a.valor}
                suggestions={sugValores[idx] || []}
                completeMethod={e => buscarValores(e.query, idx)}
                onChange={e => update(idx, 'valor', e.value || '')}
                placeholder="Ex.: vermelho, M, polido"
                dropdown
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              icon="pi pi-times"
              label="Remover"
              className="p-button-text p-button-danger text-sm"
              onClick={() => remove(idx)}
            />
          </div>
        </div>
      ))}

      {/* Novo atributo */}
      <div className="p-3 border-dashed border-2 border-gray-300 rounded-lg bg-white flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium text-gray-600">Novo atributo</label>
          <AutoComplete
            value={novo.atributo}
            suggestions={sugNomes['novo'] || []}
            completeMethod={e => buscarNomes(e.query, 'novo')}
            onChange={e => setNovo({ ...novo, atributo: normalizar(e.value || '') })}
            placeholder="Nome do atributo"
            dropdown
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Valor</label>
          <AutoComplete
            value={novo.valor}
            suggestions={sugValores['novo'] || []}
            completeMethod={e => buscarValores(e.query, 'novo')}
            onChange={e => setNovo({ ...novo, valor: e.value || '' })}
            placeholder="Valor"
            dropdown
            className="w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button
            icon="pi pi-plus"
            label="Adicionar atributo"
            className="p-button-sm p-button-outlined p-button-primary"
            onClick={add}
          />
        </div>
      </div>
    </div>
  );
}
