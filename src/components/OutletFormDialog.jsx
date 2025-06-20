import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiEstoque from '../services/apiEstoque';

const motivosOutlet = [
  { label: 'Tempo em estoque', value: 'tempo_estoque' },
  { label: 'Saiu de linha', value: 'saiu_linha' },
  { label: 'Avariado', value: 'avariado' },
  { label: 'Devolvido', value: 'devolvido' },
  { label: 'Exposição em loja', value: 'exposicao' },
  { label: 'Embalagem danificada', value: 'embalagem_danificada' },
  { label: 'Baixa rotatividade', value: 'baixa_rotatividade' },
  { label: 'Erro de cadastro', value: 'erro_cadastro' },
  { label: 'Reposição excedente', value: 'excedente' },
  { label: 'Promoção pontual', value: 'promocao_pontual' }
];

const OutletFormDialog = ({ visible, onHide, variacao, onSuccess }) => {
  const estoqueTotal = variacao?.estoque?.quantidade ?? 0;
  const outletAtuais = variacao?.outlets ?? [];
  const quantidadeJaAlocada = outletAtuais.reduce((soma, o) => soma + (o.quantidade || 0), 0);

  const toast = useRef(null);
  const [motivo, setMotivo] = useState(null);
  const [quantidade, setQuantidade] = useState(null);
  const [percentualDesconto, setPercentualDesconto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setMotivo(null);
      setQuantidade(null);
      setPercentualDesconto(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!motivo || !quantidade || !percentualDesconto) {
      toast.current.show({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Preencha todos os campos.', life: 3000 });
      return;
    }

    const novaQuantidade = quantidade || 0;
    const somaTotal = quantidadeJaAlocada + novaQuantidade;

    console.log(somaTotal, estoqueTotal)

    if (somaTotal > estoqueTotal) {
      toast.current.show({
        severity: 'warn',
        summary: 'Estoque insuficiente',
        detail: `A soma das quantidades de outlet (${quantidadeJaAlocada}) com a nova (${novaQuantidade}) ultrapassa o estoque (${estoqueTotal}).`,
        life: 5000
      });
      return;
    }

    if (quantidade <= 0) {
      toast.current.show({
        severity: 'warn',
        summary: 'Quantidade inválida',
        detail: 'Informe uma quantidade maior que zero.',
        life: 3000
      });
      return;
    }

    setLoading(true);
    try {
      await apiEstoque.post(`/variacoes/${variacao.id}/outlet`, {
        motivo,
        quantidade,
        percentual_desconto: percentualDesconto
      });
      toast.current.show({ severity: 'success', summary: 'Outlet registrado', detail: 'A variação foi marcada como outlet.', life: 3000 });
      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao registrar outlet.', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog header="Registrar como Outlet" visible={visible} onHide={onHide} modal className="w-full md:w-30rem">
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
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="quantidade">Quantidade</label>
            <InputNumber
              id="quantidade"
              value={quantidade}
              onValueChange={(e) => setQuantidade(e.value)}
              min={1}
              max={estoqueTotal - quantidadeJaAlocada}
              inputClassName="w-full"
              showButtons
            />
            <small className="block mt-1 text-color-secondary">
              Estoque: <strong>{estoqueTotal}</strong> | Já marcado como outlet: <strong>{quantidadeJaAlocada}</strong><br />
              Máximo permitido para novo outlet: <strong>{estoqueTotal - quantidadeJaAlocada}</strong>
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
              inputClassName="w-full"
              showButtons
            />
          </div>

          <div className="flex justify-content-end mt-4">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text mr-2" onClick={onHide} />
            <Button label="Confirmar" icon="pi pi-check" loading={loading} onClick={handleSubmit} disabled={loading} />
          </div>
        </div>
      </Dialog>

    </>
  );
};

export default OutletFormDialog;
