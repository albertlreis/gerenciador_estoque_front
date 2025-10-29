import React, { useState, useRef, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../services/apiEstoque';

/**
 * AutoComplete de pedidos com busca otimizada e cache local.
 * - Debounce de 400ms
 * - Cache local para evitar requisições repetidas
 * - Exibe texto digitado corretamente
 * - Resolve valor inicial via /pedidos/{id}
 */
export default function PedidoAutoComplete({
                                             value,           // objeto ou ID do pedido
                                             onChange,
                                             placeholder = 'Buscar pedido',
                                             minLength = 2,
                                           }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const cache = useRef({});
  const debounceRef = useRef(null);

  /** Busca pedidos no backend com cache */
  const fetchPedidos = async termo => {
    const term = termo.trim();
    if (term.length < minLength) {
      setSuggestions([]);
      return;
    }

    const norm = term.toLowerCase();
    if (cache.current[norm]) {
      setSuggestions(cache.current[norm]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiEstoque.get('/pedidos', { params: { q: term } });
      const mapped = (data || []).map(p => ({
        id: p.id,
        label: `#${p.numero || p.numero_externo || p.id} - ${p.cliente || '-'}`,
      }));

      setSuggestions(mapped);
      cache.current[norm] = mapped;
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
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
    debounceRef.current = setTimeout(() => fetchPedidos(term), 400);
  };

  /** Seleção */
  const onSelect = e => {
    const item = e.value;
    if (!item) {
      setText('');
      onChange(null);
      return;
    }
    setText(item.label);
    onChange(item);
  };

  /** Quando valor inicial vem do backend */
  useEffect(() => {
    if (!value) return;
    // Caso já seja um objeto completo
    if (value.label) {
      setText(value.label);
      return;
    }

    (async () => {
      try {
        const { data } = await apiEstoque.get(`/pedidos/${value}`);
        const label = `#${data.numero_externo || data.id} - ${data.cliente?.nome || '-'}`;
        setText(label);
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
      className="w-full sm:w-16rem"
      panelFooterTemplate={
        !hasQuery ? (
          <div className="p-2 text-sm text-gray-600">
            Digite pelo menos {minLength} caracteres para buscar.
          </div>
        ) : !hasResults && !loading ? (
          <div className="p-2 text-sm text-gray-600">Nenhum pedido encontrado.</div>
        ) : (
          <div className="p-2 border-t text-sm text-gray-600">
            <i className="pi pi-search mr-1" />
            Procure pelo número do pedido ou nome do cliente.
          </div>
        )
      }
    />
  );
}
