import React, { useEffect, useMemo, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';

const STATUS_OPCOES = [
  { label: 'Aberta', value: 'ABERTA' },
  { label: 'Parcial', value: 'PARCIAL' },
  { label: 'Paga', value: 'PAGA' },
  { label: 'Cancelada', value: 'CANCELADA' },
];
const FORMA_OPCOES = [
  { label: 'PIX', value: 'PIX' },
  { label: 'Boleto', value: 'BOLETO' },
  { label: 'TED', value: 'TED' },
  { label: 'Dinheiro', value: 'DINHEIRO' },
  { label: 'Cartão', value: 'CARTAO' },
];

export default function ContasPagarFiltro({ filtros, setFiltros, onBuscar }) {
  const [local, setLocal] = useState(filtros);

  useEffect(() => setLocal(filtros), [filtros]);

  const aplicar = () => onBuscar(local);
  const limpar = () => onBuscar({ texto: '', status: null, forma_pagamento: null, periodo: null, vencidas: false });

  const periodoValue = useMemo(() => {
    if (!local?.periodo) return null;
    const [ini, fim] = local.periodo;
    return [ini ? new Date(ini) : null, fim ? new Date(fim) : null];
  }, [local?.periodo]);

  return (
    <div className="grid w-full">
      <div className="col-12 md:col-3">
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText
            className="w-full"
            placeholder="Buscar descrição ou nº doc"
            value={local.texto || ''}
            onChange={(e) => setLocal((p) => ({ ...p, texto: e.target.value }))}
          />
        </span>
      </div>

      <div className="col-6 md:col-2">
        <Dropdown
          className="w-full"
          value={local.status || null}
          options={STATUS_OPCOES}
          onChange={(e) => setLocal((p) => ({ ...p, status: e.value }))}
          placeholder="Status"
          showClear
        />
      </div>

      <div className="col-6 md:col-2">
        <Dropdown
          className="w-full"
          value={local.forma_pagamento || null}
          options={FORMA_OPCOES}
          onChange={(e) => setLocal((p) => ({ ...p, forma_pagamento: e.value }))}
          placeholder="Pagamento"
          showClear
        />
      </div>

      <div className="col-12 md:col-3">
        <Calendar
          className="w-full"
          value={periodoValue}
          onChange={(e) => {
            const [ini, fim] = e.value || [];
            setLocal((p) => ({ ...p, periodo: [ini?.toISOString()?.slice(0,10) || null, fim?.toISOString()?.slice(0,10) || null] }));
          }}
          selectionMode="range"
          dateFormat="dd/mm/yy"
          placeholder="Período de vencimento"
          readOnlyInput
          showIcon
        />
      </div>

      <div className="col-6 md:col-1 flex align-items-center gap-2">
        <Checkbox
          inputId="vencidas"
          checked={!!local.vencidas}
          onChange={(e) => setLocal((p) => ({ ...p, vencidas: e.checked }))}
        />
        <label htmlFor="vencidas" className="text-sm">Vencidas</label>
      </div>

      <div className="col-12 md:col-1 flex gap-2 justify-content-end">
        <Button icon="pi pi-filter" label="Filtrar" onClick={aplicar} />
        <Button icon="pi pi-times" severity="secondary" outlined onClick={limpar} />
      </div>
    </div>
  );
}
