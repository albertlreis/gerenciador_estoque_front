import React from 'react';
import { Menubar } from 'primereact/menubar';

// Exemplo de menu específico para páginas de produtos
const ProdutoLayout = ({ children }) => {
  const items = [
    {
      label: 'Produtos',
      icon: 'pi pi-box',
      command: () => { window.location.href = '/produtos'; }
    },
    {
      label: 'Estoque',
      icon: 'pi pi-calendar',
      command: () => { window.location.href = '/estoque'; }
    },
    {
      label: 'Movimentações',
      icon: 'pi pi-exchange',
      command: () => { window.location.href = '/movimentacoes'; }
    },
  ];

  return (
    <div>
      <Menubar model={items} className="p-shadow-3" />
      <main className="p-m-3">
        {children}
      </main>
    </div>
  );
};

export default ProdutoLayout;
