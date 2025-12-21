import React from 'react';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';

export function RelatoriosActionsBar({
                                       tipo,
                                       hasFilters,
                                       loading,
                                       loadingFiltrosPedidos,
                                       onLimpar,
                                       onPdf,
                                       onExcel,
                                     }) {
  const exportActions = [
    {
      label: loading ? 'Gerando…' : 'Exportar Excel',
      icon: loading ? 'pi pi-spinner pi-spin' : 'pi pi-file-excel',
      command: onExcel,
      disabled: !tipo || loading || loadingFiltrosPedidos,
    },
  ];

  return (
    <>
      <Divider />
      <div
        className="surface-0 border-top-1 border-200 p-3 flex gap-2 flex-wrap justify-content-end"
        style={{ position: 'sticky', bottom: 0, zIndex: 1 }}
      >
        <Button
          label="Limpar Filtros"
          icon="pi pi-filter-slash"
          className="p-button-secondary"
          onClick={onLimpar}
          disabled={!tipo || loading || !hasFilters}
        />

        <SplitButton
          label="Gerar PDF"
          icon={loading ? 'pi pi-spinner pi-spin' : 'pi pi-file-pdf'}
          className="p-button-danger"
          onClick={onPdf}
          model={exportActions}
          disabled={!tipo || loading || loadingFiltrosPedidos}
        />
      </div>
    </>
  );
}
