import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { ConfirmPopup } from "primereact/confirmpopup";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import SakaiLayout from '../layouts/SakaiLayout';

import FinanceiroApi from "../api/financeiroApi";
import { useAuth } from "../context/AuthContext";
import { PERMISSOES } from "../constants/permissoes";

import FiltroContasReceber from "../components/contasReceber/FiltroContasReceber";
import KpiContasReceber from "../components/contasReceber/KpiContasReceber";
import TabelaContasReceber from "../components/contasReceber/TabelaContasReceber";
import DialogBaixaReceber from "../components/contasReceber/DialogBaixaReceber";
import AuditoriaEntidadePanel from "../components/auditoria/AuditoriaEntidadePanel";

export default function ContasReceber() {
  const toast = useRef(null);
  const navigate = useNavigate();
  const { has } = useAuth();
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({});
  const [kpis, setKpis] = useState(null);
  const [baixaDialog, setBaixaDialog] = useState({ visible: false, conta: null });
  const [contaAuditoria, setContaAuditoria] = useState(null);

  // carregar contas
  const carregarContas = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await FinanceiroApi.contasReceber.listar(params);

      // suporte a retornos diferentes (lista simples ou {data: []})
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setContas(list);
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Falha ao carregar contas" });
    } finally {
      setLoading(false);
    }
  };

  // carregar KPIs
  const carregarKpis = async () => {
    try {
      const { data } = await FinanceiroApi.contasReceber.kpis();
      setKpis(data);
    } catch (err) {
      console.error(err);
    }
  };

  // baixa de pagamento (agora é "pagar")
  const onBaixar = (conta) => setBaixaDialog({ visible: true, conta });

  const onConfirmBaixa = async (payload) => {
    try {
      await FinanceiroApi.contasReceber.pagar(payload.id, payload);

      toast.current?.show({ severity: "success", summary: "Baixa registrada com sucesso!" });
      setBaixaDialog({ visible: false, conta: null });

      carregarContas(filtros);
      carregarKpis();
    } catch {
      toast.current?.show({ severity: "error", summary: "Erro", detail: "Erro ao registrar baixa" });
    }
  };

  useEffect(() => {
    carregarContas();
    carregarKpis();
  }, []);

  return (
    <SakaiLayout title="Contas a Receber">
      <Toast ref={toast} />
      <ConfirmPopup />

      <div className="flex justify-content-end mb-2">
        {has(PERMISSOES.FINANCEIRO.CONTAS_RECEBER.CRIAR) && (
          <Button icon="pi pi-plus" label="Nova Conta" onClick={() => navigate('/financeiro/contas-receber/nova')} />
        )}
      </div>

      <KpiContasReceber kpis={kpis} />
      <FiltroContasReceber
        onBuscar={(f) => {
          setFiltros(f);
          carregarContas(f);
        }}
      />

      <TabelaContasReceber
        contas={contas}
        loading={loading}
        onBaixar={onBaixar}
        onVerAuditoria={(conta) => setContaAuditoria(conta)}
      />

      <DialogBaixaReceber
        visible={baixaDialog.visible}
        conta={baixaDialog.conta}
        onHide={() => setBaixaDialog({ visible: false, conta: null })}
        onConfirm={onConfirmBaixa}
      />

      <Dialog
        header={contaAuditoria?.id ? `Auditoria da Conta #${contaAuditoria.id}` : 'Auditoria da Conta'}
        visible={Boolean(contaAuditoria)}
        onHide={() => setContaAuditoria(null)}
        style={{ width: '72vw', maxWidth: '1000px' }}
        modal
      >
        {contaAuditoria?.id && (
          <AuditoriaEntidadePanel
            auditableType="ContaReceber"
            auditableId={contaAuditoria.id}
            titulo="Historico da Conta a Receber"
          />
        )}
      </Dialog>
    </SakaiLayout>
  );
}
