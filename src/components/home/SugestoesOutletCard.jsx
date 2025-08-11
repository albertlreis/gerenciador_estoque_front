import React from 'react';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const SugestoesOutletCard = ({ sugestoes = [], loading = false, diasLimite = null, onIrParaProduto }) => {
  return (
    <Card className="shadow-2">
      <div className="flex align-items-center justify-content-between mb-3">
        <div className="text-xl font-semibold">Sugestões de Outlet</div>
        {diasLimite !== null && (
          <Tag severity="info" value={`${diasLimite}+ dias em estoque`} />
        )}
      </div>

      {loading ? (
        <div className="flex flex-column gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} height="2.2rem" borderRadius="12px" />)}
        </div>
      ) : sugestoes.length === 0 ? (
        <div className="text-600">Nenhuma sugestão no momento.</div>
      ) : (
        <ul className="list-none p-0 m-0">
          {sugestoes.map((p) => (
            <li key={p.id} className="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
              <div className="flex flex-column">
                <span className="text-900 font-medium">{p.nome ?? p.nome_produto}</span>
                <span className="text-600 text-sm">
                  {p.dias_em_estoque ?? p.dias_sem_movimentacao ?? '-'} dias • qtd {p.quantidade_total ?? p.quantidade ?? '-'}
                </span>
              </div>
              <div className="flex gap-2">
                {p.eh_outlet ? (
                  <Tag severity="success" value="Já é outlet" />
                ) : (
                  <Button
                    label="Marcar como outlet"
                    size="small"
                    icon="pi pi-tag"
                    onClick={() => onIrParaProduto?.(p)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default SugestoesOutletCard;
