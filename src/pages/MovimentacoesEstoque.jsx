import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import apiEstoque from '../services/apiEstoque';
import SakaiLayout from '../layouts/SakaiLayout';

const MovimentacoesEstoque = () => {
  const LOCAL_STORAGE_KEY = 'filtros_movimentacoes_estoque';

  const toast = useRef(null);
  const [searchParams] = useSearchParams();

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [estoqueAtual, setEstoqueAtual] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    totalPecas: 0,
    totalDepositos: 0,
  });

  const [filtros, setFiltros] = useState({
    tipo: null,
    deposito: null,
    produto: '',
    periodo: null,
  });

  const tipos = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Saída', value: 'saida' },
  ];

  useEffect(() => {
    const depositoId = searchParams.get('deposito');
    const savedFilters = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedFilters) {
      setFiltros(JSON.parse(savedFilters));
    } else if (depositoId) {
      setFiltros((prev) => ({ ...prev, deposito: parseInt(depositoId) }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDepositos();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const formatDate = (d) =>
        d instanceof Date ? d.toISOString().split('T')[0] : null;

      const filtroParams = {
        ...filtros,
        periodo:
          filtros.periodo?.length === 2 && filtros.periodo[1]
            ? [formatDate(filtros.periodo[0]), formatDate(filtros.periodo[1])]
            : null,
      };

      const [movsRes, estoqueRes, resumoRes] = await Promise.all([
        apiEstoque.get('/estoque/movimentacoes', { params: filtroParams }),
        apiEstoque.get('/estoque/atual'),
        apiEstoque.get('/estoque/resumo'),
      ]);

      setMovimentacoes(movsRes.data);
      setEstoqueAtual(estoqueRes.data);
      setResumo(resumoRes.data);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar dados de estoque',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositos = async () => {
    try {
      const res = await apiEstoque.get('/depositos');
      setDepositos(res.data.map((dep) => ({ label: dep.nome, value: dep.id })));
    } catch (err) {
      console.error('Erro ao carregar depósitos');
    }
  };

  const tipoTemplate = (tipo) => (
    <Tag value={tipo} severity={tipo === 'entrada' ? 'success' : 'danger'} />
  );

  const quantidadeTemplate = (rowData) => (
    <span className={rowData.quantidade <= 5 ? 'text-red-500 font-bold' : ''}>
      {rowData.quantidade}
    </span>
  );

  const verMovimentacoes = (produtoId) => {
    window.location.href = `/produtos/${produtoId}/movimentacoes`;
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Estoque e Movimentações</h2>
        </div>

        {/* Filtros */}
        <div className="grid mb-4 gap-3">
          <div className="col-12 md:col-3">
            <Dropdown
              value={filtros.tipo}
              options={tipos}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.value })}
              placeholder="Filtrar por tipo"
              showClear
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-3">
            <Dropdown
              value={filtros.deposito}
              options={depositos}
              onChange={(e) => setFiltros({ ...filtros, deposito: e.value })}
              placeholder="Filtrar por depósito"
              showClear
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-3">
            <InputText
              value={filtros.produto}
              onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
              placeholder="Buscar produto"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-3">
            <Calendar
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.value })}
              selectionMode="range"
              placeholder="Filtrar por período"
              showIcon
              readOnlyInput
              className="w-full"
            />
          </div>
          <div className="col-12 flex justify-end gap-2">
            <Button
              label="Filtrar"
              icon="pi pi-search"
              onClick={() => {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtros));
                fetchDados();
              }}
            />
            <Button
              label="Limpar"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={() => {
                const reset = { tipo: null, deposito: null, produto: '', periodo: null };
                setFiltros(reset);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                fetchDados();
              }}
            />
          </div>
        </div>

        {/* Resumo de estoque */}
        <div className="grid mb-4">
          <div className="col-12 md:col-4">
            <Card title="Produtos" className="text-center">
              <h3>{resumo.totalProdutos}</h3>
            </Card>
          </div>
          <div className="col-12 md:col-4">
            <Card title="Peças em Estoque" className="text-center">
              <h3>{resumo.totalPecas}</h3>
            </Card>
          </div>
          <div className="col-12 md:col-4">
            <Card title="Depósitos Ativos" className="text-center">
              <h3>{resumo.totalDepositos}</h3>
            </Card>
          </div>
        </div>

        {/* Estoque atual agrupado */}
        <div className="mb-5">
          <h3 className="mb-3">Estoque Atual por Produto e Depósito</h3>
          <DataTable
            value={estoqueAtual}
            loading={loading}
            rowGroupMode="subheader"
            groupField="produto_nome"
            responsiveLayout="scroll"
            emptyMessage="Nenhum item em estoque"
            sortField="produto_nome"
            sortOrder={1}
          >
            <Column
              field="produto_nome"
              header="Produto"
              rowGroup
              body={(rowData) => rowData.produto_nome}
            />
            <Column field="deposito_nome" header="Depósito" />
            <Column field="quantidade" header="Quantidade" body={quantidadeTemplate} />
            <Column
              header="Ações"
              body={(rowData) => (
                <Button
                  icon="pi pi-eye"
                  tooltip="Ver movimentações"
                  className="p-button-sm"
                  onClick={() => verMovimentacoes(rowData.produto_id)}
                />
              )}
            />
          </DataTable>
        </div>

        {/* Movimentações recentes */}
        <div className="mb-6">
          <h3 className="mb-3">Movimentações Recentes</h3>
          <DataTable
            value={movimentacoes}
            loading={loading}
            paginator
            rows={10}
            responsiveLayout="scroll"
            emptyMessage="Nenhuma movimentação encontrada"
          >
            <Column field="data_movimentacao" header="Data" />
            <Column field="produto_nome" header="Produto" />
            <Column
              header="Depósitos"
              body={(rowData) =>
                `${rowData.deposito_origem_nome || '—'} → ${rowData.deposito_destino_nome || '—'}`
              }
            />
            <Column field="tipo" header="Tipo" body={(row) => tipoTemplate(row.tipo)} />
            <Column field="quantidade" header="Quantidade" />
            <Column field="usuario_nome" header="Usuário" />
          </DataTable>
        </div>

      </div>
    </SakaiLayout>
  );
};

export default MovimentacoesEstoque;
