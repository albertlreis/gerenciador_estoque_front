import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import DepositoSelect from '../selects/DepositoSelect';
import apiEstoque from '../../../services/apiEstoque';

/**
 * Dialog para iniciar reparo local (depósito).
 *
 * Exige seleção do depósito de ENTRADA para registrar a movimentação:
 *   cliente/externo -> depósito_entrada  (via service: registrarEntradaDeposito)
 *
 * @param {{ item: any, visible: boolean, onHide: ()=>void, onSuccess: (any)=>void }} props
 */
export default function DialogIniciarReparo({ item, visible, onHide, onSuccess }) {
  const toast = useRef(null);
  const [depositoEntrada, setDepositoEntrada] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Retorna mensagem amigável a partir de um erro de request. */
  function extractApiError(err) {
    return err?.response?.data?.message || err?.message || 'Falha ao iniciar reparo';
  }

  async function submit() {
    if (!depositoEntrada?.id) {
      toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Selecione o depósito de entrada.', life: 2500 });
      return;
    }
    setLoading(true);
    try {
      const payload = { deposito_entrada_id: depositoEntrada.id };
      const { data } = await apiEstoque.post(`/assistencias/itens/${item.id}/iniciar-reparo`, payload);
      onSuccess?.(data?.data || data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: extractApiError(e), life: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog header="Iniciar Reparo (Depósito)" visible={visible} style={{ width: 560 }} modal onHide={onHide}>
      <Toast ref={toast} />
      <div className="grid formgrid p-fluid gap-3">
        <div className="col-12">
          <label className="block mb-2">Depósito de Entrada</label>
          <DepositoSelect value={depositoEntrada} onChange={setDepositoEntrada} placeholder="Selecione o depósito..." />
        </div>
        <div className="col-12 flex justify-end gap-2">
          <Button label="Cancelar" outlined onClick={onHide} />
          <Button label="Iniciar Reparo" icon="pi pi-wrench" onClick={submit} loading={loading} />
        </div>
      </div>
    </Dialog>
  );
}
