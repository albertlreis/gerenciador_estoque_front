import React, { useRef } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import ImportacaoPedidoPDF from '../components/ImportacaoPedidoPDF';

const ImportacaoPedidos = () => {
  const toast = useRef(null);

  return (
    <SakaiLayout>
      <Toast ref={toast}/>
      <ConfirmDialog/>
      <div className="importacao-pedidos p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-2">Importação de Pedidos via PDF</h1>
        <p className="text-muted mb-4">
          Faça upload de um arquivo PDF gerado por outro sistema. Os dados serão extraídos e você poderá revisar antes
          de confirmar.
        </p>
        <ImportacaoPedidoPDF/>
      </div>

    </SakaiLayout>
  );
};

export default ImportacaoPedidos;
