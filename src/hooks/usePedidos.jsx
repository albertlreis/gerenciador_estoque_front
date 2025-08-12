import { useState } from 'react';
import apiEstoque from '../services/apiEstoque';

export const usePedidos = (filtros) => {
  const [pedidos, setPedidos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * Busca pedidos.
   * @param {number} pagina - número da página (default 1)
   * @param {object} [overrideFiltros] - objeto de filtros para sobrescrever o recebido por props
   */
  const fetchPedidos = async (pagina = 1, overrideFiltros) => {
    const f = overrideFiltros ?? filtros;

    try {
      setLoading(true);

      const params = {
        page: pagina,
        per_page: 10,
        status: f?.status ?? null,
        busca: f?.texto ?? '',
        // tipo_busca removido conforme decisão do projeto
      };

      // Período (CalendarBR em modo range)
      if (Array.isArray(f?.periodo)) {
        const [inicio, fim] = f.periodo;
        if (inicio instanceof Date) {
          params.data_inicio = inicio.toISOString().split('T')[0];
        }
        if (fim instanceof Date) {
          params.data_fim = fim.toISOString().split('T')[0];
        }
      }

      const response = await apiEstoque.get('/pedidos', { params });

      // Mantém compatibilidade com a estrutura atual da API (Laravel Resource + meta)
      setPedidos(response?.data?.original?.data ?? []);
      setTotal(response?.data?.original?.meta?.total ?? 0);
      setPaginaAtual(response?.data?.original?.meta?.current_page ?? pagina);
    } catch (e) {
      console.error('Erro ao carregar pedidos', e);
      setPedidos([]);
      setTotal(0);
      // mantém paginaAtual como está em caso de erro
    } finally {
      setLoading(false);
    }
  };

  return { pedidos, paginaAtual, total, loading, fetchPedidos, setPaginaAtual };
};
