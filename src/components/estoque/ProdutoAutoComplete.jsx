import React, { useState, useRef, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import apiEstoque from '../../services/apiEstoque';
import { listarProdutos } from '../../services/produtoService';
import { normalizarBuscaProduto } from '../../utils/normalizarBuscaProduto';

/**
 * AutoComplete de produtos e variações.
 * - Busca textual → view=minima
 * - Ao selecionar → busca Produto completo filtrando por variacao_id e deposito_id
 */
export default function ProdutoAutoComplete({ depositoId, onSelectVariacao }) {
  const [sugestoes, setSugestoes] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const cache = useRef(new Map());
  const MAX_CACHE = 50;

  useEffect(() => {
    console.log('🟢 ProdutoAutoComplete montado. depositoId=', depositoId);
    return () => console.log('🔴 ProdutoAutoComplete desmontado');
  }, [depositoId]);

  /** 🔎 Busca produtos (view=minima) */
  const buscarProdutos = async (term) => {
    const search = normalizarBuscaProduto(term) || '';
    console.log('🔎 buscarProdutos term=', search);

    if (search.length < 2) {
      console.log('ℹ️ termo curto, limpando sugestões');
      setSugestoes([]);
      return;
    }

    if (cache.current.has(search)) {
      console.log('🗂️ cache HIT para', search);
      setSugestoes(cache.current.get(search));
      return;
    }

    setLoading(true);
    try {
      console.log('🌐 GET /produtos?view=minima&q=', search, ' depositoId=', depositoId);
      const res = await listarProdutos({
        q: search,
        view: 'minima',
        deposito_id: depositoId,
        per_page: 10,
      });

      const produtos = res.data?.data || [];
      console.log('✅ resposta mínima /produtos:', produtos);

      const lista = [];
      for (const produto of produtos) {
        if (produto.variacoes?.length) {
          for (const v of produto.variacoes) {
            lista.push({
              label: `${v.nome_completo || produto.nome} (${v.referencia})`,
              value: v.id,
              produto_nome: produto.nome,
              produto_id: produto.id,
              categoria: produto.categoria,
              imagem: produto.imagem,
              referencia: v.referencia,
              codigo_barras: v.codigo_barras,
            });
          }
        } else {
          lista.push({
            label: `${produto.nome} (sem variações)`,
            value: produto.id,
            produto_id: produto.id,
            categoria: produto.categoria,
          });
        }
      }

      cache.current.set(search, lista);
      if (cache.current.size > MAX_CACHE) {
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }

      setSugestoes(lista);
    } catch (e) {
      console.error('❌ Erro ao buscar produtos (minima):', e);
    } finally {
      setLoading(false);
    }
  };

  const onComplete = (e) => {
    clearTimeout(timerRef.current);
    const term = e.query;
    console.log('⌨️ onComplete term=', term);
    setQuery(term);
    timerRef.current = setTimeout(() => buscarProdutos(term), 400);
  };

  /** ▶️ Seleção de uma variação → busca completa pelo variacao_id */
  const onSelect = async (e) => {
    console.log('🟢 onSelect disparado com e.value=', e?.value);
    const variacaoId = e.value?.value || e.value;
    if (!variacaoId) {
      console.warn('⚠️ variacaoId ausente no onSelect');
      return;
    }

    try {
      setLoading(true);
      console.log('🌐 GET /produtos?variacao_id=', variacaoId, ' depositoId=', depositoId, ' view=completa');
      const res = await apiEstoque.get(`/produtos`, {
        params: {
          variacao_id: variacaoId,
          view: 'completa',
          deposito_id: depositoId,
        },
      });

      const produtoCompleto = res.data?.data?.[0];
      console.log('📦 produtoCompleto recebido:', produtoCompleto);

      const variacao = produtoCompleto?.variacoes?.find((v) => v.id === variacaoId);
      console.log('🔍 variacao selecionada:', variacao);

      const estoque = variacao?.estoque?.quantidade ?? variacao?.estoque_total ?? 0;
      console.log('📊 estoque calculado para seleção =', estoque);

      if (variacao) {
        console.log('➡️ Chamando onSelectVariacao com variacao e produtoCompleto');
        onSelectVariacao?.({ ...variacao, estoque_atual: estoque }, produtoCompleto);
      } else {
        console.warn('⚠️ Variação não encontrada dentro do produto completo');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da variação (completa):', error);
    } finally {
      setQuery('');
      setSugestoes([]);
      setLoading(false);
    }
  };

  return (
    <AutoComplete
      value={query}
      suggestions={sugestoes}
      completeMethod={onComplete}
      field="label"
      dropdown
      placeholder="Busque por nome, código ou referência"
      onChange={(e) => {
        console.log('✏️ onChange query=', e.value);
        setQuery(e.value);
      }}
      onSelect={onSelect}
      loading={loading}
      minLength={2}
      forceSelection={false}
      className="w-full"
      delay={0}
      itemTemplate={(item) => (
        <div className="flex align-items-center gap-2">
          {item.imagem && (
            <img
              src={item.imagem}
              alt={item.label}
              width="32"
              height="32"
              className="border-round"
              style={{ objectFit: 'cover' }}
            />
          )}
          <div className="flex flex-column">
            <span className="font-semibold">{item.label}</span>
            {item.categoria && (
              <small className="text-color-secondary">{item.categoria}</small>
            )}
          </div>
        </div>
      )}
      selectedItemTemplate={(item) => item?.label || query || ''}
    />
  );
}
