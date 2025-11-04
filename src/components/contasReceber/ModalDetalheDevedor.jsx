import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import apiFinanceiro from "../../services/apiFinanceiro";

export default function ModalDetalheDevedor({ visible, onHide, cliente }) {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totais, setTotais] = useState({ liquido: 0, aberto: 0, vencido: 0 });

  useEffect(() => {
    if (visible && cliente?.id_cliente) carregarContas(cliente.id_cliente);
  }, [visible]);

  const carregarContas = async (idCliente) => {
    setLoading(true);
    try {
      const { data } = await apiFinanceiro.get("/contas-receber", {
        params: { cliente: cliente.cliente_nome, status: "ABERTO" },
      });
      setContas(data.data || []);
      calcularTotais(data.data || []);
    } catch {
      console.error("Erro ao carregar contas do cliente.");
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = (lista) => {
    const liquido = lista.reduce((acc, c) => acc + (c.valor_liquido || 0), 0);
    const aberto = lista.reduce((acc, c) => acc + (c.saldo_aberto || 0), 0);
    const vencido = lista.reduce(
      (acc, c) => acc + (c.data_vencimento && new Date(c.data_vencimento) < new Date() ? c.saldo_aberto : 0),
      0
    );
    setTotais({ liquido, aberto, vencido });
  };

  const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const exportar = async (tipo) => {
    try {
      const endpoint = `/contas-receber/exportar/${tipo}`;
      const response = await apiFinanceiro.get(endpoint, {
        responseType: "blob",
        params: { cliente: cliente.cliente_nome, status: "ABERTO" },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contas_${cliente.cliente_nome}.${tipo === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      console.error("Falha ao exportar contas do cliente");
    }
  };

  const statusTemplate = (row) => {
    const color = { ABERTO: "danger", PARCIAL: "warning", PAGO: "success" }[row.status] || "info";
    return <Tag value={row.status} severity={color} />;
  };

  const footer = (
    <div className="flex justify-content-between align-items-center">
      <div>
        <b>Total Líquido:</b> {fmt(totais.liquido)} &nbsp;
        <b>Aberto:</b> {fmt(totais.aberto)} &nbsp;
        <b>Vencido:</b> {fmt(totais.vencido)}
      </div>
      <div className="flex gap-2">
        <Button icon="pi pi-file-excel" className="p-button-success p-button-sm" onClick={() => exportar("excel")} />
        <Button icon="pi pi-file-pdf" className="p-button-danger p-button-sm" onClick={() => exportar("pdf")} />
      </div>
    </div>
  );

  return (
    <Dialog
      header={`Contas em Aberto - ${cliente?.cliente_nome || ""}`}
      visible={visible}
      onHide={onHide}
      modal
      style={{ width: "800px" }}
      footer={footer}
    >
      <DataTable
        value={contas}
        loading={loading}
        paginator
        rows={5}
        dataKey="id"
        emptyMessage="Nenhuma conta em aberto."
      >
        <Column field="descricao" header="Descrição" />
        <Column field="data_vencimento" header="Vencimento" />
        <Column field="valor_liquido" header="Valor Líquido" body={(r) => fmt(r.valor_liquido)} />
        <Column field="saldo_aberto" header="Saldo" body={(r) => fmt(r.saldo_aberto)} />
        <Column field="status" header="Status" body={statusTemplate} />
      </DataTable>
    </Dialog>
  );
}
