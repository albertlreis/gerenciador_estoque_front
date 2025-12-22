import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';

import { getError, isInvalid } from './helpers';

const EnderecoCard = ({
                        idx,
                        endereco,
                        isOnlyOne,
                        cepMask,
                        cepLoading,
                        onSetPrincipal,
                        onRemove,
                        onChangeField,
                        onBuscarCep,
                        onAfterCepFillFocusNumero,
                        fieldErrors,
                        registerNumeroRef,
                      }) => {
  const err = (path) => getError(fieldErrors, path);
  const invalid = (path) => (isInvalid(fieldErrors, path) ? 'p-invalid' : '');

  const askRemove = () => {
    confirmDialog({
      message: 'Remover este endereço?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => onRemove?.(idx),
    });
  };

  return (
    <div className="p-3 border-1 surface-border border-round">
      <div className="flex align-items-center justify-content-between mb-3">
        <div className="flex align-items-center gap-2">
          <strong>Endereço {idx + 1}</strong>
          {endereco.principal && <Tag value="Principal" severity="success" />}
        </div>

        <div className="flex align-items-center gap-3">
          <div className="flex align-items-center gap-2">
            <RadioButton inputId={`principal-${idx}`} checked={!!endereco.principal} onChange={() => onSetPrincipal?.(idx)} />
            <label htmlFor={`principal-${idx}`} className="text-sm">
              Principal
            </label>
          </div>

          <Button
            type="button"
            icon="pi pi-trash"
            className="p-button-text p-button-danger p-button-sm"
            onClick={askRemove}
            disabled={isOnlyOne}
            tooltip="Remover endereço"
            tooltipOptions={{ position: 'left' }}
          />
        </div>
      </div>

      <div className="formgrid grid">
        <div className="field col-12 md:col-3">
          <label htmlFor={`cep-${idx}`}>CEP</label>
          <div className="p-inputgroup">
            <InputMask
              id={`cep-${idx}`}
              mask={cepMask}
              value={endereco.cep}
              onChange={(e) => onChangeField(idx, 'cep', e.value || e.target.value)}
              onBlur={() => onBuscarCep?.(idx)}
              className={invalid(`enderecos.${idx}.cep`)}
              inputMode="numeric"
              placeholder="00000-000"
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  onBuscarCep?.(idx);
                }
              }}
            />
            <Button
              type="button"
              icon="pi pi-search"
              className="p-button-outlined"
              onClick={() => onBuscarCep?.(idx)}
              loading={!!cepLoading}
              tooltip="Buscar CEP"
            />
          </div>
          {err(`enderecos.${idx}.cep`) && <small className="p-error">{err(`enderecos.${idx}.cep`)}</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor={`rua-${idx}`}>Rua</label>
          <InputText
            id={`rua-${idx}`}
            value={endereco.endereco}
            onChange={(e) => onChangeField(idx, 'endereco', e.target.value)}
            className={invalid(`enderecos.${idx}.endereco`)}
            autoComplete="street-address"
          />
          {err(`enderecos.${idx}.endereco`) && <small className="p-error">{err(`enderecos.${idx}.endereco`)}</small>}
        </div>

        <div className="field col-12 md:col-3">
          <label htmlFor={`numero-${idx}`}>Número</label>
          <InputText
            id={`numero-${idx}`}
            value={endereco.numero}
            onChange={(e) => onChangeField(idx, 'numero', e.target.value)}
            className={invalid(`enderecos.${idx}.numero`)}
            ref={(el) => registerNumeroRef?.(idx, el)}
            inputMode="numeric"
            onFocus={() => onAfterCepFillFocusNumero?.()}
          />
          {err(`enderecos.${idx}.numero`) && <small className="p-error">{err(`enderecos.${idx}.numero`)}</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor={`bairro-${idx}`}>Bairro</label>
          <InputText
            id={`bairro-${idx}`}
            value={endereco.bairro}
            onChange={(e) => onChangeField(idx, 'bairro', e.target.value)}
            className={invalid(`enderecos.${idx}.bairro`)}
          />
          {err(`enderecos.${idx}.bairro`) && <small className="p-error">{err(`enderecos.${idx}.bairro`)}</small>}
        </div>

        <div className="field col-12 md:col-4">
          <label htmlFor={`cidade-${idx}`}>Cidade</label>
          <InputText
            id={`cidade-${idx}`}
            value={endereco.cidade}
            onChange={(e) => onChangeField(idx, 'cidade', e.target.value)}
            className={invalid(`enderecos.${idx}.cidade`)}
            autoComplete="address-level2"
          />
          {err(`enderecos.${idx}.cidade`) && <small className="p-error">{err(`enderecos.${idx}.cidade`)}</small>}
        </div>

        <div className="field col-12 md:col-2">
          <label htmlFor={`uf-${idx}`}>UF</label>
          <InputText
            id={`uf-${idx}`}
            value={endereco.estado}
            onChange={(e) => onChangeField(idx, 'estado', String(e.target.value || '').toUpperCase())}
            className={invalid(`enderecos.${idx}.estado`)}
            maxLength={2}
            autoComplete="address-level1"
          />
          {err(`enderecos.${idx}.estado`) && <small className="p-error">{err(`enderecos.${idx}.estado`)}</small>}
        </div>

        <div className="field col-12">
          <label htmlFor={`complemento-${idx}`}>Complemento</label>
          <InputText
            id={`complemento-${idx}`}
            value={endereco.complemento}
            onChange={(e) => onChangeField(idx, 'complemento', e.target.value)}
            className={invalid(`enderecos.${idx}.complemento`)}
          />
          {err(`enderecos.${idx}.complemento`) && <small className="p-error">{err(`enderecos.${idx}.complemento`)}</small>}
        </div>
      </div>
    </div>
  );
};

export default EnderecoCard;
