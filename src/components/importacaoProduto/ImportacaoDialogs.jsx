import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export default function ImportacaoDialogs({ nota, visible, onHide, onConfirm }) {
  return (
    <Dialog
      header="Confirmar importação"
      visible={visible}
      modal
      onHide={onHide}
      style={{ width: '32rem', maxWidth: '95vw' }}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancelar" className="p-button-text" onClick={onHide} />
          <Button label="Confirmar" icon="pi pi-save" onClick={onConfirm} className="p-button-success" />
        </div>
      }
    >
      <p>
        Deseja confirmar a importação da NF <strong>{nota?.numero}</strong>?
      </p>
      <p>Isso criará/atualizará os produtos e registrará a entrada no estoque.</p>
    </Dialog>
  );
}
