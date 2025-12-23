import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

import SakaiLayout from '../layouts/SakaiLayout';
import apiFinanceiro from '../services/apiFinanceiro';
import { toIsoDate } from '../utils/date/dateHelpers';

export default function FinanceiroDashboard() {
  const toast = useRef(null);
  const [periodo, setPeriodo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    receitas_total: 0,
    despesas_total: 0,
    saldo: 0,
    serie: [],
  });

  const carregar = async (p = periodo) => {
    setLoading(true);
    try {
      const params = {
        data_inicio: p?.[0] ? toIsoDate(p[0]) : undefined,
        data_fim: p?.[1] ? toIsoDate(p[1]) : undefined,
      };
      const res = await apiFinanceiro.get('/financeiro/dashboard', { params });
      setData(res?.data?.data || res?.data || {
        receitas_total: 0,
        despesas_total: 0,
        saldo: 0,
        serie: [],
      });
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, []);

  const money = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <SakaiLayout>
      <Toast ref={toast} />

      <div className="p-4">
        <div className="flex flex-wrap gap-2 align-items-end mb-3">
          <Calendar
            value={periodo || null}
            onChange={(e) => setPeriodo(e.value)}
            selectionMode="range"
            readOnlyInput
            placeholder="Período"
            dateFormat="dd/mm/yy"
            className="w-20rem"
          />
          <Button icon="pi pi-refresh" label="Atualizar" onClick={() => carregar(periodo)} loading={loading} />
        </div>

        <div className="grid mb-3">
          <div className="col-12 md:col-4">
            <div className="p-3 border-round surface-0 shadow-1">
              <div className="text-500 text-sm">Receitas</div>
              <div className="text-2xl font-bold">R$ {money(data.receitas_total)}</div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="p-3 border-round surface-0 shadow-1">
              <div className="text-500 text-sm">Despesas</div>
              <div className="text-2xl font-bold">R$ {money(data.despesas_total)}</div>
            </div>
          </div>
          <div className="col-12 md:col-4">
            <div className="p-3 border-round surface-0 shadow-1">
              <div className="text-500 text-sm">Saldo</div>
              <div className="text-2xl font-bold">R$ {money(data.saldo)}</div>
            </div>
          </div>
        </div>

        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm mb-2">Série (placeholder)</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data.serie || [], null, 2)}</pre>
          <small className="text-500">
            Quando definirmos o retorno do endpoint do dashboard, a gente troca esse JSON por um gráfico (PrimeReact Chart ou Recharts).
          </small>
        </div>
      </div>
    </SakaiLayout>
  );
}
