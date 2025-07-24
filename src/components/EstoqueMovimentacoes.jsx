import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { format } from 'date-fns';

const EstoqueMovimentacoes = ({ data, loading, total, first, onPage }) => {
  // Remove movimentações que não representam alterações físicas de estoque
  const dataFiltrada = data.filter((row) => row.tipo !== 'consignacao_compra');

  const tipoTemplate = (tipo) => {
    const map = {
      entrada: { label: 'Entrada', icon: 'pi pi-arrow-down', severity: 'success' },
      saida: { label: 'Saída', icon: 'pi pi-arrow-up', severity: 'danger' },
      transferencia: { label: 'Transferência', icon: 'pi pi-refresh', severity: 'info' },
      consignacao_envio: { label: 'Consig. Envio', icon: 'pi pi-send', severity: 'primary' },
      consignacao_devolucao: { label: 'Consig. Devolução', icon: 'pi pi-upload', severity: 'primary' },
    };

    const info = map[tipo] || { label: tipo, icon: '', severity: 'secondary' };

    return (
      <Tag
        value={info.label}
        icon={info.icon}
        severity={info.severity}
        className="text-sm"
      />
    );
  };

  const movimentacaoTemplate = (rowData) => {
    const origem = rowData.deposito_origem_nome;
    const destino = rowData.deposito_destino_nome;
    const tipo = rowData.tipo;

    switch (tipo) {
      case 'entrada':
        return (
          <span className="text-success">
            <i className="pi pi-arrow-down mr-1" />
            Entrada em <strong>{destino || '—'}</strong>
          </span>
        );
      case 'saida':
        return (
          <span className="text-danger">
            <i className="pi pi-arrow-up mr-1" />
            Saída de <strong>{origem || '—'}</strong>
          </span>
        );
      case 'transferencia':
        return (
          <span className="text-primary">
            <i className="pi pi-refresh mr-1" />
            <strong>{origem || '—'}</strong> <i className="pi pi-arrow-right mx-1" /> <strong>{destino || '—'}</strong>
          </span>
        );
      case 'consignacao_envio':
        return (
          <span className="text-primary">
            <i className="pi pi-send mr-1" />
            Saída em consignação de <strong>{origem || '—'}</strong>
          </span>
        );
      case 'consignacao_devolucao':
        return (
          <span className="text-primary">
            <i className="pi pi-upload mr-1" />
            Devolução recebida em <strong>{destino || '—'}</strong>
          </span>
        );
      default:
        return (
          <span>
            <strong>{origem || '—'}</strong> → <strong>{destino || '—'}</strong>
          </span>
        );
    }
  };

  const dataTemplate = (rowData) =>
    rowData.data_movimentacao
      ? format(new Date(rowData.data_movimentacao), 'dd/MM/yyyy')
      : '—';

  return (
    <div className="mb-6">
      <h3 className="mb-3">Movimentações Recentes</h3>
      <DataTable
        value={dataFiltrada}
        loading={loading}
        paginator
        rows={10}
        first={first}
        totalRecords={total}
        onPage={onPage}
        lazy
        responsiveLayout="scroll"
        emptyMessage="Nenhuma movimentação encontrada"
      >
        <Column header="Data" body={dataTemplate} />
        <Column field="produto_nome" header="Produto" />
        <Column header="Movimentação" body={movimentacaoTemplate} />
        <Column header="Tipo" body={(row) => tipoTemplate(row.tipo)} />
        <Column field="quantidade" header="Quantidade" />
      </DataTable>
    </div>
  );
};

export default EstoqueMovimentacoes;
