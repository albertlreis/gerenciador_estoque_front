import React, { useState } from 'react';
import ProdutoCard from './ProdutoCard';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import formatarPreco from '../utils/formatarPreco';
import getImageSrc from '../utils/getImageSrc';

/**
 * Componente responsável por exibir os produtos em grid com suporte ao botão de "Detalhes"
 * e integração com o carrinho de compras.
 *
 * @param {Array} produtos - Lista de produtos para exibir
 * @param {Function} onAdicionarAoCarrinho - Função chamada ao clicar em "Adicionar" no ProdutoCard
 */
const CatalogoGrid = ({ produtos, onAdicionarAoCarrinho }) => {
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
            <ProdutoCard
              produto={produto}
              onDetalhes={() => openDetalhes(produto)}
              onAdicionar={() => onAdicionarAoCarrinho && onAdicionarAoCarrinho(produto)}
            />
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
        {selectedProduto && (() => {
          return (
            <div className="p-fluid">
              <img
                src={selectedProduto.imagem_principal
                  ? getImageSrc(selectedProduto.imagem_principal)
                  : 'https://placehold.co/500x300?text=Sem+Imagem'}
                alt={selectedProduto.nome}
                style={{width: '100%', objectFit: 'cover'}}
                className="mb-3 border-round"
              />

              <p><strong>Descrição:</strong> {selectedProduto.descricao || 'Sem descrição.'}</p>

              <Divider/>

              <p><strong>Variações:</strong></p>
              {selectedProduto.variacoes?.length > 0 ? (
                selectedProduto.variacoes.map((variacao, idx) => {
                  const preco = Number(variacao.preco || 0);
                  const quantidade = variacao.estoque?.quantidade ?? 0;

                  return (
                    <div key={idx} className="mb-3 border-bottom-1 surface-border pb-2">
                      <p><strong>Nome:</strong> {variacao.nome}</p>
                      <p><strong>Referência:</strong> {variacao.referencia || 'N/A'}</p>
                      <p><strong>Preço:</strong>{' '}
                        {selectedProduto.is_outlet && variacao.outlets?.length > 0 ? (() => {
                          const outletsValidos = variacao.outlets.filter(o => o.quantidade_restante > 0);
                          if (outletsValidos.length === 0) return <span>{formatarPreco(preco)}</span>;

                          const melhorOutlet = outletsValidos.reduce((menor, atual) =>
                            atual.percentual_desconto > menor.percentual_desconto ? atual : menor
                          );

                          const precoOutlet = preco * (1 - melhorOutlet.percentual_desconto / 100);

                          return (
                            <>
                              <span style={{textDecoration: 'line-through', marginRight: '0.5rem', color: '#999'}}>
                                {formatarPreco(preco)}
                              </span>
                              <span style={{fontWeight: 'bold', color: '#0f9d58', marginRight: '0.5rem'}}>
                                {formatarPreco(precoOutlet)}
                              </span>
                              <span style={{color: '#d32f2f', fontWeight: 'bold'}}>
                                (-{melhorOutlet.percentual_desconto}%)
                              </span>
                            </>
                          );
                        })() : (
                          <span>{formatarPreco(preco)}</span>
                        )}
                      </p>


                      <p><strong>Estoque disponível:</strong>{' '}
                        <Tag
                          value={`${quantidade} un.`}
                          severity={quantidade > 0 ? 'success' : 'danger'}
                        />
                      </p>

                      <p><strong>Atributos:</strong></p>
                      <ul className="pl-3">
                        {variacao.atributos?.length > 0 ? (
                          variacao.atributos.map((attr, i) => (
                            <li key={i}>{attr.atributo}: {attr.valor}</li>
                          ))
                        ) : (
                          <li>Nenhum atributo</li>
                        )}
                      </ul>
                    </div>
                  );
                })
              ) : (
                <p>Nenhuma variação cadastrada.</p>
              )}
            </div>
          );
        })()}
      </Dialog>
    </>
  );
};

export default CatalogoGrid;
