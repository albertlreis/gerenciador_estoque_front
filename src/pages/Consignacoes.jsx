import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import SakaiLayout from '../layouts/SakaiLayout';
import api from '../services/apiEstoque';

const Consignacoes = () => {
  const [consignacoes, setConsignacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

  useEffect(() => {
    carregarConsignacoes();
  }, []);

  const carregarConsignacoes = async () => {
    try {
      const { data } = await api.get('/consignacoes');
      setConsignacoes(data);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar consignações' });
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (consignacao, status) => {
    try {
      await api.patch(`/consignacoes/${consignacao.id}`, { status });
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Status atualizado' });
      carregarConsignacoes();
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar status' });
    }
  };

  const confirmarAtualizacao = (e, consignacao, status) => {
    confirmPopup({
      target: e.currentTarget,
      message: `Confirmar ${status}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => atualizarStatus(consignacao, status),
    });
  };

  const statusTemplate = (rowData) => (
    <Tag
      value={rowData.status}
      severity={
        rowData.status === 'pendente' ? 'warning' :
          rowData.status === 'comprado' ? 'success' : 'danger'
      }
    />
  );

  const acoesTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        label="Confirmar Compra"
        icon="pi pi-check"
        severity="success"
        onClick={(e) => confirmarAtualizacao(e, rowData, 'comprado')}
        disabled={rowData.status !== 'pendente'}
      />
      <Button
        label="Registrar Devolução"
        icon="pi pi-undo"
        severity="danger"
        onClick={(e) => confirmarAtualizacao(e, rowData, 'devolvido')}
        disabled={rowData.status !== 'pendente'}
      />
    </div>
  );

  return (
    <SakaiLayout>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Gestão de Consignações</h2>
        <Toast ref={toast} />
        <ConfirmPopup />
        <DataTable value={consignacoes} loading={loading} paginator rows={10} responsiveLayout="scroll">
          <Column field="id" header="ID" style={{ width: '5%' }} />
          <Column field="pedido_id" header="Pedido" />
          <Column field="produto_variacao.nome" header="Variação" />
          <Column field="quantidade" header="Qtd" />
          <Column field="data_envio" header="Envio" />
          <Column field="prazo_resposta" header="Prazo" />
          <Column header="Status" body={statusTemplate} />
          <Column header="Ações" body={acoesTemplate} />
        </DataTable>
      </div>
    </SakaiLayout>
  );
};

export default Consignacoes;
