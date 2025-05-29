import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import api from '../services/apiEstoque';
import SakaiLayout from '../layouts/SakaiLayout';
import ConsignacaoModal from '../components/consignacoes/ConsignacaoModal';

const statusOptions = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Aceita', value: 'aceita' },
  { label: 'Devolvida', value: 'devolvida' },
  { label: 'Vencida', value: 'vencida' },
];

const Consignacoes = () => {
  const [consignacoes, setConsignacoes] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [paginacao, setPaginacao] = useState({ totalRecords: 0, page: 0, rows: 10 });
  const [modalId, setModalId] = useState(null);
  const toast = useRef(null);

  const fetchConsignacoes = async () => {
    try {
      const { data } = await api.get('/consignacoes', {
        params: {
          ...filtros,
          data_ini: filtros.data_ini?.toISOString().split('T')[0],
          data_fim: filtros.data_fim?.toISOString().split('T')[0],
          page: paginacao.page + 1,
          per_page: paginacao.rows
        }
      });
      setConsignacoes(data.data);
      setPaginacao(prev => ({ ...prev, totalRecords: data.total }));
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar consignações' });
    }
  };

  useEffect(() => {
    fetchConsignacoes();
  }, [filtros, paginacao.page, paginacao.rows]);

  const statusTemplate = (rowData) => {
    const cor = {
      pendente: 'warning',
      aceita: 'success',
      devolvida: 'info',
      vencida: 'danger'
    }[rowData.status] || 'secondary';

    return <Tag value={rowData.status} severity={cor} />;
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4">
        <h2 className="text-xl mb-4">Consignações</h2>

        <div className="grid mb-3">
          <div className="col-12 md:col-3">
            <InputText
              placeholder="Buscar cliente"
              onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-3">
            <Calendar
              placeholder="De..."
              value={filtros.data_ini}
              onChange={(e) => setFiltros({ ...filtros, data_ini: e.value })}
              className="w-full"
              showIcon
            />
          </div>
          <div className="col-12 md:col-3">
            <Calendar
              placeholder="Até..."
              value={filtros.data_fim}
              onChange={(e) => setFiltros({ ...filtros, data_fim: e.value })}
              className="w-full"
              showIcon
            />
          </div>
          <div className="col-12 md:col-3">
            <Dropdown
              options={statusOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Status"
              className="w-full"
              onChange={(e) => setFiltros({ ...filtros, status: e.value })}
            />
          </div>
        </div>

        <DataTable
          value={consignacoes}
          paginator
          rows={paginacao.rows}
          first={paginacao.page * paginacao.rows}
          totalRecords={paginacao.totalRecords}
          onPage={(e) => setPaginacao({ ...paginacao, page: e.page, rows: e.rows })}
          lazy
          emptyMessage="Nenhuma consignação encontrada"
        >
          <Column field="pedido_id" header="Pedido" sortable />
          <Column field="cliente_nome" header="Cliente" />
          <Column field="produto_nome" header="Produto" />
          <Column field="quantidade" header="Qtd" />
          <Column field="data_envio" header="Envio" />
          <Column field="prazo_resposta" header="Prazo" />
          <Column field="status" header="Status" body={statusTemplate} />
          <Column
            header="Ações"
            body={(rowData) => (
              <Button label="Ver" icon="pi pi-eye" className="p-button-text" onClick={() => setModalId(rowData.id)} />
            )}
          />
        </DataTable>

        <ConsignacaoModal
          id={modalId}
          visible={modalId !== null}
          onHide={() => setModalId(null)}
          onAtualizar={fetchConsignacoes}
        />

      </div>
    </SakaiLayout>
  );
};

export default Consignacoes;
