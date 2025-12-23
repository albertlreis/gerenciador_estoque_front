import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { ConfirmPopup } from "primereact/confirmpopup";
import SakaiLayout from '../layouts/SakaiLayout';
import apiFinanceiro from "../services/apiFinanceiro";
import FiltroContasReceber from "../components/contasReceber/FiltroContasReceber";
import KpiContasReceber from "../components/contasReceber/KpiContasReceber";
import TabelaContasReceber from "../components/contasReceber/TabelaContasReceber";
import DialogBaixaReceber from "../components/contasReceber/DialogBaixaReceber";

export default function ContasReceber() {
  const toast = useRef(null);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({});
  const [kpis, setKpis] = useState(null);
  const [baixaDialog, setBaixaDialog] = useState({ visible: false, conta: null });

  // 🔄 carregar contas
  const carregarContas = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await apiFinanceiro.get("/contas-receber", { params });
      setContas(data.data || []);
    } catch {
      toast.current.show({ severity: "error", summary: "Erro", detail: "Falha ao carregar contas" });
    } finally {
      setLoading(false);
    }
  };

  // 📊 carregar KPIs
  const carregarKpis = async () => {
    try {
      const { data } = await apiFinanceiro.get("/contas-receber/kpis");
      setKpis(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 💰 baixa de pagamento
  const onBaixar = (conta) => setBaixaDialog({ visible: true, conta });
  const onConfirmBaixa = async (payload) => {
    try {
      await apiFinanceiro.post(`/contas-receber/${payload.id}/baixa`, payload);
      toast.current.show({ severity: "success", summary: "Baixa registrada com sucesso!" });
      setBaixaDialog({ visible: false, conta: null });
      carregarContas(filtros);
      carregarKpis();
    } catch {
      toast.current.show({ severity: "error", summary: "Erro ao registrar baixa" });
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
      />

      <DialogBaixaReceber
        visible={baixaDialog.visible}
        conta={baixaDialog.conta}
        onHide={() => setBaixaDialog({ visible: false, conta: null })}
        onConfirm={onConfirmBaixa}
      />
    </SakaiLayout>
  );
}
