import React from 'react';

export default function LancamentosTotaisCards({ totais }) {
  const money = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="grid mb-3">
      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm">Receitas confirmadas</div>
          <div className="text-2xl font-bold">R$ {money(totais?.receitas_confirmadas)}</div>
        </div>
      </div>

      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm">Despesas confirmadas</div>
          <div className="text-2xl font-bold">R$ {money(totais?.despesas_confirmadas)}</div>
        </div>
      </div>

      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm">Saldo confirmado</div>
          <div className="text-2xl font-bold">R$ {money(totais?.saldo_confirmado)}</div>
        </div>
      </div>

      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-0 shadow-1">
          <div className="text-500 text-sm">Cancelados</div>
          <div className="text-2xl font-bold">{Number(totais?.cancelados || 0)}</div>
        </div>
      </div>
    </div>
  );
}
