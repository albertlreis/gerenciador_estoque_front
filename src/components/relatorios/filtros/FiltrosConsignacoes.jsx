import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import CalendarBR from '../../CalendarBR';
import { STATUS_CONSIGNACAO_OPTIONS } from '../../../constants/statusConsignacao';

export function FiltrosConsignacoes({
                                      periodoEnvio,
                                      setPeriodoEnvio,
                                      presetsConsigEnvio,

                                      periodoVencimento,
                                      setPeriodoVencimento,
                                      presetsConsigVenc,

                                      statusConsig,
                                      setStatusConsig,

                                      consolidado,
                                      setConsolidado,
                                    }) {
  return (
    <>
      <div className="field col-12 md:col-6">
        <label className="mb-2 block">Período de Envio</label>
        <CalendarBR
          value={periodoEnvio}
          onChange={(e) => setPeriodoEnvio(e.value)}
          selectionMode="range"
          placeholder="Selecione um intervalo (opcional)"
          className="w-full"
        />
        <div className="mt-2 flex gap-2 flex-wrap">
          {presetsConsigEnvio.map((p) => (
            <Button key={p.label} label={p.label} className="p-button-sm p-button-text" onClick={p.action} />
          ))}
        </div>
      </div>

      <div className="field col-12 md:col-6">
        <label className="mb-2 block">Período de Vencimento</label>
        <CalendarBR
          value={periodoVencimento}
          onChange={(e) => setPeriodoVencimento(e.value)}
          selectionMode="range"
          placeholder="Selecione um intervalo (opcional)"
          className="w-full"
        />
        <div className="mt-2 flex gap-2 flex-wrap">
          {presetsConsigVenc.map((p) => (
            <Button key={p.label} label={p.label} className="p-button-sm p-button-text" onClick={p.action} />
          ))}
        </div>
      </div>

      <div className="field col-12 md:col-4">
        <label className="mb-2 block">Status</label>
        <Dropdown
          value={statusConsig}
          onChange={(e) => setStatusConsig(e.value)}
          options={STATUS_CONSIGNACAO_OPTIONS}
          placeholder="Todos"
          filter
          showClear
          className="w-full"
        />
      </div>

      <div className="field col-12">
        <div className="flex align-items-center">
          <Checkbox
            inputId="consolidado"
            checked={consolidado}
            onChange={(e) => setConsolidado(e.checked)}
          />
          <label htmlFor="consolidado" className="ml-2 mb-0">
            Consolidar por cliente (desmarcado = detalhado com produtos)
          </label>
        </div>
      </div>
    </>
  );
}
