import React from 'react';
import { formatarReal } from '../utils/formatters';

const ProdutosDetalhes = ({ pedido }) => (
  <div className="p-3" style={{ minWidth: '350px' }}>
    <h4 className="mb-3">Produtos</h4>
    {pedido?.produtos?.length > 0 ? (
      <table className="w-full text-sm">
        <thead>
        <tr>
          <th className="text-left">Produto</th>
          <th className="text-center">Qtd</th>
          <th className="text-right">Valor</th>
        </tr>
        </thead>
        <tbody>
        {pedido.produtos.map((p, i) => (
          <tr key={i}>
            <td>{p.nome}{p.variacao ? ` (${p.variacao})` : ''}</td>
            <td className="text-center">{p.quantidade}</td>
            <td className="text-right">{formatarReal(p.valor)}</td>
          </tr>
        ))}
        </tbody>
      </table>
    ) : (
      <p className="text-sm text-gray-500">Nenhum produto vinculado.</p>
    )}

    {pedido?.observacoes && (
      <>
        <h5 className="mt-3">Observações</h5>
        <p>{pedido.observacoes}</p>
      </>
    )}
  </div>
);

export default ProdutosDetalhes;
