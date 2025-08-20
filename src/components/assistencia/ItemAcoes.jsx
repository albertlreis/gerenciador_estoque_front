import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';

import DialogEnvio from './dialogs/DialogEnvio';
import DialogOrcamento from './dialogs/DialogOrcamento';
import DialogRetorno from './dialogs/DialogRetorno';
import apiEstoque from '../../services/apiEstoque';

export default function ItemAcoes({ item, onChanged }) {
  const toast = useRef(null);
  const [dlgEnvio, setDlgEnvio] = useState(false);
  const [dlgOrc, setDlgOrc] = useState(false);
  const [dlgRetorno, setDlgRetorno] = useState(false);

  async function decidir(aprovado) {
    try {
      const url = aprovado
        ? `/assistencias/itens/${item.id}/aprovar-orcamento`
        : `/assistencias/itens/${item.id}/reprovar-orcamento`;
      const response = await apiEstoque.post(url, { aprovado, observacao: null });
      onChanged?.(response.data?.data || response.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha na decisão de orçamento', life: 3000 });
    }
  }

  return (
    <div className="flex gap-2 align-items-center">
      <Toast ref={toast} />
      <Tooltip target=".btn-envio" content="Enviar para assistência" />
      <Tooltip target=".btn-orc" content="Registrar orçamento" />
      <Tooltip target=".btn-aprovar" content="Aprovar orçamento" />
      <Tooltip target=".btn-reprovar" content="Reprovar orçamento" />
      <Tooltip target=".btn-retorno" content="Registrar retorno" />

      <Button size="small" className="btn-envio" icon="pi pi-truck" rounded outlined onClick={() => setDlgEnvio(true)} disabled={!['aberto', 'em_analise'].includes(item.status_item)} />
      <Button size="small" className="btn-orc" icon="pi pi-file-edit" rounded outlined onClick={() => setDlgOrc(true)} disabled={item.status_item !== 'enviado_assistencia'} />
      <Button size="small" className="btn-aprovar" icon="pi pi-check" rounded severity="success" outlined onClick={() => decidir(true)} disabled={item.status_item !== 'em_orcamento'} />
      <Button size="small" className="btn-reprovar" icon="pi pi-times" rounded severity="danger" outlined onClick={() => decidir(false)} disabled={item.status_item !== 'em_orcamento'} />
      <Button size="small" className="btn-retorno" icon="pi pi-reply" rounded outlined onClick={() => setDlgRetorno(true)} disabled={!['em_reparo', 'enviado_assistencia', 'em_orcamento'].includes(item.status_item)} />

      <DialogEnvio item={item} visible={dlgEnvio} onHide={() => setDlgEnvio(false)} onSuccess={(data) => { onChanged?.(data); setDlgEnvio(false); }} />
      <DialogOrcamento item={item} visible={dlgOrc} onHide={() => setDlgOrc(false)} onSuccess={(data) => { onChanged?.(data); setDlgOrc(false); }} />
      <DialogRetorno item={item} visible={dlgRetorno} onHide={() => setDlgRetorno(false)} onSuccess={(data) => { onChanged?.(data); setDlgRetorno(false); }} />
    </div>
  );
}
