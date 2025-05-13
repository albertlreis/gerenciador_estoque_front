import React from 'react';
import { Card } from 'primereact/card';

const QuickLinks = ({ hasPermission, navigate }) => {
  const atalhos = [
    { label: 'Catálogo de Produtos', route: '/produtos', permissao: 'ver_produtos', icon: 'pi pi-box' },
    { label: 'Pedidos', route: '/pedidos', permissao: 'ver_pedidos', icon: 'pi pi-dollar' },
    { label: 'Estoque', route: '/estoque', permissao: 'ver_estoque', icon: 'pi pi-inbox' },
  ];

  return (
    <div className="grid mb-4">
      {atalhos.map((item, index) => (
        hasPermission(item.permissao) && (
          <div key={index} className="col-12 md:col-4">
            <Card
              title={item.label}
              className="surface-card shadow-2 border-round cursor-pointer hover:shadow-4"
              onClick={() => navigate(item.route)}
            >
              <div className="flex align-items-center gap-2 text-primary">
                <i className={`${item.icon}`}></i>
                <span>Acessar {item.label}</span>
              </div>
            </Card>
          </div>
        )
      ))}
    </div>
  );
};

export default QuickLinks;
