import React from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import PedidosMesCard from './PedidosMesCard';
import {PERFIS} from "../../constants/perfis";

const ModaisDashboard = ({
                           modalKpi,
                           setModalKpi,
                           pedidosMes,
                           clientesMes,
                           exibirModalEstoque,
                           setExibirModalEstoque,
                           estoqueCritico,
                           perfil
                         }) => {
  const isEstoqueZerado = (produto) => Number(produto.quantidade) === 0;

  return (
    <>
      {perfil === PERFIS.ADMINISTRADOR.slug && (
        <>
          <Dialog
            header="Produtos com Estoque Baixo"
            visible={exibirModalEstoque}
            style={{ width: '60vw' }}
            onHide={() => setExibirModalEstoque(false)}
          >
            <DataTable value={estoqueCritico} responsiveLayout="scroll" emptyMessage="Nenhum produto em falta.">
              <Column field="nome" header="Produto" />
              <Column field="estoque_minimo" header="Estoque Mínimo" />
              <Column field="estoque_atual" header="Quantidade" />
            </DataTable>
          </Dialog>

          <PedidosMesCard
            visible={modalKpi === 'pedidos'}
            onHide={() => setModalKpi(null)}
            pedidos={pedidosMes}
          />

          <Dialog
            header="Clientes com pedidos no mês"
            visible={modalKpi === 'clientes'}
            style={{ width: '40vw' }}
            onHide={() => setModalKpi(null)}
          >
            <DataTable value={clientesMes} responsiveLayout="scroll">
              <Column field="nome" header="Nome" />
              <Column field="email" header="Email" />
            </DataTable>
          </Dialog>
        </>
      )}
    </>
  );
};

export default ModaisDashboard;
