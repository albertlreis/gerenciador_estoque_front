import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { motivosOutlet } from './motivosOutlet';

const FORMAS_PAGAMENTO = [
  { label: 'À vista', value: 'avista' },
  { label: 'Boleto', value: 'boleto' },
  { label: 'Cartão de Crédito', value: 'cartao' }
];


export default function DialogOutlet({
                                       visible,
                                       onHide,
                                       onSalvar,
                                       variacao,
                                       onSuccess,
                                       outletEdicao = null
                                     }) {
  const [motivo, setMotivo] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [formasPagamento, setFormasPagamento] = useState([]);

  const [pagamentoTemp, setPagamentoTemp] = useState({
    forma_pagamento: null,
    percentual_desconto: null,
    max_parcelas: null
  });

  const [toast] = useState(React.createRef());

  useEffect(() => {
    if (outletEdicao) {
      setMotivo(outletEdicao.motivo);
      setQuantidade(outletEdicao.quantidade);
      setFormasPagamento(outletEdicao.formas_pagamento || []);
    } else {
      setMotivo('');
      setQuantidade(1);
      setFormasPagamento([]);
    }
    setPagamentoTemp({ forma_pagamento: null, percentual_desconto: null, max_parcelas: null });
  }, [outletEdicao]);

  const adicionarFormaPagamento = () => {
    const { forma_pagamento, percentual_desconto } = pagamentoTemp;

    if (!forma_pagamento || !percentual_desconto) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Forma de pagamento e desconto são obrigatórios',
        life: 3000
      });
      return;
    }

    if (formasPagamento.find(fp => fp.forma_pagamento === forma_pagamento)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Duplicado',
        detail: 'Essa forma de pagamento já foi adicionada.',
        life: 3000
      });
      return;
    }

    setFormasPagamento([...formasPagamento, pagamentoTemp]);
    setPagamentoTemp({ forma_pagamento: null, percentual_desconto: null, max_parcelas: null });
  };

  const removerFormaPagamento = (forma_pagamento) => {
    setFormasPagamento(formasPagamento.filter(fp => fp.forma_pagamento !== forma_pagamento));
  };

  const salvar = () => {
    if (!motivo || !quantidade) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Motivo e quantidade são obrigatórios.',
        life: 4000
      });
      return;
    }

    // Se o usuário preencheu uma forma mas não clicou no botão '+'
    const { forma_pagamento, percentual_desconto } = pagamentoTemp;
    if (
      forma_pagamento &&
      percentual_desconto &&
      !formasPagamento.some(fp => fp.forma_pagamento === forma_pagamento)
    ) {
      formasPagamento.push(pagamentoTemp);
    }

    if (formasPagamento.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Adicione ao menos uma forma de pagamento.',
        life: 4000
      });
      return;
    }

    const payload = {
      motivo,
      quantidade,
      formas_pagamento: formasPagamento
    };

    onSalvar(payload);
    onSuccess(true);
    onHide();
  };

  return (
    <Dialog
      header={outletEdicao ? 'Editar Outlet' : 'Novo Outlet'}
      visible={visible}
      onHide={onHide}
      className="w-max md:w-50"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Salvar" icon="pi pi-check" className="p-button-success" onClick={salvar} />
        </div>
      }
    >
      <Toast ref={toast} />

      <div className="formgrid grid">
        <div className="field md:col-6">
          <label>Motivo</label>
          <Dropdown
            value={motivo}
            options={motivosOutlet}
            onChange={(e) => setMotivo(e.value)}
            placeholder="Selecione o motivo"
            filter
            showClear
          />
        </div>

        <div className="field md:col-6">
          <label>Quantidade</label>
          <InputNumber value={quantidade} onValueChange={(e) => setQuantidade(e.value)} min={1} />
        </div>
      </div>

      <h6 className="mt-4 mb-2">Formas de Pagamento</h6>

      <div className="formgrid grid">
        <div className="field md:col-4">
          <label>Forma</label>
          <Dropdown
            value={pagamentoTemp.forma_pagamento}
            options={FORMAS_PAGAMENTO}
            onChange={(e) => setPagamentoTemp(prev => ({ ...prev, forma_pagamento: e.value }))}
            placeholder="Selecione"
          />
        </div>
        <div className="field md:col-4">
          <label>% Desconto</label>
          <InputNumber
            value={pagamentoTemp.percentual_desconto}
            onValueChange={(e) => setPagamentoTemp(prev => ({ ...prev, percentual_desconto: e.value }))}
            mode="decimal"
            min={0}
            max={100}
            suffix="%"
          />
        </div>
        <div className="field md:col-3">
          <label>Máx Parcelas</label>
          <InputNumber
            value={pagamentoTemp.max_parcelas}
            onValueChange={(e) => setPagamentoTemp(prev => ({ ...prev, max_parcelas: e.value }))}
            min={1}
            max={36}
          />
        </div>
        <div className="field md:col-1 flex align-items-end">
          <Button icon="pi pi-plus" className="p-button-sm" type="button" onClick={adicionarFormaPagamento} />
        </div>
      </div>

      <ul className="mt-2">
        {formasPagamento.map((fp, i) => (
          <li key={i} className="flex justify-content-between align-items-center border-bottom-1 surface-200 p-2">
            <span>
              <strong>{fp.forma_pagamento.toUpperCase()}</strong>: {fp.percentual_desconto}%
              {fp.max_parcelas && ` • até ${fp.max_parcelas}x`}
            </span>
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-text"
              onClick={() => removerFormaPagamento(fp.forma_pagamento)}
            />
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
