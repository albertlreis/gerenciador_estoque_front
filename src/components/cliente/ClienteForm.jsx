import React, { useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';

import { extractApiError } from '../../utils/extractApiError';

import ClienteTipoSelect from './ClienteTipoSelect';
import ClienteDadosBasicos from './ClienteDadosBasicos';
import EnderecosSection from './EnderecosSection';
import FormActions from './FormActions';

import { useClienteForm } from './hooks/useClienteForm';
import { useCep } from './hooks/useCep';
import { useDocumentoDuplicado } from './hooks/useDocumentoDuplicado';

const ClienteForm = ({ initialData = {}, onSaved, onCancel }) => {
  const toast = useRef(null);

  // refs de foco (número)
  const numeroRefs = useRef({});

  const {
    tipoSelecionado,
    setTipoSelecionado,
    tipoOptions,
    cliente,
    loading,
    fieldErrors,
    setFieldErrors,
    formError,
    setFormError,
    handleChange,
    handleEnderecoChange,
    fillEnderecoFromCep,
    clearEnderecoFromCepNotFound,
    adicionarEndereco,
    removerEndereco,
    setEnderecoPrincipal,
    submit,
  } = useClienteForm({ initialData, onSaved, toast, extractApiError });

  const { docInvalido, setDocInvalido, checkDocumento, onDocumentoChange } = useDocumentoDuplicado({ toast });

  const { cepLoading, buscarCep } = useCep({
    toast,
    onFillEndereco: (index, viaCep) => {
      fillEnderecoFromCep(index, viaCep);
      // foco no "Número"
      setTimeout(() => {
        const ref = numeroRefs.current?.[index];
        ref?.focus?.();
      }, 50);
    },
    onCepNotFound: (index) => clearEnderecoFromCepNotFound(index),
  });

  const isEdit = !!cliente?.id;

  const registerNumeroRef = (idx, el) => {
    numeroRefs.current[idx] = el;
  };

  const onDocumentoBlur = async () => {
    await checkDocumento({ documento: cliente.documento, clienteId: cliente.id, setFieldErrors });
  };

  const onDocumentoChangeDebounced = (doc) => {
    setDocInvalido(false);
    setFormError('');
    onDocumentoChange({ documento: doc, clienteId: cliente.id, setFieldErrors });
  };

  const onBuscarCep = async (idx) => {
    const cepValue = cliente?.enderecos?.[idx]?.cep;
    await buscarCep({ index: idx, cepValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit();
  };

  if (!tipoSelecionado) {
    return (
      <>
        <Toast ref={toast} />
        <ClienteTipoSelect
          tipoSelecionado={tipoSelecionado}
          tipoOptions={tipoOptions}
          onChange={setTipoSelecionado}
          error={fieldErrors?.tipo}
        />
      </>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <form onSubmit={handleSubmit} className="p-fluid">
        {/* Header */}
        <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-2 mb-3">
          <div>
            <div className="flex align-items-center gap-2">
              <h3 className="m-0">{isEdit ? 'Editar cliente' : 'Novo cliente'}</h3>
              <Tag value={tipoSelecionado === 'pj' ? 'PJ' : 'PF'} />
            </div>
            <small className="text-600">Preencha os dados e salve ao final</small>
          </div>

          <FormActions loading={loading} disabledSave={docInvalido} onCancel={onCancel} />
        </div>

        {formError && (
          <div className="p-3 mb-3 border-1 border-round surface-border">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-exclamation-triangle" />
              <span className="font-medium">Atenção:</span>
              <span className="text-700">{formError}</span>
            </div>
          </div>
        )}

        <div className="formgrid grid">
          <ClienteDadosBasicos
            tipoSelecionado={tipoSelecionado}
            tipoOptions={tipoOptions}
            cliente={cliente}
            fieldErrors={fieldErrors}
            onChangeField={handleChange}
            onDocumentoBlur={onDocumentoBlur}
            onDocumentoChangeDebounced={onDocumentoChangeDebounced}
          />

          <EnderecosSection
            enderecos={cliente.enderecos}
            fieldErrors={fieldErrors}
            onAdd={adicionarEndereco}
            onRemove={removerEndereco}
            onSetPrincipal={setEnderecoPrincipal}
            onChangeField={handleEnderecoChange}
            onBuscarCep={onBuscarCep}
            cepLoading={cepLoading}
            registerNumeroRef={registerNumeroRef}
          />

          {/* Footer actions */}
          <div className="col-12 mt-2 flex justify-content-end gap-2">
            <FormActions loading={loading} disabledSave={docInvalido} onCancel={onCancel} />
          </div>
        </div>
      </form>
    </>
  );
};

export default ClienteForm;
