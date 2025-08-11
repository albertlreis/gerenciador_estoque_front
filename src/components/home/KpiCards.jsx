import React from 'react';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { motion } from 'framer-motion';
import {PERFIS} from "../../constants/perfis";

/**
 * Componente de KPIs dinâmicos baseado no perfil do usuário.
 * @param {object} kpis - Dados dos indicadores.
 * @param {string} perfil - "admin" ou "vendedor".
 * @param {Function} setModalKpi - Controla exibição de modais de KPIs.
 * @param {Function} setExibirModalEstoque - Controla exibição do modal de estoque.
 * @param {boolean} loading - Indica se os dados estão carregando.
 */
const KpiCards = ({ kpis, perfil = PERFIS.VENDEDOR.slug, setModalKpi, setExibirModalEstoque, loading }) => {
  if (loading) {
    return (
      <div className="grid mb-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="col-12 md:col-3">
            <Skeleton height="6rem" className="mb-2" borderRadius="16px" />
          </div>
        ))}
      </div>
    );
  }

  const isAdmin = perfil === PERFIS.ADMINISTRADOR.slug;

  const cards = [
    {
      title: 'Pedidos no mês',
      value: kpis.pedidosMes,
      icon: 'pi pi-shopping-cart',
      color: 'blue',
      onClick: isAdmin ? () => setModalKpi?.('pedidos') : undefined
    },
    {
      title: 'Valor vendido',
      value: kpis.valorMes,
      icon: 'pi pi-dollar',
      color: 'green',
      onClick: isAdmin ? () => setModalKpi?.('pedidos') : undefined
    },
    {
      title: 'Clientes únicos',
      value: kpis.clientesUnicos,
      icon: 'pi pi-users',
      color: 'purple',
      onClick: isAdmin ? () => setModalKpi?.('clientes') : undefined
    },
    isAdmin && {
      title: 'Produtos em falta',
      value: kpis.estoqueBaixo,
      icon: 'pi pi-exclamation-triangle',
      color: 'orange',
      onClick: () => setExibirModalEstoque?.(true)
    },
    isAdmin && {
      title: 'Sugestões de outlet',
      value: kpis.outletSugeridos ?? 0,
      icon: 'pi pi-tag',
      color: 'pink',
      onClick: () => setModalKpi?.('sugestoesOutlet')
    },
    {
      title: 'Ticket médio',
      value: kpis.ticketMedio,
      icon: 'pi pi-chart-line',
      color: 'cyan'
    },
    isAdmin && {
      title: 'Confirmados',
      value: kpis.totalConfirmado,
      icon: 'pi pi-check',
      color: 'teal'
    },
    isAdmin && {
      title: 'Cancelados',
      value: kpis.totalCancelado,
      icon: 'pi pi-ban',
      color: 'red'
    }
  ].filter(Boolean);

  return (
    <div className="grid mb-4">
      {cards.map((c, idx) => (
        <div key={idx} className="col-12 md:col-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * idx }}
          >
            <Card
              className={`shadow-2 border-left-4 border-${c.color}-500 cursor-pointer hover:shadow-4`}
              onClick={c.onClick}
            >
              <div className="flex justify-content-between align-items-center" style={{ minHeight: '80px' }}>
                <div>
                  <span className="text-500">{c.title}</span>
                  <div className="text-900 text-xl font-bold">{c.value}</div>
                </div>
                <i className={`${c.icon} text-${c.color}-500 text-3xl`}></i>
              </div>
            </Card>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
