import React from 'react';
import { Button } from 'primereact/button';
import { ButtonGroup } from 'primereact/buttongroup';

const TableActions = ({ rowData, onEdit, onDelete }) => {
  return (
    <ButtonGroup>
      <Button
        label="Editar"
        icon="pi pi-pencil"
        severity="info"
        onClick={() => onEdit(rowData)}
      />
      <Button
        label="Excluir"
        icon="pi pi-trash"
        severity="danger"
        onClick={() => onDelete(rowData.id)}
      />
    </ButtonGroup>
  );
};

export default TableActions;
