import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const FinalizarPedidoSkeleton = () => {
  return (
    <div className="grid p-4 gap-4">
      {/* Coluna esquerda */}
      <div className="col-12 md:col-8">
        <Skeleton height="2rem" className="mb-4" />

        {/* Dropdowns */}
        <div className="grid gap-3 mb-4">
          <div className="col-12 md:col-6">
            <Skeleton height="3.5rem" className="w-full" />
          </div>
          <div className="col-12 md:col-6">
            <Skeleton height="3.5rem" className="w-full" />
          </div>
          <div className="col-12 md:col-6">
            <Skeleton height="3.5rem" className="w-full" />
          </div>
        </div>

        {/* Campo prazo consignação */}
        <Skeleton height="2rem" width="12rem" className="mb-2" />
        <Skeleton height="3.5rem" className="mb-4" />

        {/* Campo observações */}
        <Skeleton height="2rem" width="12rem" className="mb-2" />
        <Skeleton height="6rem" className="mb-4" />

        {/* Título itens */}
        <Skeleton height="2rem" width="12rem" className="mb-3" />

        {/* Itens do pedido (simulados) */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border rounded p-3 mb-3 bg-white">
            <div className="grid">
              <div className="col-12 md:col-3">
                <Skeleton height="6rem" className="w-full" />
              </div>
              <div className="col-12 md:col-9">
                <Skeleton width="60%" height="1.5rem" className="mb-2" />
                <Skeleton width="90%" height="1rem" className="mb-2" />
                <Skeleton width="40%" height="2rem" className="mb-2" />
                <Skeleton width="60%" height="2rem" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coluna direita (resumo) */}
      <div className="col-12 md:col-4">
        <div className="shadow-2 rounded p-4 bg-white sticky top-4">
          <Skeleton height="2rem" className="mb-3" width="50%" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="2rem" className="mb-3" />
          <Skeleton height="2.5rem" className="mb-2" />
          <Skeleton height="2.5rem" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
      </div>
    </div>
  );
};

export default FinalizarPedidoSkeleton;
