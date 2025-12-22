import { useCallback, useState } from 'react';
import api from '../../services/apiEstoque';
import { useDebouncedCallback } from '../useDebouncedCallback';
import { normalizeText } from '../../utils/string/normalizeText';

export function useCategoriaAutoComplete() {
  const [catSug, setCatSug] = useState([]);

  const buscarCategorias = useDebouncedCallback(
    async (query = '') => {
      const q = (query || '').trim();
      try {
        const { data } = await api.get('/categorias', {
          params: { nome: q, search: q, q, per_page: 100, page: 1 },
        });

        const raw = (data?.data ?? data ?? []);
        const mapped = raw.map((c) => ({
          id: c.id,
          label: c.nome || c.titulo || c.label || `Categoria #${c.id}`,
        }));

        const nq = normalizeText(q);
        const filtered = nq
          ? mapped.filter((c) => normalizeText(c.label).includes(nq))
          : mapped.slice(0, 50);

        setCatSug(filtered);
      } catch (e) {
        setCatSug([]);
      }
    },
    300
  );

  const clearSug = useCallback(() => setCatSug([]), []);

  return { catSug, buscarCategorias, clearSug };
}
