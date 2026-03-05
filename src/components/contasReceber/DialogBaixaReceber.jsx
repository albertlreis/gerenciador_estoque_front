import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import apiFinanceiro from "../../services/apiFinanceiro";
import SelectOrCreate from "../financeiro/SelectOrCreate";

export default function DialogBaixaReceber({ visible, conta, onHide, onConfirm }) {
  const [data_pagamento, setDataPagamento] = useState(new Date());
  const [valor_pago, setValorPago] = useState("");
  const [forma_pagamento, setFormaPagamento] = useState("PIX");
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [loadingFormas, setLoadingFormas] = useState(false);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      setLoadingFormas(true);
      try {
        const res = await apiFinanceiro.get('/financeiro/formas-pagamento', { params: { ativo: true } });
        const list = res?.data?.data || [];
        const options = list.map((i) => ({ label: i.nome, value: i.nome }));
        setFormasPagamento(options);
        if (!forma_pagamento && options.length > 0) {
          setFormaPagamento(options[0].value);
        }
      } catch {
        setFormasPagamento([]);
      } finally {
        setLoadingFormas(false);
      }
    })();
  }, [visible]);

  const createFormaPagamento = async (nome) => {
    setLoadingFormas(true);
    try {
      const res = await apiFinanceiro.post('/financeiro/formas-pagamento', { nome, ativo: true });
      const created = res?.data?.data;
      if (!created?.nome) return forma_pagamento;

      const option = { label: created.nome, value: created.nome };
      setFormasPagamento((prev) => [...prev.filter((o) => o.value !== option.value), option]);
      return option.value;
    } catch {
      return forma_pagamento;
    } finally {
      setLoadingFormas(false);
    }
  };

  const confirmar = () => {
    onConfirm({
      id: conta.id,
      data_pagamento,
      valor: parseFloat(valor_pago),
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
              <SelectOrCreate
                value={forma_pagamento}
                options={formasPagamento}
                onChange={setFormaPagamento}
                loading={loadingFormas}
                createLabel="Cadastrar"
                dialogTitle="Cadastrar forma de pagamento"
                onCreate={createFormaPagamento}
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
