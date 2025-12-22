import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

import CalendarBR from '../../CalendarBR';
import { STATUS_OPTIONS, LOCAIS_REPARO, CUSTO_RESP } from '../../../utils/assistencia';

export function FiltrosAssistencias({
                                      statusAssistencia,
                                      setStatusAssistencia,

                                      periodoAbertura,
                                      setPeriodoAbertura,

                                      periodoConclusao,
                                      setPeriodoConclusao,

                                      locaisReparo,
                                      setLocaisReparo,

                                      custoResp,
                                      setCustoResp,
                                    }) {
  return (
    <>
      <div className="field col-12 md:col-4">
        <label className="mb-2 block">Status</label>
        <Dropdown
          value={statusAssistencia}
          onChange={(e) => setStatusAssistencia(e.value)}
          options={STATUS_OPTIONS}
          placeholder="Todos"
          filter
          showClear
          className="w-full"
        />
      </div>

      <div className="field col-12 md:col-4">
        <label className="mb-2 block">Responsável pelo Custo</label>
        <Dropdown
          value={custoResp}
          onChange={(e) => setCustoResp(e.value)}
          options={CUSTO_RESP}
          placeholder="Todos"
          showClear
          className="w-full"
        />
      </div>

      <div className="field col-12 md:col-4">
        <label className="mb-2 block">Local do Reparo</label>
        <MultiSelect
          value={locaisReparo}
          onChange={(e) => setLocaisReparo(e.value)}
          options={LOCAIS_REPARO}
          placeholder="Selecione..."
          display="chip"
          showClear
          filter
          className="w-full"
          maxSelectedLabels={2}
          selectedItemsLabel="{0} selecionados"
        />
      </div>

      <div className="field col-12 md:col-6">
        <label className="mb-2 block">Período de Abertura</label>
        <CalendarBR
          value={periodoAbertura}
          onChange={(e) => setPeriodoAbertura(e.value)}
          selectionMode="range"
          placeholder="Selecione um intervalo (opcional)"
          className="w-full"
        />
      </div>

      <div className="field col-12 md:col-6">
        <label className="mb-2 block">Período de Conclusão</label>
        <CalendarBR
          value={periodoConclusao}
          onChange={(e) => setPeriodoConclusao(e.value)}
          selectionMode="range"
          placeholder="Selecione um intervalo (opcional)"
          className="w-full"
        />
      </div>
    </>
  );
}
