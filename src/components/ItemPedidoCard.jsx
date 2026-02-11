import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { formatarValor } from '../utils/formatters';
import getImageSrc from '../utils/getImageSrc';

const ItemPedidoCard = ({
                          item,
                          emFalta,
                          emFaltaNoConsignado,
                          depositosDisponiveis,
                          onAtualizarQuantidade,
                          onRemoverItem,
                          onAtualizarDeposito,
                          onVerLocalizacao,
                        }) => {
  const estoqueDisponivel = item.variacao?.estoque_total ?? 0;

  return (
    <div
      key={item.id}
      className={`grid border-bottom pb-4 mb-4 transition-all duration-300 ${
        emFaltaNoConsignado ? 'border-red-500 bg-red-50' : ''
      }`}
    >
      <div className="col-12 md:col-3 flex justify-content-center">
        <img
          src={
            item.variacao?.produto?.imagem_principal
              ? getImageSrc(item.variacao.produto.imagem_principal)
              : 'https://placehold.co/500x300?text=Sem+Imagem'
          }
          alt={item.variacao?.nome_completo || 'Produto'}
          className="shadow-1 border-round"
          style={{ width: '100%', objectFit: 'cover' }}
        />
      </div>

      <div className="col-12 md:col-9">
        <div className="font-medium text-lg mb-1">{item.variacao?.produto?.nome || 'Produto'}</div>

        {Array.isArray(item.variacao?.atributos) && item.variacao.atributos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {item.variacao.atributos.map((attr, idx) => (
              <span key={idx} className="text-sm px-2 py-1 bg-blue-100 border-round">
                {attr.atributo}: {attr.valor}
              </span>
            ))}
          </div>
        )}

        <div className="mb-2">
          <label className="text-sm block font-medium mb-1">Depósito de saída</label>
          <Dropdown
            value={item.id_deposito}
            options={depositosDisponiveis}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => onAtualizarDeposito(item.id, e.value)}
            placeholder="Selecione o depósito"
            emptyMessage="Nenhum depósito disponível"
            className="w-full"
          />
        </div>

        <div className="flex align-items-center gap-3 mb-2">
          <InputNumber
            value={item.quantidade}
            min={0}
            onValueChange={(e) => onAtualizarQuantidade(item, e.value)}
            showButtons
            buttonLayout="horizontal"
            decrementButtonClassName="p-button-text"
            incrementButtonClassName="p-button-text"
            inputStyle={{ width: 60 }}
          />
          <Button
            icon="pi pi-trash"
            className="p-button-sm p-button-text p-button-danger"
            onClick={() =>
              confirmDialog({
                message: 'Deseja remover este item?',
                header: 'Remover Item',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Sim',
                rejectLabel: 'Cancelar',
                accept: () => onRemoverItem(item.id),
              })
            }
          />
          <Button
            label="Localização"
            className="p-button-text p-button-sm"
            icon="pi pi-map-marker"
            onClick={() => onVerLocalizacao(item)}
          />
        </div>

        {emFalta && <div className="text-sm text-red-600 mb-2">Estoque insuficiente: disponível {estoqueDisponivel}</div>}

        <div className="flex justify-content-between text-sm text-gray-700">
          <span>Unit: {formatarValor(item.preco_unitario)}</span>
          <span>Subtotal: {formatarValor(item.subtotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemPedidoCard;
