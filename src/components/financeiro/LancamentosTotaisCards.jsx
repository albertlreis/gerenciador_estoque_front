import React from 'react';

export default function LancamentosTotaisCards({ totais }) {
  const money = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="grid mb-3">
      <div className="col-12 md:col-4">
        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm">Total Pago</div>
          <div className="text-2xl font-bold">R$ {money(totais?.pago)}</div>
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm">Total Pendente</div>
          <div className="text-2xl font-bold">R$ {money(totais?.pendente)}</div>
        </div>
      </div>
      <div className="col-12 md:col-4">
        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm">Total Atrasado</div>
          <div className="text-2xl font-bold">R$ {money(totais?.atrasado)}</div>
        </div>
      </div>
    </div>
  );
}
