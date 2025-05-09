import React, { useRef } from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import ImportacaoProdutoXML from '../components/ImportacaoProdutoXML';

const ImportacaoProdutos = () => {
  const toast = useRef(null);

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="importacao-produtos" style={{ margin: '2rem' }}>
        <h2>Importação de Produtos via XML da NF-e</h2>
        <p className="mb-4">Envie um arquivo XML de nota fiscal eletrônica e revise os produtos antes de salvar.</p>

        <ImportacaoProdutoXML />
      </div>
    </SakaiLayout>
  );
};

export default ImportacaoProdutos;
