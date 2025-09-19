import React from 'react';
import { Dialog } from 'primereact/dialog';

export default function LocalizacoesModal({ visible, onHide, item, depositos }) {
  const registros = Array.isArray(depositos) ? depositos : [];
  return (
    <Dialog header="Localizações do produto" visible={visible} onHide={onHide} style={{ width: '40rem' }}>
      {!item ? (
        <p>Nenhum item selecionado.</p>
      ) : registros.length === 0 ? (
        <p>Sem localizações cadastradas para esta variação.</p>
      ) : (
        <div className="flex flex-column gap-2">
          {registros.map((d, i) => (
            <div key={i} className="p-2 border-round border-1 surface-border">
              <div className="font-semibold">{d.nome}</div>
              <div className="text-sm">Quantidade: {d.quantidade ?? 0}</div>
              {d.localizacao && (
                <div className="text-sm">
                  {['corredor','prateleira','coluna','nivel','setor'].map(k => d.localizacao[k] ? `${k}: ${d.localizacao[k]}` : null).filter(Boolean).join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
