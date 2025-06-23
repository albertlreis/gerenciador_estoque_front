import React from 'react';
import { InputNumber } from 'primereact/inputnumber';

const ConsignacaoSection = ({
                              modoConsignacao,
                              prazoConsignacao,
                              setModoConsignacao,
                              setPrazoConsignacao,
                              verificarEstoqueInsuficiente,
                              setItensEmFalta,
                              toast,
                            }) => {
  const handleToggleConsignacao = (e) => {
    const checked = e.target.checked;

    if (checked) {
      const faltando = verificarEstoqueInsuficiente();

      if (faltando.length > 0) {
        setItensEmFalta(faltando.map((i) => i.id));
        toast.current?.show({
          severity: 'warn',
          summary: 'Estoque insuficiente',
          detail: 'Alguns itens não possuem estoque disponível. Corrija antes de ativar consignação.',
          life: 5000,
        });
        return;
      }
    }

    setItensEmFalta([]);
    setModoConsignacao(checked);
  };

  return (
    <div className="grid mb-4 gap-3">
      <div className="col-12">
        <div className="flex align-items-center gap-2">
          <input
            type="checkbox"
            id="consignacao"
            checked={modoConsignacao}
            onChange={handleToggleConsignacao}
          />
          <label htmlFor="consignacao" className="font-medium">
            Pedido em consignação
          </label>
        </div>
      </div>

      {modoConsignacao && (
        <div className="col-12 md:col-6">
          <label className="block mb-1 font-medium">Prazo para resposta</label>
          <InputNumber
            value={prazoConsignacao}
            onValueChange={(e) => setPrazoConsignacao(e.value)}
            suffix=" dias"
            min={1}
            max={30}
            placeholder="Informe o prazo"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default ConsignacaoSection;
