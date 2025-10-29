import React from 'react';
import SakaiLayout from '../layouts/SakaiLayout';
import ImportacaoProdutoXML from '../components/importacaoProduto/ImportacaoProdutoXML';

const ImportacaoProdutos = () => {
  return (
    <SakaiLayout>
      <div className="importacao-produtos p-5">
        <h2 className="text-2xl font-semibold mb-3">Importação de Produtos via XML da NF-e</h2>
        <p className="text-gray-700 mb-5">
          Envie o arquivo XML da nota fiscal eletrônica para importar produtos.
          Revise os itens antes de confirmar a entrada no estoque.
        </p>

        <ImportacaoProdutoXML />
      </div>
    </SakaiLayout>
  );
};

export default ImportacaoProdutos;
