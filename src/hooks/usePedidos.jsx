import { useState } from 'react';
import apiEstoque from '../services/apiEstoque';

export const usePedidos = (filtros) => {
  const [pedidos, setPedidos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPedidos = async (pagina = 1) => {
    try {
      setLoading(true);

      const params = {
        page: pagina,
        per_page: 10,
        status: filtros.status,
        busca: filtros.texto,
        tipo_busca: filtros.tipo,
      };

      if (filtros.periodo) {
        if (filtros.periodo[0]) params.data_inicio = filtros.periodo[0].toISOString().split('T')[0];
        if (filtros.periodo[1]) params.data_fim = filtros.periodo[1].toISOString().split('T')[0];
      }

      const response = await apiEstoque.get('/pedidos', { params });
      setPedidos(response.data.original.data);
      setTotal(response.data.original.meta.total);
      setPaginaAtual(response.data.original.meta.current_page);
    } catch (e) {
      console.error('Erro ao carregar pedidos', e);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  return { pedidos, paginaAtual, total, loading, fetchPedidos, setPaginaAtual };
};
