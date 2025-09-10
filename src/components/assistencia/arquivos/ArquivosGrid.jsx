import React from 'react';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Image } from 'primereact/image';

/**
 * @typedef {{id:number, url:string, nome?:string, mime?:string, tamanho?:number, created_at?:string}} AssistenciaArquivoDTO
 */

/**
 * Grid responsivo de miniaturas de arquivos (fotos).
 * Usa ConfirmPopup ancorado no botão de exclusão para evitar reabrir após aceitar.
 *
 * @param {{
 *   items: AssistenciaArquivoDTO[],
 *   onDelete?: (id:number)=>void,
 * }} props
 */
export default function ArquivosGrid({ items, onDelete }) {
  function handleAskDelete(event, id) {
    confirmPopup({
      target: event.currentTarget,
      message: 'Deseja remover esta foto?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => onDelete?.(id),
    });
  }

  return (
    <div className="grid">
      {/* Um único portal do ConfirmPopup por grid */}
      <ConfirmPopup />

      {items?.length ? items.map((arq) => (
        <div className="col-6 sm:col-4 md:col-3 lg:col-2" key={arq.id}>
          <div className="surface-card border-1 surface-border p-2 border-round flex flex-column gap-2">
            <Image
              src={arq.url}
              alt={arq.nome ?? `#${arq.id}`}
              preview
              imageClassName="w-full border-round"
              className="w-full"
            />
            <div className="flex justify-content-between align-items-center">
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                onClick={(e) => handleAskDelete(e, arq.id)}
              />
            </div>
          </div>
        </div>
      )) : (
        <div className="col-12"><div className="text-600">Nenhuma foto enviada.</div></div>
      )}
    </div>
  );
}
