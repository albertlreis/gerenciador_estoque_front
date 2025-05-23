import React, { useRef } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import ImportacaoPedidoPDF from '../components/ImportacaoPedidoPDF';

const ImportacaoPedidos = () => {
  const toast = useRef(null);

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="importacao-pedidos" style={{ margin: '2rem' }}>
        <h2>Importação de Pedidos via PDF</h2>
        <p className="mb-4">
          Faça upload de um arquivo PDF gerado por outro sistema. Os dados serão extraídos e você poderá revisar antes de confirmar.
        </p>
        <ImportacaoPedidoPDF />
      </div>
    </SakaiLayout>
  );
};

export default ImportacaoPedidos;
