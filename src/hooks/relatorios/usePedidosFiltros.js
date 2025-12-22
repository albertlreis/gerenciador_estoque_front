import { useEffect, useMemo, useState } from 'react';
import api from '../../services/apiEstoque';
import apiAuth from '../../services/apiAuth';
import { ensureArray } from '../../utils/array/ensureArray';

export function usePedidosFiltros({ enabled, toastRef }) {
  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loadingFiltrosPedidos, setLoadingFiltrosPedidos] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let alive = true;
    (async () => {
      try {
        setLoadingFiltrosPedidos(true);
        const [resClientes, resParceiros, resVendedores] = await Promise.all([
          api.get('/clientes'),
          api.get('/parceiros'),
          apiAuth.get('/usuarios/vendedores'),
        ]);

        if (!alive) return;

        setClientes(ensureArray(resClientes?.data));
        setParceiros(ensureArray(resParceiros?.data));
        setVendedores(ensureArray(resVendedores?.data));
      } catch (error) {
        console.error('Erro ao carregar filtros de pedidos:', error);
        toastRef?.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar clientes/parceiros/vendedores',
        });

        if (alive) {
          setClientes([]);
          setParceiros([]);
          setVendedores([]);
        }
      } finally {
        if (alive) setLoadingFiltrosPedidos(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [enabled, toastRef]);

  const clientesOpts = useMemo(
    () => ensureArray(clientes).map((c) => ({ label: c.nome ?? c.label ?? `Cliente #${c.id}`, value: c.id })),
    [clientes]
  );

  const parceirosOpts = useMemo(
    () => ensureArray(parceiros).map((p) => ({ label: p.nome ?? p.label ?? `Parceiro #${p.id}`, value: p.id })),
    [parceiros]
  );

  const vendedoresOpts = useMemo(
    () => ensureArray(vendedores).map((v) => ({ label: v.nome ?? v.label ?? `Vendedor #${v.id}`, value: v.id })),
    [vendedores]
  );

  return {
    loadingFiltrosPedidos,
    clientesOpts,
    parceirosOpts,
    vendedoresOpts,
  };
}
