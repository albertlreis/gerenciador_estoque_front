import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Box, DollarSign, LogOut, Bell } from 'lucide-react';

import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import apiAuth from '../services/apiAuth';
import { useAuth } from '../context/AuthContext';
import OverlayLoading from "../components/OverlayLoading";
import { getGravatarUrl, getInitials } from '../utils/gravatar';

const HomePage = () => {
  const navigate = useNavigate();
  const { logout, user, hasPermission } = useAuth();

  const [salesData, setSalesData] = useState({});
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [kpis, setKpis] = useState({
    pedidosMes: 0,
    valorMes: 'R$ 0,00',
    clientesUnicos: 0,
    estoqueBaixo: 0,
    ticketMedio: 'R$ 0,00',
  });
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [exibirModalEstoque, setExibirModalEstoque] = useState(false);
  const [avisos, setAvisos] = useState([
    'Fechamento de caixa até às 17h',
    'Sistema será atualizado amanhã às 22h',
  ]);

  const [modalKpi, setModalKpi] = useState(null);
  const [pedidosMes, setPedidosMes] = useState([]);
  const [clientesMes, setClientesMes] = useState([]);

  const [periodo, setPeriodo] = useState(6);
  const [tipoGrafico, setTipoGrafico] = useState('bar');
  const [carregandoGrafico, setCarregandoGrafico] = useState(false);

  const [graficoStatus, setGraficoStatus] = useState(null);
  const [carregandoStatus, setCarregandoStatus] = useState(false);

  const [carregandoPagina, setCarregandoPagina] = useState(true);

  useEffect(() => {
    const carregarTudo = async () => {
      try {
        setCarregandoPagina(true);
        await Promise.all([
          fetchEstatisticas(),
          fetchUltimosPedidos(),
          fetchKpis(),
          fetchEstoqueBaixo(),
          fetchGraficoStatus()
        ]);
      } finally {
        setCarregandoPagina(false);
      }
    };

    carregarTudo();
  }, []);

  const [graficoPedidos, setGraficoPedidos] = useState({});
  const [graficoValores, setGraficoValores] = useState({});

  const fetchEstatisticas = async () => {
    try {
      setCarregandoGrafico(true);

      const response = await apiEstoque.get('/pedidos/estatisticas', {
        params: { meses: 6 }
      });

      const { labels, quantidades, valores } = response.data;

      setGraficoPedidos({
        labels,
        datasets: [
          {
            label: 'Qtd. Pedidos',
            data: quantidades,
            backgroundColor: '#42A5F5',
          },
        ],
      });

      setGraficoValores({
        labels,
        datasets: [
          {
            label: 'Valor Acumulado',
            data: valores,
            backgroundColor: '#66BB6A',
          },
        ],
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setCarregandoGrafico(false);
    }
  };

  const fetchUltimosPedidos = async () => {
    try {
      const response = await apiEstoque.get('/pedidos', {
        params: {
          page: 1,
          per_page: 5,
          ordenarPor: 'data_pedido',
          ordem: 'desc',
        },
      });

      const pedidos = response.data.data || [];

      const pedidosFormatados = pedidos.map((pedido) => ({
        cliente: pedido.cliente?.nome || 'Cliente não informado',
        valor: `R$ ${Number(pedido.valor_total || 0).toFixed(2).replace('.', ',')}`,
        status: pedido.status,
      }));

      setUltimosPedidos(pedidosFormatados);
    } catch (error) {
      console.error('Erro ao buscar últimos pedidos:', error);
    }
  };

  const fetchGraficoStatus = async () => {
    try {
      setCarregandoStatus(true);
      const response = await apiEstoque.get('/pedidos', {
        params: {
          page: 1,
          per_page: 200,
          ordenarPor: 'data_pedido',
          ordem: 'desc',
        },
      });

      const pedidos = response.data.data || [];

      const contagem = pedidos.reduce((acc, p) => {
        const status = p.status || 'outros';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const labels = Object.keys(contagem);
      const valores = Object.values(contagem);

      setGraficoStatus({
        labels,
        datasets: [
          {
            data: valores,
            backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c', '#95a5a6'],
          },
        ],
      });
    } catch (err) {
      console.error('Erro ao buscar gráfico por status:', err);
    } finally {
      setCarregandoStatus(false);
    }
  };

  const fetchKpis = async () => {
    try {
      const response = await apiEstoque.get('/pedidos', {
        params: {
          page: 1,
          per_page: 100,
          ordenarPor: 'data_pedido',
          ordem: 'desc',
        },
      });

      const pedidos = response.data.data || [];
      const doMes = pedidos.filter(p => {
        if (!p.data) return false;
        return new Date(p.data).getMonth() === new Date().getMonth();
      });

      const totalPedidos = doMes.length;
      const valorTotal = doMes.reduce((soma, p) => soma + Number(p.valor_total || 0), 0);
      const clientes = new Set(doMes.map(p => p.cliente?.id)).size;

      setKpis(prev => ({
        ...prev,
        pedidosMes: totalPedidos,
        valorMes: valorTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        clientesUnicos: clientes,
        ticketMedio: totalPedidos > 0
          ? (valorTotal / totalPedidos).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
          : 'R$ 0,00',
      }));
    } catch (error) {
      console.error('Erro ao calcular KPIs:', error);
    }
  };

  const carregarDetalhesKpi = async (tipo) => {
    try {
      const response = await apiEstoque.get('/pedidos', {
        params: {
          page: 1,
          per_page: 100,
          ordenarPor: 'data_pedido',
          ordem: 'desc',
        },
      });

      const todos = response.data.data || [];
      const mesAtual = new Date().getMonth();

      if (tipo === 'pedidos') {
        const pedidos = todos.filter(p => p.data && new Date(p.data).getMonth() === mesAtual);
        setPedidosMes(pedidos);
        setModalKpi('pedidos');
      }

      if (tipo === 'clientes') {
        const clientes = todos
          .filter(p => p.cliente && p.data && new Date(p.data).getMonth() === mesAtual)
          .map(p => p.cliente);

        const únicos = clientes.reduce((acc, c) => {
          if (!acc.find(i => i.id === c.id)) acc.push(c);
          return acc;
        }, []);
        setClientesMes(únicos);
        setModalKpi('clientes');
      }
    } catch (err) {
      console.error('Erro ao carregar dados do KPI:', err);
    }
  };


  const fetchEstoqueBaixo = async () => {
    try {
      const response = await apiEstoque.get('/produtos/estoque-baixo', {
        params: { limite: 5 },
      });
      const produtos = response.data;
      setEstoqueCritico(produtos);
      setKpis(prev => ({
        ...prev,
        estoqueBaixo: produtos.length,
      }));
    } catch (err) {
      console.error('Erro ao buscar estoque baixo:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await apiAuth.post('/logout');
    } catch {}
    logout();
    navigate('/login', { replace: true });
  };

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

  const atalhos = [
    { label: 'Catálogo de Produtos', route: '/produtos', permissao: 'ver_produtos', icon: <Box className="mr-2" size={20} /> },
    { label: 'Pedidos', route: '/pedidos', permissao: 'ver_pedidos', icon: <DollarSign className="mr-2" size={20} /> },
    { label: 'Estoque', route: '/estoque', permissao: 'ver_estoque', icon: <Box className="mr-2" size={20} /> },
  ];

  const isEstoqueZerado = (produto) => Number(produto.quantidade) === 0;

  return (
    <OverlayLoading visible={carregandoPagina} message="Carregando painel...">
      <SakaiLayout>
        <div className="p-4">
          <div className="flex align-items-center justify-content-between mb-4">
            <div className="flex align-items-center gap-3">
              <Avatar
                image={getGravatarUrl(user?.email)}
                label={getInitials(user?.nome)}
                shape="circle"
                size="large"
                style={{ backgroundColor: '#dfe7fd', color: '#2e3a59' }}
                className="mr-2"
              />
              <div>
                <h2 className="m-0">Bem-vindo, {user?.nome}</h2>
                <Tag value={user?.email} severity="info"/>
              </div>
            </div>
            <Button
              icon={<LogOut size={18}/>}
              label="Sair"
              onClick={handleLogout}
              className="p-button-danger"
            />
          </div>

          <div className="grid mb-4">
            <div className="col-12 md:col-3">
              <Card className="shadow-2 border-left-4 border-blue-500 cursor-pointer hover:shadow-4"
                    onClick={() => carregarDetalhesKpi('pedidos')}>
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <span className="text-500">Pedidos no mês</span>
                    <div className="text-900 text-xl font-bold">{kpis.pedidosMes}</div>
                  </div>
                  <i className="pi pi-shopping-cart text-blue-500 text-3xl"></i>
                </div>
              </Card>
            </div>

            <div className="col-12 md:col-3">
              <Card className="shadow-2 border-left-4 border-green-500 cursor-pointer hover:shadow-4"
                    onClick={() => carregarDetalhesKpi('pedidos')}>
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <span className="text-500">Valor vendido</span>
                    <div className="text-900 text-xl font-bold">{kpis.valorMes}</div>
                  </div>
                  <i className="pi pi-dollar text-green-500 text-3xl"></i>
                </div>
              </Card>
            </div>

            <div className="col-12 md:col-3">
              <Card className="shadow-2 border-left-4 border-purple-500 cursor-pointer hover:shadow-4"
                    onClick={() => carregarDetalhesKpi('clientes')}>
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <span className="text-500">Clientes únicos</span>
                    <div className="text-900 text-xl font-bold">{kpis.clientesUnicos}</div>
                  </div>
                  <i className="pi pi-users text-purple-500 text-3xl"></i>
                </div>
              </Card>
            </div>
            <div className="col-12 md:col-3">
              <Card
                className="shadow-2 border-left-4 border-orange-500 cursor-pointer hover:shadow-4"
                onClick={() => setExibirModalEstoque(true)}
              >
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <span className="text-500">Produtos em falta</span>
                    <div className="text-900 text-xl font-bold">{kpis.estoqueBaixo}</div>
                  </div>
                  <i className="pi pi-exclamation-triangle text-orange-500 text-3xl"></i>
                </div>
              </Card>
            </div>
          </div>

          <div className="col-12 md:col-3">
            <Card className="shadow-2 border-left-4 border-cyan-500">
              <div className="flex justify-content-between align-items-center">
                <div>
                  <span className="text-500">Ticket médio</span>
                  <div className="text-900 text-xl font-bold">{kpis.ticketMedio}</div>
                </div>
                <i className="pi pi-chart-line text-cyan-500 text-3xl"></i>
              </div>
            </Card>
          </div>


          <Divider/>

          <div className="grid mb-4">
            {atalhos.map((item, index) =>
              hasPermission(item.permissao) ? (
                <div key={index} className="col-12 md:col-4">
                  <Card
                    title={item.label}
                    className="surface-card shadow-2 border-round cursor-pointer hover:shadow-4"
                    onClick={() => navigate(item.route)}
                  >
                    <div className="flex align-items-center gap-2 text-primary">
                      {item.icon}
                      <span>Acessar {item.label}</span>
                    </div>
                  </Card>
                </div>
              ) : null
            )}
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
              <Card title="Pedidos por Mês" className="mb-4">
                <div className="flex flex-wrap align-items-center justify-content-between mb-3 gap-3">
                  <div className="flex align-items-center gap-2">
                    <label htmlFor="periodo">Período:</label>
                    <select
                      id="periodo"
                      value={periodo}
                      onChange={(e) => setPeriodo(Number(e.target.value))}
                      className="p-inputtext p-component"
                    >
                      <option value={3}>3 meses</option>
                      <option value={6}>6 meses</option>
                      <option value={12}>12 meses</option>
                    </select>
                  </div>

                  <div className="flex align-items-center gap-2">
                    <label htmlFor="tipo">Tipo:</label>
                    <select
                      id="tipo"
                      value={tipoGrafico}
                      onChange={(e) => setTipoGrafico(e.target.value)}
                      className="p-inputtext p-component"
                    >
                      <option value="bar">Barra</option>
                      <option value="line">Linha</option>
                    </select>
                  </div>

                  <Button
                    label="Atualizar"
                    icon="pi pi-refresh"
                    onClick={fetchEstatisticas}
                    className="p-button-sm"
                    disabled={carregandoGrafico}
                  />
                </div>

                {carregandoGrafico ? (
                  <div className="flex justify-content-center py-4">
                    <i className="pi pi-spin pi-spinner text-2xl text-primary"></i>
                  </div>
                ) : (
                  <Chart type="bar" data={graficoPedidos} />
                )}
              </Card>

              <Card title="Faturamento por Mês">
                <Chart type="line" data={graficoValores} />
              </Card>

            </div>

            <div className="col-12 md:col-6">
              <Card title="Distribuição por Status">
                {carregandoStatus ? (
                  <div className="flex justify-content-center py-4">
                    <i className="pi pi-spin pi-spinner text-2xl text-primary"></i>
                  </div>
                ) : graficoStatus ? (
                  <Chart type="pie" data={graficoStatus}/>
                ) : (
                  <p className="text-center text-500">Sem dados disponíveis.</p>
                )}
              </Card>
            </div>

            <div className="col-12 md:col-6">
              <Card title="Últimos Pedidos">
                <div className="max-h-20rem overflow-auto">
                  {ultimosPedidos.length === 0 ? (
                    <p className="text-center text-500">Nenhum pedido recente.</p>
                  ) : (
                    <ul className="list-none m-0 p-0">
                      {ultimosPedidos.map((pedido, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between align-items-center border-bottom-1 border-gray-200 py-2"
                        >
                          <div>
                            <span className="font-semibold">{pedido.cliente}</span>
                            <small className="block text-600">{pedido.valor}</small>
                          </div>
                          <Tag
                            value={pedido.status}
                            severity={getStatusSeverity(pedido.status)}
                            className="text-capitalize"
                          />
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
            </div>

            <div className="col-12">
              <Card title="Avisos Importantes" className="bg-yellow-50">
                <div className="max-h-20rem overflow-auto">
                  {avisos.length === 0 ? (
                    <p className="text-center text-700">Nenhum aviso no momento.</p>
                  ) : (
                    <ul className="list-none m-0 p-0">
                      {avisos.map((aviso, idx) => (
                        <li
                          key={idx}
                          className="flex align-items-start border-bottom-1 border-yellow-300 py-2"
                        >
                          <Bell className="mr-2 text-yellow-600 mt-1" size={16}/>
                          <span className="text-800">{aviso}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <Dialog
            header="Produtos com Estoque Baixo"
            visible={exibirModalEstoque}
            style={{width: '60vw'}}
            onHide={() => setExibirModalEstoque(false)}
          >
            <DataTable value={estoqueCritico} responsiveLayout="scroll" emptyMessage="Nenhum produto em falta.">
              <Column field="produto" header="Produto"/>
              <Column field="variacao" header="Variação"/>
              <Column field="deposito" header="Depósito"/>
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

          <Dialog
            header="Pedidos do mês"
            visible={modalKpi === 'pedidos'}
            style={{width: '60vw'}}
            onHide={() => setModalKpi(null)}
          >
            <DataTable value={pedidosMes} responsiveLayout="scroll">
              <Column field="cliente.nome" header="Cliente"/>
              <Column field="valor_total" header="Valor" body={(row) => `R$ ${Number(row.valor_total).toFixed(2)}`}/>
              <Column field="status" header="Status"/>
              <Column field="data" header="Data"/>
            </DataTable>
          </Dialog>

          <Dialog
            header="Clientes com pedidos no mês"
            visible={modalKpi === 'clientes'}
            style={{width: '40vw'}}
            onHide={() => setModalKpi(null)}
          >
            <DataTable value={clientesMes} responsiveLayout="scroll">
              <Column field="nome" header="Nome"/>
              <Column field="email" header="Email"/>
            </DataTable>
          </Dialog>

        </div>
      </SakaiLayout>
    </OverlayLoading>
  );
};

export default HomePage;
