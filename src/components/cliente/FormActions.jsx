import React from 'react';
import { Button } from 'primereact/button';

const FormActions = ({ loading, disabledSave, onCancel, onSubmitLabel = 'Salvar' }) => {
  return (
    <div className="flex gap-2">
      <Button label={onSubmitLabel} type="submit" icon="pi pi-check" disabled={disabledSave} loading={loading} />
      <Button label="Cancelar" type="button" icon="pi pi-times" className="p-button-secondary" onClick={onCancel} disabled={loading} />
    </div>
  );
};

export default FormActions;
