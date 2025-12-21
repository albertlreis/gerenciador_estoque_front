import { useEffect, useState } from 'react';
import api from '../../services/apiEstoque';
import { ensureArray } from '../../utils/array/ensureArray';

export function useDepositos({ enabled, toastRef }) {
  const [depositos, setDepositos] = useState([]);

  useEffect(() => {
    if (!enabled) return;

    let alive = true;
    (async () => {
      try {
        const res = await api.get('/depositos');
        const lista = ensureArray(res?.data).map((d) => ({
          label: d.nome || d.label || `Depósito #${d.id}`,
          value: d.id,
        }));
        if (alive) setDepositos(lista);
      } catch (error) {
        console.error('Erro ao carregar depósitos:', error);
        toastRef?.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar a lista de depósitos',
        });
        if (alive) setDepositos([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [enabled, toastRef]);

  return { depositos };
}
