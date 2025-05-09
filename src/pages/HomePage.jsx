import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Chart } from 'primereact/chart';
import { Box, DollarSign, LogOut, Bell } from 'lucide-react';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';
import { useAuth } from '../context/AuthContext';
import apiAuth from "../services/apiAuth";

const HomePage = () => {
  const navigate = useNavigate();
  const { logout, user, hasPermission } = useAuth();

  const [salesData, setSalesData] = useState({});
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [avisos, setAvisos] = useState([
    'Fechamento de caixa até às 17h',
    'Sistema será atualizado amanhã às 22h',
  ]);

  useEffect(() => {
    fetchEstatisticas();
    fetchUltimosPedidos();
  }, []);

  const fetchEstatisticas = async () => {
    try {
      const response = await apiEstoque.get('/pedidos/estatisticas');
      const { labels, valores } = response.data;

      setSalesData({
        labels,
        datasets: [
          {
            label: 'Pedidos',
            data: valores,
            backgroundColor: '#42A5F5',
          },
        ],
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchUltimosPedidos = async () => {
    try {
      const response = await apiEstoque.get('/pedidos', {
        params: { limite: 5, ordenarPor: 'data_pedido', ordem: 'desc' },
      });

      const pedidosFormatados = response.data.map((pedido) => ({
        cliente: pedido.cliente?.nome || 'Cliente não informado',
        valor: `R$ ${pedido.total?.toFixed(2) || '0,00'}`,
        status: pedido.status,
      }));

      setUltimosPedidos(pedidosFormatados);
    } catch (error) {
      console.error('Erro ao buscar últimos pedidos:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiAuth.post('/logout');
    } catch {}
    logout();
    navigate('/login', { replace: true });
  };

  const atalhos = [
    { label: 'Catálogo de Produtos', route: '/produtos', permissao: 'ver_produtos', icon: <Box className="mr-2" size={20} /> },
    { label: 'Pedidos', route: '/pedidos', permissao: 'ver_pedidos', icon: <DollarSign className="mr-2" size={20} /> },
    { label: 'Estoque', route: '/estoque', permissao: 'ver_estoque', icon: <Box className="mr-2" size={20} /> },
  ];

  return (
    <SakaiLayout>
      <div className="p-4">
        <div className="flex align-items-center justify-content-between mb-4">
          <div className="flex align-items-center gap-3">
            <Avatar icon="pi pi-user" shape="circle" />
            <div>
              <h2 className="m-0">Bem-vindo, {user?.nome}</h2>
              <Tag value={user?.email} severity="info" />
            </div>
          </div>
          <Button
            icon={<LogOut size={18} />}
            label="Sair"
            onClick={handleLogout}
            className="p-button-danger"
          />
        </div>

        <Divider />

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
            <Card title="Pedidos por Mês">
              <Chart type="bar" data={salesData} />
            </Card>
          </div>

          <div className="col-12 md:col-6">
            <Card title="Últimos Pedidos">
              <ul className="m-0 p-0 list-none">
                {ultimosPedidos.map((pedido, idx) => (
                  <li key={idx} className="mb-2">
                    <strong>{pedido.cliente}</strong> — {pedido.valor} ({pedido.status})
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="col-12">
            <Card title="Avisos Importantes" className="bg-yellow-50">
              <ul className="m-0 p-0 list-none">
                {avisos.map((aviso, idx) => (
                  <li key={idx} className="mb-2 flex align-items-center">
                    <Bell className="mr-2 text-yellow-600" size={16} /> {aviso}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </SakaiLayout>
  );
};

export default HomePage;
