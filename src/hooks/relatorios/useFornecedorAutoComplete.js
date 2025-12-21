import { useCallback, useState } from 'react';
import api from '../../services/apiEstoque';
import { useDebouncedCallback } from '../useDebouncedCallback';
import { normalizeText } from '../../utils/string/normalizeText';

/**
 * AutoComplete de fornecedores (GET /fornecedores?q=...)
 * Retorna sugestões no formato { id, label }
 */
export function useFornecedorAutoComplete() {
  const [fornSug, setFornSug] = useState([]);

  const buscarFornecedores = useDebouncedCallback(
    async (query = '') => {
      const q = (query || '').trim();

      try {
        const { data } = await api.get('/fornecedores', {
          params: {
            q,
            per_page: 50,
            page: 1,
            order_by: 'nome',
            order_dir: 'asc',
          },
        });

        // Laravel Resource::collection normalmente vem em { data: [...], meta: {...} }
        const raw = (data?.data ?? data ?? []);
        const mapped = raw.map((f) => ({
          id: f.id,
          label: f.nome || f.label || `Fornecedor #${f.id}`,
        }));

        // filtro client-side acento-insensível (melhora UX)
        const nq = normalizeText(q);
        const filtered = nq
          ? mapped.filter((x) => normalizeText(x.label).includes(nq))
          : mapped.slice(0, 50);

        setFornSug(filtered);
      } catch (e) {
        setFornSug([]);
      }
    },
    300
  );

  const clearSug = useCallback(() => setFornSug([]), []);

  return { fornSug, buscarFornecedores, clearSug };
}
