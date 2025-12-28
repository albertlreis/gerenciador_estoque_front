import { useCallback, useRef, useState } from 'react';
import apiFinanceiro from '../services/apiFinanceiro';

/**
 * Catálogos do Financeiro (para dropdowns)
 *
 * Endpoints:
 * - GET /financeiro/catalogos/categorias-financeiras?tipo=&ativo=true&tree=
 * - GET /financeiro/catalogos/contas-financeiras?tipo=&ativo=true
 *
 * Retorno esperado: { data: [...] }
 */
export function useFinanceiroCatalogos() {
  const cache = useRef({
    categorias: null,
    contas: null,
    categoriasKey: '',
    contasKey: '',
  });

  const [loading, setLoading] = useState(false);

  const loadCategorias = useCallback(async ({ tipo, ativo = true, tree = false, q } = {}) => {
    const key = `tipo=${tipo || ''};ativo=${String(ativo)};tree=${String(tree)};q=${q || ''}`;
    if (cache.current.categorias && cache.current.categoriasKey === key) return cache.current.categorias;

    setLoading(true);
    try {
      const { data } = await apiFinanceiro.get('/financeiro/catalogos/categorias-financeiras', {
        params: {
          tipo: tipo || undefined,
          ativo: ativo === null ? undefined : ativo,
          tree: tree ? 1 : undefined,
          q: q || undefined,
        },
      });

      const items = data?.data || [];

      // Se tree=true, devolvemos a árvore como veio do back (não dá pra "flatten" sem regra)
      if (tree) {
        cache.current.categorias = items;
        cache.current.categoriasKey = key;
        return items;
      }

      const list = items.map((c) => ({
        label: c.nome,
        value: c.id,
        raw: c,
      }));

      cache.current.categorias = list;
      cache.current.categoriasKey = key;
      return list;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContas = useCallback(async ({ tipo, ativo = true, q } = {}) => {
    const key = `tipo=${tipo || ''};ativo=${String(ativo)};q=${q || ''}`;
    if (cache.current.contas && cache.current.contasKey === key) return cache.current.contas;

    setLoading(true);
    try {
      const { data } = await apiFinanceiro.get('/financeiro/catalogos/contas-financeiras', {
        params: {
          tipo: tipo || undefined,
          ativo: ativo === null ? undefined : ativo,
          q: q || undefined,
        },
      });

      const list = (data?.data || []).map((c) => ({
        label: c.nome,
        value: c.id,
        raw: c,
      }));

      cache.current.contas = list;
      cache.current.contasKey = key;
      return list;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    cache.current.categorias = null;
    cache.current.contas = null;
    cache.current.categoriasKey = '';
    cache.current.contasKey = '';
  }, []);

  return { loading, loadCategorias, loadContas, clearCache };
}
