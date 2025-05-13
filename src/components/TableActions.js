import React from 'react';
import { Button } from 'primereact/button';

const TableActions = ({ rowData, onEdit, onDelete }) => {
  return (
    <div className="flex align-items-center gap-2">
      <Button
        icon="pi pi-pencil"
        severity="info"
        onClick={() => onEdit(rowData)}
        tooltip="Editar"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        onClick={(e) => onDelete(e, rowData.id)}
        tooltip="Excluir"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );
};

export default TableActions;
