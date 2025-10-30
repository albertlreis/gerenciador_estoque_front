import React, {useState} from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';

export default function ImportacaoDialogs({ visible, nota, onHide, onConfirm }) {
  const [dataEntrada, setDataEntrada] = useState(new Date());

  return (
    <Dialog
      header="Confirmar Importação"
      visible={visible}
      modal
      style={{ width: '500px' }}
      onHide={onHide}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancelar" className="p-button-text" onClick={onHide} />
          <Button
            label="Confirmar"
            icon="pi pi-check"
            className="p-button-success"
            onClick={() => onConfirm(dataEntrada)} // passa data para o pai
          />
        </div>
      }
    >
      <p>
        Confirma a importação da NF <b>{nota?.numero}</b> do fornecedor{' '}
        <b>{nota?.fornecedor_nome}</b>?
      </p>

      <div className="mt-4">
        <label className="block text-sm font-semibold mb-1">Data de entrada no estoque</label>
        <Calendar
          value={dataEntrada}
          onChange={e => setDataEntrada(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          showButtonBar
        />
      </div>
    </Dialog>
  );
}
