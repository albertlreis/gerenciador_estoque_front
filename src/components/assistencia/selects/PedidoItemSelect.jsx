import React, { useEffect, useMemo, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../../services/apiEstoque';

/**
 * @typedef {Object} PedidoItemOption
 * @property {number} variacao_id
 * @property {number} produto_id
 * @property {string} label        - Texto exibido (Produto — Variação/Referência)
 * @property {string} [ref]        - Referência/SKU para exibição auxiliar
 * @property {Object} [raw]        - Objeto cru retornado da API (opcional)
 */

/**
 * Select único para escolher uma variação pertencente a um Pedido.
 * Lista variações junto com o nome do produto, restringindo ao pedido informado.
 *
 * @param {{
 *  pedidoId: number,
 *  value?: PedidoItemOption|null,
 *  onChange?: (opt: PedidoItemOption|null) => void,
 *  placeholder?: string,
 *  style?: React.CSSProperties
 * }} props
 */
export default function PedidoItemSelect({ pedidoId, value, onChange, placeholder = 'Produto...', style }) {
  const [all, setAll] = useState(/** @type {PedidoItemOption[]} */([]));
  const [suggestions, setSuggestions] = useState(/** @type {PedidoItemOption[]} */([]));
  const [selected, setSelected] = useState(/** @type {PedidoItemOption|null} */(null));
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (value && value.variacao_id) setSelected(value); }, [value]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!pedidoId) { setAll([]); return; }
      setLoading(true);
      try {
        const { data } = await apiEstoque.get(`/assistencias/pedidos/${pedidoId}/produtos`);
        const itens = Array.isArray(data?.itens) ? data.itens : [];

        /** @type {PedidoItemOption[]} */
        const mapped = itens
          .filter(i => i?.variacao?.id && i?.produto?.id)
          .map(i => {
            const v = i.variacao;
            const p = i.produto;
            const labelBase = v?.nome_completo || v?.nome || v?.referencia || `Variação #${v.id}`;
            const produtoNome = p?.nome || `Produto #${p?.id}`;
            return {
              variacao_id: v.id,
              produto_id: p.id,
              label: `${produtoNome} — ${labelBase}`,
              ref: v?.referencia || '',
              raw: i,
            };
          });

        if (!ignore) setAll(mapped);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [pedidoId]);

  /**
   * Filtra localmente por label/ref (case-insensitive).
   * @param {string} q
   */
  function filterLocal(q) {
    const s = (q || '').toLowerCase();
    if (!s) { setSuggestions(all); return; }
    setSuggestions(
      all.filter(op =>
        op.label.toLowerCase().includes(s) ||
        (op.ref && op.ref.toLowerCase().includes(s))
      )
    );
  }

  return (
    <AutoComplete
      value={selected}
      suggestions={suggestions}
      completeMethod={(e) => filterLocal(e.query)}
      field="label"
      placeholder={placeholder}
      style={style}
      dropdown
      disabled={!pedidoId || loading}
      itemTemplate={(op) => (
        <div className="flex flex-column">
          <span className="font-medium">{op.label}</span>
          {op.ref ? <small className="text-500">ref: {op.ref}</small> : null}
        </div>
      )}
      onChange={(e) => setSelected(e.value)}
      onSelect={(e) => { setSelected(e.value); onChange?.(e.value); }}
    />
  );
}
