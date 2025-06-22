import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiEstoque from '../services/apiEstoque';
import { motivosOutlet } from './produto/motivosOutlet';

const OutletFormDialog = ({ visible, onHide, variacao, outlet = null, onSuccess }) => {
  const toast = useRef(null);

  const [motivo, setMotivo] = useState(null);
  const [quantidade, setQuantidade] = useState(null);
  const [percentualDesconto, setPercentualDesconto] = useState(null);
  const [loading, setLoading] = useState(false);

  const estoqueTotal = variacao?.estoque?.quantidade ?? 0;
  const outletAtuais = variacao?.outlets ?? [];
  const quantidadeJaAlocada = outletAtuais.reduce((soma, o) => soma + (o.quantidade || 0), 0);
  const maxPermitido = outlet?.id
    ? estoqueTotal - (quantidadeJaAlocada - (outlet.quantidade || 0))
    : estoqueTotal - quantidadeJaAlocada;

  useEffect(() => {
    if (visible) {
      setMotivo(outlet?.motivo ?? null);
      setQuantidade(outlet?.quantidade ?? null);
      setPercentualDesconto(outlet?.percentual_desconto ?? null);
    }
  }, [visible, outlet]);

  const showToast = (severity, summary, detail, life = 3000) => {
    toast.current?.show({ group: 'outlet', severity, summary, detail, life });
  };

  const handleSubmit = async () => {
    if (!motivo || !quantidade || !percentualDesconto) {
      return showToast('warn', 'Campos obrigatórios', 'Preencha todos os campos.');
    }

    if (quantidade <= 0) {
      return showToast('warn', 'Quantidade inválida', 'Informe uma quantidade maior que zero.');
    }

    if (quantidade > maxPermitido) {
      return showToast(
        'warn',
        'Estoque insuficiente',
        `Quantidade excede o máximo disponível (${maxPermitido}).`,
        5000
      );
    }

    setLoading(true);
    try {
      const payload = {
        motivo,
        quantidade,
        percentual_desconto: percentualDesconto,
      };

      if (outlet?.id) {
        await apiEstoque.put(`/variacoes/${variacao.id}/outlet/${outlet.id}`, payload);
        showToast('success', 'Outlet atualizado', 'A variação foi atualizada.');
      } else {
        await apiEstoque.post(`/variacoes/${variacao.id}/outlet`, payload);
        showToast('success', 'Outlet registrado', 'O produto foi marcado como outlet.');
      }

      onSuccess(true);
      onHide();
    } catch {
      showToast('error', 'Erro', 'Erro ao registrar outlet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} group="outlet" />
      <Dialog
        header={outlet?.id ? 'Editar Outlet' : 'Registrar como Outlet'}
        visible={visible}
        onHide={onHide}
        modal
        className="w-full md:w-30rem"
      >
        <div className="p-fluid">
          <div className="field mb-3">
            <label htmlFor="motivo">Motivo</label>
            <Dropdown
              id="motivo"
              value={motivo}
              options={motivosOutlet}
              onChange={(e) => setMotivo(e.value)}
              placeholder="Selecione o motivo"
              className="w-full"
              filter
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="quantidade">Quantidade</label>
            <InputNumber
              id="quantidade"
              value={quantidade}
              onValueChange={(e) => setQuantidade(e.value)}
              min={1}
              max={maxPermitido}
              showButtons
              inputClassName="w-full"
            />
            <small className="block mt-1 text-color-secondary">
              Estoque: <strong>{estoqueTotal}</strong> | Já em outlet: <strong>{quantidadeJaAlocada}</strong><br />
              Máximo disponível: <strong>{maxPermitido}</strong>
            </small>
          </div>

          <div className="field mb-3">
            <label htmlFor="percentualDesconto">Desconto (%)</label>
            <InputNumber
              id="percentualDesconto"
              value={percentualDesconto}
              onValueChange={(e) => setPercentualDesconto(e.value)}
              min={1}
              max={99}
              mode="decimal"
              suffix="%"
              showButtons
              inputClassName="w-full"
            />
          </div>

          <div className="flex justify-content-end mt-4">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text mr-2" onClick={onHide} />
            <Button
              label="Confirmar"
              icon="pi pi-check"
              loading={loading}
              onClick={handleSubmit}
              disabled={loading || !motivo || !quantidade || !percentualDesconto}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default OutletFormDialog;
