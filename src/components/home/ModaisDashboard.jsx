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
              <Column field="produto" header="Produto" />
              <Column field="variacao" header="Variação" />
              <Column field="deposito" header="Depósito" />
              <Column
                header="Qtd."
                style={{ width: '100px' }}
                body={(row) => (
                  <div className="flex align-items-center gap-2">
                    <span
                      className={isEstoqueZerado(row) ? 'text-red-600 font-bold' : ''}
                      title={isEstoqueZerado(row) ? 'Produto com estoque zerado!' : ''}
                    >
                      {row.quantidade}
                    </span>
                    {isEstoqueZerado(row) && (
                      <i className="pi pi-exclamation-triangle text-orange-500" title="Estoque zerado"></i>
                    )}
                  </div>
                )}
              />
              <Column
                field="preco"
                header="Preço"
                body={(rowData) => `R$ ${Number(rowData.preco).toFixed(2).replace('.', ',')}`}
              />
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
