import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiFinanceiro from '../../services/apiFinanceiro';

const FORMAS = [
  { label: 'PIX', value: 'PIX' },
  { label: 'Boleto', value: 'BOLETO' },
  { label: 'TED', value: 'TED' },
  { label: 'Dinheiro', value: 'DINHEIRO' },
  { label: 'Cartão', value: 'CARTAO' },
];

export default function ContaPagarPagamentoDialog({ visible, onHide, conta, onAfterChange, podePagar, podeEstornar }) {
  const toast = useRef(null);

  const [valor, setValor] = useState(0);
  const [dataPagamento, setDataPagamento] = useState(new Date());
  const [forma, setForma] = useState('PIX');
  const [arquivo, setArquivo] = useState(null);
  const [saving, setSaving] = useState(false);

  const [contas, setContas] = useState([]);
  const [contaFinanceiraId, setContaFinanceiraId] = useState(null);

  useEffect(() => {
    if (!visible) return;

    setValor(Number(conta?.saldo_aberto || 0));
    setDataPagamento(new Date());
    setForma(conta?.forma_pagamento || 'PIX');
    setArquivo(null);

    (async () => {
      try {
        const { data } = await apiFinanceiro.get('/financeiro/catalogo/contas-financeiras', { params: { ativo: true } });
        const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        const opts = arr.map((c) => ({ label: c.nome, value: c.id, raw: c }));
        setContas(opts);
        setContaFinanceiraId(opts?.[0]?.value ?? null);
      } catch (e) {
        // não bloqueia o dialog, mas avisa
        toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Não foi possível carregar contas financeiras.' });
        setContas([]);
        setContaFinanceiraId(null);
      }
    })();
  }, [visible, conta?.id]);

  const registrar = async () => {
    if (!podePagar) return;

    if (!contaFinanceiraId) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Selecione a conta financeira.' });
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append('valor', String(valor || 0));
      form.append('data_pagamento', dataPagamento?.toISOString().slice(0, 10));
      form.append('forma_pagamento', forma || 'PIX');
      form.append('conta_financeira_id', String(contaFinanceiraId));
      if (arquivo) form.append('comprovante', arquivo);

      await apiFinanceiro.post(`/contas-pagar/${conta.id}/pagar`, form);

      onAfterChange?.();
      onHide();
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    } finally {
      setSaving(false);
    }
  };

  const estornar = async (pagamentoId) => {
    if (!podeEstornar) return;
    try {
      await apiFinanceiro.delete(`/contas-pagar/${conta.id}/pagamentos/${pagamentoId}`);
      onAfterChange?.();
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: e?.response?.data?.message || e.message });
    }
  };

  return (
    <Dialog header={`Pagamentos — #${conta?.id}`} visible={visible} modal style={{ width: '720px' }} onHide={onHide}>
      <Toast ref={toast} />

      <div className="mb-3">
        <div className="text-sm text-500">Saldo em aberto</div>
        <div className="text-xl font-bold">R$ {Number(conta?.saldo_aberto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>

      <div className="grid p-fluid">
        <div className="col-4">
          <label>Valor</label>
          <InputNumber value={valor} onValueChange={(e) => setValor(e.value || 0)} mode="currency" currency="BRL" locale="pt-BR" min={0.01} />
        </div>
        <div className="col-4">
          <label>Data</label>
          <Calendar value={dataPagamento} onChange={(e) => setDataPagamento(e.value)} dateFormat="dd/mm/yy" showIcon readOnlyInput />
        </div>
        <div className="col-4">
          <label>Forma</label>
          <Dropdown value={forma} onChange={(e) => setForma(e.value)} options={FORMAS} className="w-full" />
        </div>

        <div className="col-12">
          <label>Conta Financeira *</label>
          <Dropdown
            value={contaFinanceiraId}
            onChange={(e) => setContaFinanceiraId(e.value)}
            options={contas}
            className="w-full"
            placeholder="Selecione"
            showClear
          />
        </div>

        <div className="col-12">
          <label>Comprovante (opcional)</label>
          <FileUpload mode="basic" auto={false} chooseLabel="Selecionar arquivo" customUpload onSelect={(e) => setArquivo(e.files?.[0] || null)} />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-2">
          <Button label="Registrar" icon="pi pi-check" onClick={registrar} loading={saving} disabled={!podePagar} />
          <Button label="Fechar" icon="pi pi-times" severity="secondary" onClick={onHide} outlined />
        </div>
      </div>

      <div className="mt-4">
        <h4>Histórico</h4>
        {Array.isArray(conta?.pagamentos) && conta.pagamentos.length > 0 ? (
          <ul className="m-0 pl-3">
            {conta.pagamentos.map((p) => (
              <li key={p.id} className="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
                <span>
                  {new Date(p.data_pagamento).toLocaleDateString('pt-BR')} — R$ {Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  {p.forma_pagamento ? ` • ${p.forma_pagamento}` : ''}
                </span>
                <span className="flex gap-2">
                  {p.comprovante_url && (
                    <a href={p.comprovante_url} target="_blank" rel="noreferrer" className="p-button p-button-text p-button-sm">
                      <i className="pi pi-paperclip mr-2" />Ver comprovante
                    </a>
                  )}
                  {podeEstornar && (
                    <Button icon="pi pi-undo" label="Estornar" size="small" severity="warning" outlined onClick={() => estornar(p.id)} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-500 text-sm">Nenhum pagamento registrado.</div>
        )}
      </div>
    </Dialog>
  );
}
