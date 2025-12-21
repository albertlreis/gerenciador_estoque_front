export const TIPO = {
  ESTOQUE: 'estoque',
  PEDIDOS: 'pedidos',
  CONSIG: 'consignacoes',
};

export const tiposRelatorio = [
  { label: 'Estoque Atual', value: TIPO.ESTOQUE, icon: 'pi pi-box' },
  { label: 'Pedidos por Período', value: TIPO.PEDIDOS, icon: 'pi pi-shopping-cart' },
  { label: 'Consignações', value: TIPO.CONSIG, icon: 'pi pi-truck' },
];
