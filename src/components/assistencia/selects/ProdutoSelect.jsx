import React, { useEffect, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

/**
 * AutoComplete de Produto.
 * - Se receber pedidoId, restringe aos produtos presentes no pedido (distinct).
 * - Caso contrário, busca no endpoint geral de produtos.
 *
 * @param {{
 *  value?: {id:number,label?:string,sku?:string}|null,
 *  onChange?: (val:any)=>void,
 *  placeholder?: string,
 *  style?: React.CSSProperties,
 *  pedidoId?: number|null
 * }} props
 */
export default function ProdutoSelect({ value, onChange, placeholder = "Buscar produto...", style, pedidoId = null }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { if (typeof value === 'object' && value?.id) setSelected(value); }, [value]);

  async function search(e) {
    const q = e.query ?? '';

    if (pedidoId) {
      // carrega itens do pedido e extrai produtos únicos
      const { data } = await apiEstoque.get(`/assistencias/pedidos/${pedidoId}/produtos`);
      const itens = Array.isArray(data?.itens) ? data.itens : [];
      const uniq = new Map();
      itens.forEach(i => {
        const p = i?.produto;
        if (p?.id && !uniq.has(p.id)) {
          uniq.set(p.id, { id: p.id, label: p.nome || `Produto #${p.id}`, sku: '' });
        }
      });
      const list = Array.from(uniq.values())
        .filter(op => op.label.toLowerCase().includes((q || '').toLowerCase()));
      setSuggestions(list);
      return;
    }

    // fluxo padrão (sem pedido)
    const { data } = await apiEstoque.get('/produtos', { params: { search: q, per_page: 20, page: 1 }});
    const list = (data?.data ?? data ?? []).map((p) => ({
      id: p.id,
      label: p.nome || p.titulo || `Produto #${p.id}`,
      sku: p.sku || p.codigo || '',
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
