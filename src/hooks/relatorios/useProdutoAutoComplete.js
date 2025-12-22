import { useState } from 'react';
import api from '../../services/apiEstoque';
import { useDebouncedCallback } from '../useDebouncedCallback';

export function useProdutoAutoComplete() {
  const [prodSug, setProdSug] = useState([]);

  const buscarProdutos = useDebouncedCallback(
    async (query = '') => {
      try {
        const params = { nome: query, per_page: 20, page: 1 };
        const { data } = await api.get('/produtos', { params });

        const list = (data?.data ?? data ?? []).map((p) => ({
          id: p.id,
          label: p.nome || `Produto #${p.id}`,
          sku: p.variacoes?.[0]?.referencia || '',
        }));

        setProdSug(list);
      } catch (e) {
        setProdSug([]);
      }
    },
    350
  );

  return { prodSug, buscarProdutos };
}
