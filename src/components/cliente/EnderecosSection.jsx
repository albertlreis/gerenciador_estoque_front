import React from 'react';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';

import EnderecoCard from './EnderecoCard';

const EnderecosSection = ({
                            enderecos,
                            fieldErrors,
                            onAdd,
                            onRemove,
                            onSetPrincipal,
                            onChangeField,
                            onBuscarCep,
                            cepLoading,
                            registerNumeroRef,
                          }) => {
  const cepMask = '99999-999';
  const list = enderecos || [];

  return (
    <>
      <div className="col-12">
        <Divider />
        <div className="flex align-items-center justify-content-between gap-2">
          <div>
            <h4 className="m-0">Endereços</h4>
            <small className="text-600">Defina um endereço principal</small>
          </div>
          <Button type="button" icon="pi pi-plus" label="Adicionar endereço" className="p-button-sm" onClick={onAdd} />
        </div>
      </div>

      {list.map((e, idx) => (
        <div key={idx} className="col-12">
          <EnderecoCard
            idx={idx}
            endereco={e}
            isOnlyOne={list.length <= 1}
            cepMask={cepMask}
            cepLoading={!!cepLoading?.[idx]}
            onSetPrincipal={onSetPrincipal}
            onRemove={onRemove}
            onChangeField={onChangeField}
            onBuscarCep={onBuscarCep}
            fieldErrors={fieldErrors}
            registerNumeroRef={registerNumeroRef}
          />
        </div>
      ))}
    </>
  );
};

export default EnderecosSection;
