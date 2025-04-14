import React from 'react';
import { Button } from 'primereact/button';
import { ButtonGroup } from 'primereact/buttongroup';

const TableActions = ({ rowData, onEdit, onDelete }) => {
  return (
    <ButtonGroup>
      <Button
        label=""
        icon="pi pi-pencil"
        severity="info"
        onClick={() => onEdit(rowData)}
        tooltip="Editar"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        label=""
        icon="pi pi-trash"
        severity="danger"
        style={{ marginLeft: '0.5em' }}
        onClick={() => onDelete(rowData.id)}
        tooltip="Excluir"
        tooltipOptions={{ position: 'top' }}
      />
    </ButtonGroup>
  );
};

export default TableActions;
