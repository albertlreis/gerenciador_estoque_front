import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import SakaiLayout from '../layouts/SakaiLayout';

import apiEstoque from '../services/apiEstoque';

const ProdutosOutlet = () => {
  const [produtos, setProdutos] = useState([]);
  const toast = useRef(null);

  const carregarProdutos = async () => {
    try {
      const { data } = await apiEstoque.get('/produtos/outlet');
      setProdutos(data);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro ao carregar produtos',
        detail: err.response?.data?.message || err.message,
        life: 3000
      });
    }
  };

  const removerOutlet = async (produtoId) => {
    try {
      await apiEstoque.patch(`/produtos/${produtoId}/remover-outlet`);
      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Produto removido do Outlet',
        life: 3000
      });
      carregarProdutos();
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro ao remover outlet',
        detail: err.response?.data?.message || err.message,
        life: 3000
      });
    }
  };

  const outletBody = () => <Tag value="Outlet" severity="warning" />;
  const actionBody = (rowData) => (
    <Button
      icon="pi pi-times"
      className="p-button-danger"
      tooltip="Remover do Outlet"
      onClick={() => removerOutlet(rowData.id)}
    />
  );

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="produtos-outlet" style={{ margin: '2rem' }}>
        <h2>Produtos Outlet</h2>
        <Divider />
        <DataTable value={produtos} paginator rows={10} dataKey="id" stripedRows responsiveLayout="scroll">
          <Column field="id" header="ID" sortable />
          <Column field="nome" header="Nome" sortable />
          <Column header="Status" body={outletBody} />
          <Column header="Ação" body={actionBody} />
        </DataTable>
      </div>
    </SakaiLayout>
  );
};

export default ProdutosOutlet;
