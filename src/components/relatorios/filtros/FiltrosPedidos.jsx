import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import CalendarBR from '../../CalendarBR';

export function FiltrosPedidos({
                                 periodoPedidos,
                                 setPeriodoPedidos,
                                 presetsPedidos,

                                 loadingFiltrosPedidos,

                                 clienteId,
                                 setClienteId,
                                 parceirosId, // (não usar) deixei de propósito? -> remova se não precisar
                                 parceiroId,
                                 setParceiroId,
                                 vendedorId,
                                 setVendedorId,

                                 clientesOpts,
                                 parceirosOpts,
                                 vendedoresOpts,
                               }) {
  return (
    <>
      <div className="field col-12 md:col-6">
        <label className="mb-2 block">Período</label>
        <CalendarBR
          value={periodoPedidos}
          onChange={(e) => setPeriodoPedidos(e.value)}
          selectionMode="range"
          placeholder="Selecione um intervalo"
          className="w-full"
        />
        <div className="mt-2 flex gap-2 flex-wrap">
          {presetsPedidos.map((p) => (
            <Button key={p.label} label={p.label} className="p-button-sm p-button-text" onClick={p.action} />
          ))}
        </div>
      </div>

      <div className="field col-12 md:col-6 flex align-items-end justify-content-end">
        {loadingFiltrosPedidos && (
          <div className="flex align-items-center gap-2">
            <ProgressSpinner strokeWidth="4" style={{ width: '22px', height: '22px' }} />
            <small className="text-500">Carregando filtros…</small>
          </div>
        )}
      </div>

      <div className="field col-12 md:col-4">
        <label className="mb-2 block">Cliente</label>
        <Dropdown
          value={clienteId}
          onChange={(e) => setClienteId(e.value)}
          options={clientesOpts}
          placeholder={loadingFiltrosPedidos ? 'Carregando...' : 'Todos'}
          filter
          showClear
          className="w-full"
          disabled={loadingFiltrosPedidos}
        />
      </div>

      <div className="field col-12 md:col-4">
        <label className="mb-2 block">Parceiro</label>
        <Dropdown
          value={parceiroId}
          onChange={(e) => setParceiroId(e.value)}
          options={parceirosOpts}
          placeholder={loadingFiltrosPedidos ? 'Carregando...' : 'Todos'}
          filter
          showClear
          className="w-full"
          disabled={loadingFiltrosPedidos}
        />
      </div>

      <div className="field col-12 md:col-4">
        <label className="mb-2 block">Vendedor</label>
        <Dropdown
          value={vendedorId}
          onChange={(e) => setVendedorId(e.value)}
          options={vendedoresOpts}
          placeholder={loadingFiltrosPedidos ? 'Carregando...' : 'Todos'}
          filter
          showClear
          className="w-full"
          disabled={loadingFiltrosPedidos}
        />
      </div>
    </>
  );
}
