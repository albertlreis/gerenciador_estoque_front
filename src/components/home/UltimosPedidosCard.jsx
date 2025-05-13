import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

const UltimosPedidosCard = ({ pedidos = [], loading = false, navigate }) => {
  const getStatusSeverity = (status) => {
    switch (status) {
      case 'confirmado':
        return 'success';
      case 'cancelado':
        return 'danger';
      case 'rascunho':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Card title="Últimos Pedidos" className="h-full">
      <div className="max-h-20rem overflow-auto">
        {loading ? (
          <p className="text-center text-500">Carregando...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-center text-500">Nenhum pedido recente.</p>
        ) : (
          <ul className="list-none m-0 p-0">
            {pedidos.map((pedido, idx) => (
              <li
                key={idx}
                className="flex justify-between align-items-center border-bottom-1 border-gray-200 py-2"
              >
                <div className="flex flex-column">
                  <span className="font-semibold text-900">
                    {pedido.cliente || 'Cliente não informado'}
                  </span>
                  <span className="text-600 text-sm">
                    {pedido.valor || 'R$ 0,00'}
                  </span>
                </div>
                <div className="ml-3">
                  <Tag
                    value={pedido.status}
                    severity={getStatusSeverity(pedido.status)}
                    className="text-capitalize"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-content-end mt-3">
        <Button
          label="Ver todos"
          icon="pi pi-arrow-right"
          className="p-button-sm p-button-text"
          onClick={() => navigate('/pedidos')}
        />
      </div>
    </Card>
  );
};

export default UltimosPedidosCard;
