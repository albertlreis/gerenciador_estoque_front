import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';

import { getError, isInvalid } from './helpers';

const ClienteDadosBasicos = ({
                               tipoSelecionado,
                               tipoOptions,
                               cliente,
                               fieldErrors,
                               onChangeField,
                               onDocumentoBlur,
                               onDocumentoChangeDebounced,
                             }) => {
  const nomeLabel = tipoSelecionado === 'pj' ? 'Razão Social' : 'Nome';
  const documentoLabel = tipoSelecionado === 'pj' ? 'CNPJ' : 'CPF';
  const documentoMask = tipoSelecionado === 'pf' ? '999.999.999-99' : '99.999.999/9999-99';
  const telefoneMask = '(99) 99999-9999';

  const err = (f) => getError(fieldErrors, f);
  const invalid = (f) => (isInvalid(fieldErrors, f) ? 'p-invalid' : '');

  return (
    <div className="formgrid grid">
      <div className="field col-12">
        <label>Tipo de Cliente</label>
        <Dropdown value={tipoSelecionado} options={tipoOptions} disabled className="w-full" />
      </div>

      <div className="field col-12 md:col-8">
        <label htmlFor="nome">{nomeLabel}</label>
        <InputText
          id="nome"
          autoFocus
          value={cliente.nome}
          onChange={(e) => onChangeField('nome', e.target.value)}
          className={invalid('nome')}
          aria-invalid={!!err('nome')}
          aria-describedby={err('nome') ? 'nome-help' : undefined}
          autoComplete="name"
        />
        {err('nome') && (
          <small id="nome-help" className="p-error">
            {err('nome')}
          </small>
        )}
      </div>

      <div className="field col-12 md:col-4">
        <label htmlFor="documento">{documentoLabel}</label>
        <InputMask
          id="documento"
          mask={documentoMask}
          value={cliente.documento}
          onChange={(e) => {
            const v = e.value || e.target.value;
            onChangeField('documento', v);
            onDocumentoChangeDebounced?.(v);
          }}
          onBlur={onDocumentoBlur}
          className={invalid('documento')}
          aria-invalid={!!err('documento')}
          aria-describedby={err('documento') ? 'documento-help' : 'documento-hint'}
          inputMode="numeric"
        />
        {!err('documento') && (
          <small id="documento-hint" className="text-600">
            Apenas números serão enviados ao salvar.
          </small>
        )}
        {err('documento') && (
          <small id="documento-help" className="p-error">
            {err('documento')}
          </small>
        )}
      </div>

      {tipoSelecionado === 'pj' && (
        <>
          <div className="field col-12 md:col-8">
            <label htmlFor="nome_fantasia">Nome Fantasia</label>
            <InputText
              id="nome_fantasia"
              value={cliente.nome_fantasia}
              onChange={(e) => onChangeField('nome_fantasia', e.target.value)}
              className={invalid('nome_fantasia')}
            />
            {err('nome_fantasia') && <small className="p-error">{err('nome_fantasia')}</small>}
          </div>

          <div className="field col-12 md:col-4">
            <label htmlFor="inscricao_estadual">Inscrição Estadual</label>
            <InputText
              id="inscricao_estadual"
              value={cliente.inscricao_estadual}
              onChange={(e) => onChangeField('inscricao_estadual', e.target.value)}
              className={invalid('inscricao_estadual')}
            />
            {err('inscricao_estadual') && <small className="p-error">{err('inscricao_estadual')}</small>}
          </div>
        </>
      )}

      <div className="field col-12 md:col-6">
        <label htmlFor="email">Email</label>
        <InputText
          id="email"
          value={cliente.email}
          onChange={(e) => onChangeField('email', e.target.value)}
          className={invalid('email')}
          autoComplete="email"
        />
        {err('email') && <small className="p-error">{err('email')}</small>}
      </div>

      <div className="field col-12 md:col-3">
        <label htmlFor="telefone">Telefone</label>
        <InputMask
          id="telefone"
          mask={telefoneMask}
          value={cliente.telefone}
          onChange={(e) => onChangeField('telefone', e.value || e.target.value)}
          className={invalid('telefone')}
          inputMode="tel"
          autoComplete="tel"
        />
        {err('telefone') && <small className="p-error">{err('telefone')}</small>}
      </div>

      <div className="field col-12 md:col-3">
        <label htmlFor="whatsapp">Whatsapp</label>
        <InputMask
          id="whatsapp"
          mask={telefoneMask}
          value={cliente.whatsapp}
          onChange={(e) => onChangeField('whatsapp', e.value || e.target.value)}
          className={invalid('whatsapp')}
          inputMode="tel"
          autoComplete="tel"
        />
        {err('whatsapp') && <small className="p-error">{err('whatsapp')}</small>}
      </div>
    </div>
  );
};

export default ClienteDadosBasicos;
