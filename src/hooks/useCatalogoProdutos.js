import { useState, useEffect, useRef } from 'react';
import { listarProdutos } from '../services/produtoService';
import { formatarFiltrosParaEnvio } from '../utils/formatarFiltrosParaEnvio';

export const useCatalogoProdutos = (filtros) => {
  const [produtos, setProdutos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelaRef = useRef(null);

  const fetchProdutos = async (append = false, pageOverride = null) => {
    setLoading(true);
    try {
      const page = pageOverride ?? (append ? pagina : 1);
      const response = await listarProdutos({
        ...formatarFiltrosParaEnvio(filtros),
        page,
        per_page: 20,
      });

      const novos = response.data.data || [];
      setProdutos((prev) => (append && page > 1 ? [...prev, ...novos] : novos));
      const meta = response.data.meta || {};
      setTemMais((meta.current_page || 1) < (meta.last_page || 1));
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const atualizarProdutoNaLista = (produtoAtualizado) => {
    if (!produtoAtualizado?.id) return;
    setProdutos((prev) =>
      prev.map((p) => (p?.id === produtoAtualizado.id ? { ...p, ...produtoAtualizado } : p))
    );
  };

  useEffect(() => {
    setPagina(1);
    setTemMais(true);
    fetchProdutos(false, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)]);

  useEffect(() => {
    if (pagina > 1) fetchProdutos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  useEffect(() => {
    if (!temMais || loading || !sentinelaRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPagina((prev) => prev + 1);
      }
    }, { threshold: 1 });

    const target = sentinelaRef.current;
    observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [sentinelaRef, temMais, loading]);

  return {
    produtos,
    loading,
    pagina,
    setPagina,
    temMais,
    sentinelaRef,
    atualizarProdutoNaLista,
  };
};
