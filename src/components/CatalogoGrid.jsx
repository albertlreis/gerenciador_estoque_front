import React, { useState } from 'react';
import ProdutoCard from './ProdutoCard';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';

const CatalogoGrid = ({ produtos }) => {
  const [selectedProduto, setSelectedProduto] = useState(null);

  const openDetalhes = (produto) => {
    setSelectedProduto(produto);
  };

  const closeDetalhes = () => {
    setSelectedProduto(null);
  };

  if (!produtos.length) {
    return <p>Nenhum produto encontrado.</p>;
  }

  return (
    <>
      <div className="grid">
        {produtos.map((produto) => (
          <div key={produto.id} className="col-12 sm:col-6 md:col-4 lg:col-3">
            <ProdutoCard produto={produto} onDetalhes={() => openDetalhes(produto)} />
          </div>
        ))}
      </div>

      <Dialog
        header={selectedProduto?.nome || ''}
        visible={!!selectedProduto}
        style={{ width: '600px' }}
        modal
        onHide={closeDetalhes}
      >
        {selectedProduto && (
          <div className="p-fluid">
            <img
              src={selectedProduto.imagens?.[0]?.url
                ? `${process.env.REACT_APP_BASE_URL_ESTOQUE}/${process.env.REACT_APP_PRODUCT_IMAGES_FOLDER}/${selectedProduto.imagens[0].url}`
                : 'https://placehold.co/500x300?text=Sem+Imagem'}
              alt={selectedProduto.nome}
              style={{ width: '100%', objectFit: 'cover' }}
              className="mb-3 border-round"
            />
            <p><strong>Descrição:</strong> {selectedProduto.descricao || 'Sem descrição.'}</p>
            <p><strong>SKU:</strong> {selectedProduto.variacoes?.[0]?.sku || 'N/A'}</p>
            <p><strong>Preço:</strong> R$ {
              isNaN(Number(selectedProduto.variacoes?.[0]?.preco))
                ? '-'
                : Number(selectedProduto.variacoes[0].preco).toFixed(2)
            }</p>
            <Divider/>
            <p><strong>Atributos:</strong></p>
            <ul>
              {selectedProduto.variacoes?.[0]?.atributos?.map((attr, index) => (
                <li key={index}>{attr.atributo}: {attr.valor}</li>
              )) || <li>Nenhum atributo</li>}
            </ul>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default CatalogoGrid;
