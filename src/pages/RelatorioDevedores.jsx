import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { SakaiLayout } from "../layout/SakaiLayout";
import apiFinanceiro from "../services/apiFinanceiro";
import FiltroDevedores from "../components/contasReceber/FiltroDevedores";
import KpiDevedores from "../components/contasReceber/KpiDevedores";
import TabelaDevedores from "../components/contasReceber/TabelaDevedores";
import ModalDetalheDevedor from "../components/contasReceber/ModalDetalheDevedor";

export default function RelatorioDevedores() {
  const toast = useRef(null);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [modalCliente, setModalCliente] = useState({ visible: false, cliente: null });

  // 🔄 Carrega dados do relatório
  const carregar = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await apiFinanceiro.get("/financeiro/contas-receber/relatorios/devedores", { params });
      setDados(data.data);
      setKpis(data.meta);
    } catch (e) {
      toast.current.show({ severity: "error", summary: "Erro", detail: "Falha ao carregar relatório" });
    } finally {
      setLoading(false);
    }
  };

  // 📤 Exporta PDF ou Excel
  const exportar = async (tipo) => {
    try {
      const endpoint = `/financeiro/contas-receber/relatorios/devedores/exportar/${tipo}`;
      const response = await apiFinanceiro.get(endpoint, {
        responseType: "blob",
        params: filtros,
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tipo === "excel" ? "clientes_devedores.xlsx" : "clientes_devedores.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.current.show({ severity: "success", summary: "Exportação concluída" });
    } catch (e) {
      toast.current.show({ severity: "error", summary: "Erro ao exportar arquivo" });
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <SakaiLayout title="Relatório de Clientes Devedores">
      <Toast ref={toast} />

      {/* KPIs principais */}
      <KpiDevedores kpis={kpis} />

      {/* Filtros */}
      <FiltroDevedores
        onBuscar={(f) => {
          setFiltros(f);
          carregar(f);
        }}
      />

      {/* Botões de exportação */}
      <div className="flex justify-content-end gap-2 mb-3">
        <Button
          icon="pi pi-file-excel"
          label="Exportar Excel"
          className="p-button-success p-button-sm"
          onClick={() => exportar("excel")}
        />
        <Button
          icon="pi pi-file-pdf"
          label="Exportar PDF"
          className="p-button-danger p-button-sm"
          onClick={() => exportar("pdf")}
        />
      </div>

      {/* Tabela principal */}
      <TabelaDevedores
        dados={dados}
        loading={loading}
        onSelecionarCliente={(cliente) => setModalCliente({ visible: true, cliente })}
      />

      {/* Modal detalhado */}
      <ModalDetalheDevedor
        visible={modalCliente.visible}
        cliente={modalCliente.cliente}
        onHide={() => setModalCliente({ visible: false, cliente: null })}
      />
    </SakaiLayout>
  );
}
