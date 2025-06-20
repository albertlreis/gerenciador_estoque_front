import React, {useEffect, useState, useRef, useCallback} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Accordion, AccordionTab } from 'primereact/accordion';
import SakaiLayout from '../layouts/SakaiLayout';
import api from '../services/apiEstoque';
import ConsignacaoModal from '../components/consignacoes/ConsignacaoModal';
import { PERFIS } from '../constants/perfis';
import { useAuth } from '../context/AuthContext';

const statusOptions = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Comprado', value: 'comprado' },
  { label: 'Devolvido', value: 'devolvido' },
  { label: 'Parcial', value: 'parcial' },
  { label: 'Vencido', value: 'vencido' }
];

const Consignacoes = () => {
  const { user } = useAuth();
  const isAdmin = user?.perfis?.includes(PERFIS.ADMINISTRADOR.slug);

  const [consignacoes, setConsignacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [paginacao, setPaginacao] = useState({ totalRecords: 0, page: 0, rows: 10 });
  const [modalId, setModalId] = useState(null);
  const toast = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [carregado, setCarregado] = useState(false);

  const fetchClientes = async () => {
    try {
      const { data } = await api.get('/consignacoes/clientes');
      setClientes(data.map(c => ({ label: c.nome, value: c.id })));
    } catch {
      toast.current.show({ severity: 'warn', summary: 'Erro', detail: 'Erro ao buscar clientes' });
    }
  };

  const fetchVendedores = async () => {
    try {
      const { data } = await api.get('/consignacoes/vendedores');
      setVendedores(data.map(v => ({ label: v.nome, value: v.id })));
    } catch {
      toast.current.show({ severity: 'warn', summary: 'Erro', detail: 'Erro ao buscar clientes' });
    }
  };

  const fetchConsignacoes = useCallback(
    async ({ page, rows, filtros: overrideFiltros } = {}) => {
      try {
        const paginaAtual = page ?? paginacao.page;
        const linhas = rows ?? paginacao.rows;
        const filtrosAtuais = overrideFiltros ?? filtros;

        const { data } = await api.get('/consignacoes', {
          params: {
            ...filtrosAtuais,
            page: paginaAtual + 1,
            per_page: linhas,
          },
        });

        const atualizadas = data.data.map(c => ({
          ...c,
          status: c.status_calculado ?? c.status
        }));

        setConsignacoes(atualizadas);
        setPaginacao((prev) => ({ ...prev, totalRecords: data.total }));
      } catch (err) {
        toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar consignações' });
      }
    },
    [filtros, paginacao]
  );

  useEffect(() => {
    fetchClientes();
    if (isAdmin) fetchVendedores();
    fetchConsignacoes(); // Busca inicial
  }, []);

  useEffect(() => {
    if (carregado) fetchConsignacoes();
  }, [paginacao]);

  const statusTemplate = (rowData) => {
    const cor = {
      pendente: 'warning',
      comprado: 'success',
      devolvido: 'info',
      vencido: 'danger',
      parcial: 'secondary'
    }[rowData.status] || 'secondary';

    const label = {
      pendente: 'Pendente',
      comprado: 'Comprado',
      devolvido: 'Devolvido',
      vencido: 'Vencido',
      parcial: 'Parcial'
    }[rowData.status] || rowData.status;

    return <Tag value={label} severity={cor} />;
  };

  const onPageChange = (e) => {
    setPaginacao((prev) => ({ ...prev, page: e.page, rows: e.rows }));
    fetchConsignacoes({ page: e.page, rows: e.rows }); // Passa nova página diretamente
  };

  return (
    <SakaiLayout>
      <Toast ref={toast}/>
      <div className="p-4">
        <Accordion className="w-full" activeIndex={expanded ? 0 : null}
                   onTabChange={(e) => setExpanded(e.index !== null)}>
          <AccordionTab header="Filtros de Pesquisa">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPaginacao((prev) => ({ ...prev, page: 0 })); // Reset página
                fetchConsignacoes({ page: 0 }); // Executa busca
              }}
            >
              <div className="p-4 mb-4 surface-0 border-round shadow-1">
                <div className="formgrid grid gap-3">
                  <div className="field col-12 md:col-4 lg:col-3">
                    <label className="block text-600 mb-1">Cliente</label>
                    <Dropdown
                      options={clientes}
                      placeholder="Selecione o cliente"
                      value={filtros.cliente_id || null}
                      onChange={(e) => setFiltros({...filtros, cliente_id: e.value})}
                      className="w-full"
                      showClear
                      filter
                      filterBy="label"
                    />
                  </div>

                  {isAdmin && (
                    <div className="field col-12 md:col-4 lg:col-3">
                      <label className="block text-600 mb-1">Vendedor</label>
                      <Dropdown
                        options={vendedores}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o vendedor"
                        value={filtros.vendedor_id || null}
                        onChange={(e) => setFiltros({...filtros, vendedor_id: e.value})}
                        className="w-full"
                        showClear
                        filter
                        filterBy="label"
                      />
                    </div>
                  )}

                  <div className="field col-12 md:col-4 lg:col-3">
                    <label className="block text-600 mb-1">Status</label>
                    <Dropdown
                      options={statusOptions}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Status"
                      value={filtros.status || null}
                      onChange={(e) => setFiltros({...filtros, status: e.value})}
                      className="w-full"
                      showClear
                      filter
                      filterBy="label"
                    />
                  </div>

                  <div className="field col-6 md:col-3">
                    <label className="block text-600 mb-1">De</label>
                    <Calendar
                      value={filtros.data_ini || null}
                      onChange={(e) => setFiltros({...filtros, data_ini: e.value})}
                      className="w-full"
                      showIcon
                    />
                  </div>

                  <div className="field col-6 md:col-3">
                    <label className="block text-600 mb-1">Até</label>
                    <Calendar
                      value={filtros.data_fim || null}
                      onChange={(e) => setFiltros({...filtros, data_fim: e.value})}
                      className="w-full"
                      showIcon
                    />
                  </div>

                  <div className="field col-12 md:col-6 lg:col-3 flex align-items-end justify-content-end">
                    <div className="flex gap-2 w-full justify-content-end">
                      <Button
                        label="Limpar"
                        icon="pi pi-filter-slash"
                        className="p-button-outlined"
                        severity="secondary"
                        type="button"
                        onClick={() => {
                          const filtrosVazios = {};
                          setFiltros(filtrosVazios);
                          setPaginacao((prev) => ({ ...prev, page: 0 }));
                          fetchConsignacoes({ page: 0, filtros: filtrosVazios });
                        }}
                      />
                      <Button
                        label="Buscar"
                        icon="pi pi-search"
                        type="submit"
                        className="p-button-primary"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </form>
          </AccordionTab>
        </Accordion>

        <h2 className="mb-3">Consignações</h2>

        <DataTable
          value={consignacoes}
          paginator
          rows={paginacao.rows}
          first={paginacao.page * paginacao.rows}
          totalRecords={paginacao.totalRecords}
          onPage={onPageChange}
          lazy
          emptyMessage="Nenhuma consignação encontrada"
        >
          <Column
            header="Nº Pedido"
            body={(row) => row.numero_externo || row.pedido_id}
            style={{minWidth: '120px'}}
          />
          <Column field="cliente_nome" header="Cliente"/>
          <Column field="vendedor_nome" header="Vendedor"/>
          <Column field="data_envio" header="Envio"/>
          <Column field="prazo_resposta" header="Prazo"/>
          <Column
            field="status"
            header="Status Pedido"
            body={statusTemplate}
          />
          <Column
            header="Ações"
            body={(rowData) => (
              <Button
                icon="pi pi-eye"
                severity="info"
                onClick={() => setModalId(rowData.pedido_id)}
                tooltip="Ver detalhes"
              />
            )}
          />
        </DataTable>

        <ConsignacaoModal
          id={modalId}
          visible={!!modalId}
          onHide={() => setModalId(null)}
          onAtualizar={fetchConsignacoes}
        />
      </div>
    </SakaiLayout>
  );
};

export default Consignacoes;
