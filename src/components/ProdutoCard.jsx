import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

const ProdutoCard = ({ produto, onDetalhes }) => {
  const imagem = produto.imagens?.[0]?.url
    ? `${process.env.REACT_APP_BASE_URL_ESTOQUE}/${process.env.REACT_APP_PRODUCT_IMAGES_FOLDER}/${produto.imagens[0].url}`
    : 'https://placehold.co/200x200?text=Sem+Imagem';

  return (
    <Card
      title={produto.nome}
      subTitle={`SKU: ${produto.variacoes?.[0]?.sku || 'N/A'}`}
      className="shadow-3"
      header={<img alt={produto.nome} src={imagem} style={{ width: '100%', objectFit: 'cover' }} />}
    >
      <p className="m-0">{produto.descricao || 'Sem descrição disponível.'}</p>
      <Button label="Detalhes" icon="pi pi-search" className="p-button-text mt-3" onClick={onDetalhes} />
    </Card>
  );
};

export default ProdutoCard;
