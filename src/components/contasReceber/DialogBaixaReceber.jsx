import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

export default function DialogBaixaReceber({ visible, conta, onHide, onConfirm }) {
  const [data_pagamento, setDataPagamento] = useState(new Date());
  const [valor_pago, setValorPago] = useState("");
  const [forma_pagamento, setFormaPagamento] = useState("PIX");

  const confirmar = () => {
    onConfirm({
      id: conta.id,
      data_pagamento,
      valor_pago: parseFloat(valor_pago),
      forma_pagamento,
    });
  };

  return (
    <Dialog header="Baixar Pagamento" visible={visible} onHide={onHide} modal style={{ width: "400px" }}>
      {conta && (
        <>
          <div className="p-fluid">
            <div className="field">
              <label>Conta</label>
              <InputText value={conta.descricao} disabled />
            </div>
            <div className="field">
              <label>Data Pagamento</label>
              <Calendar value={data_pagamento} onChange={(e) => setDataPagamento(e.value)} dateFormat="dd/mm/yy" showIcon />
            </div>
            <div className="field">
              <label>Valor Pago</label>
              <InputText value={valor_pago} onChange={(e) => setValorPago(e.target.value)} />
            </div>
            <div className="field">
              <label>Forma</label>
              <Dropdown
                value={forma_pagamento}
                options={[
                  { label: "PIX", value: "PIX" },
                  { label: "Transferência", value: "TRANSFERENCIA" },
                  { label: "Dinheiro", value: "DINHEIRO" },
                  { label: "Cartão", value: "CARTAO" },
                ]}
                onChange={(e) => setFormaPagamento(e.value)}
              />
            </div>
          </div>
          <div className="flex justify-content-end gap-2 mt-3">
            <Button label="Cancelar" className="p-button-text" onClick={onHide} />
            <Button label="Confirmar" icon="pi pi-check" onClick={confirmar} />
          </div>
        </>
      )}
    </Dialog>
  );
}
