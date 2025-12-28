import React from 'react';
import { Button } from 'primereact/button';

const TableActions = ({
                        rowData,
                        onEdit,
                        onDelete,
                        disabledEdit = false,
                        disabledDelete = false,
                      }) => {
  return (
    <div className="flex align-items-center gap-2">
      <Button
        type="button"
        icon="pi pi-pencil"
        className="p-button-text p-button-sm"
        tooltip="Editar"
        tooltipOptions={{ position: 'top' }}
        disabled={disabledEdit}
        onClick={() => onEdit?.(rowData)}
      />
      <Button
        type="button"
        icon="pi pi-trash"
        className="p-button-text p-button-sm p-button-danger"
        tooltip="Excluir"
        tooltipOptions={{ position: 'top' }}
        disabled={disabledDelete}
        onClick={(e) => onDelete?.(e, rowData?.id)}
      />
    </div>
  );
};

export default TableActions;
