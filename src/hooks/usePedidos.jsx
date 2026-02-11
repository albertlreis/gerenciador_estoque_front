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
   * @param {object} [overrideFiltros] - filtros para sobrescrever os recebidos por props
   */
  const fetchPedidos = async (pagina = 1, overrideFiltros) => {
    const f = overrideFiltros ?? filtros;

    try {
      setLoading(true);

      // status pode vir como string, enum ou objeto { value, label }
      const normalizarStatus = (s) => {
        if (!s) return null;
        if (typeof s === 'string') return s;
        if (typeof s === 'object' && ('value' in s)) return s.value;
        return s ?? null;
      };

      const params = {
        page: pagina,
        per_page: 10,
        status: normalizarStatus(f?.status),
        busca: f?.texto ?? '',
        // tipo_busca removido conforme decisão do projeto
      };

      // Período (CalendarBR em modo range)
      if (Array.isArray(f?.periodo)) {
        const [inicio, fim] = f.periodo;
        if (inicio instanceof Date) params.data_inicio = inicio.toISOString().split('T')[0];
        if (fim instanceof Date) params.data_fim = fim.toISOString().split('T')[0];
      }

      const response = await apiEstoque.get('/pedidos', { params });

      // Estrutura atual do backend: { data: [...], meta: {...}, links: {...} }
      const payload = response?.data ?? {};
      const lista = payload?.data ?? [];
      const meta = payload?.meta ?? {};

      const listaFiltrada = Array.isArray(lista)
        ? lista.filter((pedido) => !['consignado', 'devolucao_consignacao'].includes(pedido?.status))
        : [];

      setPedidos(listaFiltrada);
      setTotal(meta.total ?? 0);
      setPaginaAtual(meta.current_page ?? pagina);
    } catch (e) {
      console.error('Erro ao carregar pedidos', e);
      setPedidos([]);
      setTotal(0);
      // mantém paginaAtual
    } finally {
      setLoading(false);
    }
  };

  return { pedidos, paginaAtual, total, loading, fetchPedidos, setPaginaAtual };
};
