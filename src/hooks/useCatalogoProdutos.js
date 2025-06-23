import { useState, useEffect, useRef } from 'react';
import api from '../services/apiEstoque';
import { formatarFiltrosParaEnvio } from '../utils/formatarFiltrosParaEnvio';

export const useCatalogoProdutos = (filtros) => {
  const [produtos, setProdutos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelaRef = useRef(null);

  const fetchProdutos = async (append = false) => {
    setLoading(true);
    try {
      const response = await api.get('/produtos', {
        params: { ...formatarFiltrosParaEnvio(filtros), page: pagina, per_page: 20 }
      });

      const novos = response.data.data || [];
      setProdutos(prev => append ? [...prev, ...novos] : novos);
      const meta = response.data.meta || {};
      setTemMais(meta.current_page < meta.last_page);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPagina(1);
    setTemMais(true);
    fetchProdutos(false);
  }, [filtros]);

  useEffect(() => {
    if (pagina > 1) fetchProdutos(true);
  }, [pagina]);

  useEffect(() => {
    if (!temMais || loading || !sentinelaRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPagina(prev => prev + 1);
      }
    }, { threshold: 1 });

    const target = sentinelaRef.current;
    observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [sentinelaRef.current, temMais, loading]);

  return { produtos, loading, pagina, setPagina, temMais, sentinelaRef };
};
