import React from 'react';

const FiltrosGrafico = ({ periodo, setPeriodo, tipoGrafico, setTipoGrafico, aoAtualizar, carregando }) => (
  <div className="flex flex-wrap align-items-center justify-content-between mb-3 gap-3">
    <div className="flex align-items-center gap-2">
      <label htmlFor="periodo">Período:</label>
      <select
        id="periodo"
        value={periodo}
        onChange={(e) => setPeriodo(Number(e.target.value))}
        className="p-inputtext p-component"
      >
        <option value={3}>3 meses</option>
        <option value={6}>6 meses</option>
        <option value={12}>12 meses</option>
      </select>
    </div>

    <div className="flex align-items-center gap-2">
      <label htmlFor="tipo">Tipo:</label>
      <select
        id="tipo"
        value={tipoGrafico}
        onChange={(e) => setTipoGrafico(e.target.value)}
        className="p-inputtext p-component"
      >
        <option value="bar">Barra</option>
        <option value="line">Linha</option>
      </select>
    </div>

    <button onClick={aoAtualizar} disabled={carregando} className="p-button p-button-sm">
      <i className="pi pi-refresh mr-1" /> Atualizar
    </button>
  </div>
);

export default FiltrosGrafico;
