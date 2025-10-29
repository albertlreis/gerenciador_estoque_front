import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../services/apiEstoque';

/**
 * AutoComplete de categorias otimizado
 * - Busca com debounce e cache local
 * - Exibe nome atual mesmo sem buscar
 * - Permite criar nova categoria
 */
export default function CategoriaAutoComplete({
                                                value,          // id da categoria
                                                onChange,
                                                onCreate,
                                                placeholder = 'Categoria',
                                                minLength = 2,
                                              }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const cache = useRef({});
  const debounceRef = useRef(null);

  /** Normaliza texto */
  const normalize = (t) =>
    (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  /** Converte estrutura hierárquica em array plano */
  const flatten = (categorias, prefix = '') =>
    (categorias || []).flatMap(c => {
      if (!c) return [];
      const label = prefix ? `${prefix} > ${c.nome}` : c.nome;
      const base = [{ label, value: c.id }];
      if (Array.isArray(c.subcategorias) && c.subcategorias.length)
        return [...base, ...flatten(c.subcategorias, label)];
      return base;
    });

  /** Busca categorias no backend com cache */
  const buscarCategorias = async termo => {
    const term = termo.trim();
    if (term.length < minLength) {
      setSuggestions([]);
      return;
    }

    const norm = normalize(term);
    if (cache.current[norm]) {
      setSuggestions(cache.current[norm]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiEstoque.get('/categorias', { params: { search: term } });
      const flat = flatten(data || []);
      const filtradas = flat.filter(c => normalize(c.label).includes(norm));

      // se não existir igual, adiciona opção de cadastro
      if (!flat.some(c => normalize(c.label) === norm)) {
        filtradas.push({
          label: `Cadastrar "${term}"`,
          value: '__create__',
          _novoNome: term,
        });
      }

      setSuggestions(filtradas);
      cache.current[norm] = filtradas;
    } catch (err) {
      console.error('Erro ao buscar categorias', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /** Debounce da busca */
  const onSearch = e => {
    const term = e.query || '';
    setText(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscarCategorias(term), 400);
  };

  /** Seleção ou criação */
  const onSelect = async e => {
    const item = e.value;
    if (!item) {
      setText('');
      onChange(null);
      return;
    }

    if (item.value === '__create__' && onCreate) {
      const nome = item._novoNome?.trim();
      if (!nome) return;
      const nova = await onCreate(nome);
      if (nova) {
        setText(nova.label);
        onChange(nova.value);
      }
    } else {
      setText(item.label);
      onChange(item.value);
    }
  };

  /** Quando já existe valor vindo do backend */
  useEffect(() => {
    if (!value) return;
    (async () => {
      // tenta localizar em cache
      const cached = Object.values(cache.current).flat().find(c => c.value === value);
      if (cached) {
        setText(cached.label);
        return;
      }
      try {
        const { data } = await apiEstoque.get(`/categorias/${value}`);
        setText(data?.nome || '');
      } catch {
        setText('');
      }
    })();
  }, [value]);

  const hasQuery = text.length >= minLength;
  const hasResults = Array.isArray(suggestions) && suggestions.length > 0;

  return (
    <AutoComplete
      value={text}
      suggestions={suggestions}
      completeMethod={onSearch}
      onChange={e => setText(e.value)}
      onSelect={onSelect}
      field="label"
      dropdown
      forceSelection={false}
      loading={loading}
      placeholder={placeholder}
      className="w-full sm:w-20rem md:w-24rem"
      panelFooterTemplate={
        !hasQuery ? (
          <div className="p-2 text-sm text-gray-600">
            Digite pelo menos {minLength} caracteres para buscar.
          </div>
        ) : !hasResults && !loading ? (
          <div className="p-2 text-sm text-gray-600">
            Nenhuma categoria encontrada.
          </div>
        ) : (
          <div className="p-2 border-t text-sm text-gray-600">
            <i className="pi pi-plus mr-1" />
            Não encontrou? Clique em “Cadastrar” acima.
          </div>
        )
      }
    />
  );
}
