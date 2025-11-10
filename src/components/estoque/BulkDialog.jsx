import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

export default function BulkDialog({ showBulk, setShowBulk, bulkText, setBulkText, bulkLoading, setBulkLoading, onProcessar }) {
  return (
    <Dialog
      visible={showBulk}
      onHide={() => !bulkLoading && setShowBulk(false)}
      header="Colar lista de códigos"
      style={{ width: '40rem', maxWidth: '95vw' }}
      modal
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" onClick={() => setShowBulk(false)} disabled={bulkLoading} />
          <Button
            label="Processar"
            icon="pi pi-check"
            onClick={() => {
              const lines = (bulkText || '').split('\n').map((l) => l.trim()).filter(Boolean);
              if (!lines.length) return;
              setBulkLoading(true);
              onProcessar(lines);
              setBulkLoading(false);
              setShowBulk(false);
            }}
            disabled={bulkLoading}
          />
        </div>
      }
    >
      <p className="text-sm mb-2">
        Cole uma lista, 1 código por linha. Pode usar quantidades: <code>10*789...</code> ou <code>789...*10</code>.
      </p>
      <InputTextarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={10} autoFocus style={{ width: '100%' }} />
    </Dialog>
  );
}
