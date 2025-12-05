import React from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';

/**
 * Componente responsável por exibir um produto importado do PDF,
 * permitindo revisar categoria, depósito, dimensões e atributos.
 *
 * Regras:
 * - Produtos com id_variacao (já cadastrados) têm atributos/nome/ref/categoria bloqueados.
 * - Quantidade, depósito e valores podem ser ajustados.
 * - Usuário pode remover qualquer item antes de confirmar.
 */
export default function ProdutoImportadoCard({
                                               item = {},
                                               index,
                                               categorias = [],
                                               depositos = [],
                                               onChangeItem,
                                               onRemove,
                                             }) {
  const quantidade = Number(item.quantidade) || 0;
  const totalItem = Number(item.valor) || 0;
  const valorUnitario = quantidade > 0 ? totalItem / quantidade : 0;

  const totalFormatado = totalItem.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const atributos = item.atributos || {};
  const fixos = item.fixos || {};

  const isCadastrado = !!item.id_variacao;

  // ==========================================================
  // Atualizações de campos
  // ==========================================================

  const handleFixosChange = (campo, value) => {
    if (isCadastrado) return; // dimensões bloqueadas para cadastrados
    onChangeItem(index, 'fixos', { ...fixos, [campo]: value });
  };

  const atualizarAtributo = (campo, valor) => {
    if (isCadastrado) return; // atributos bloqueados para cadastrados
    onChangeItem(index, 'atributos', { ...atributos, [campo]: valor });
  };

  const categoriasOptions = categorias.map((c) => ({
    label: c.nome,
    value: Number(c.id),
  }));

  const depositosOptions = depositos.map((d) => ({
    label: d.nome,
    value: Number(d.id),
  }));

  return (
    <Card
      title={`Produto ${index + 1}: ${item.nome || item.descricao || ''}`}
      className={`mb-3 border-left-4 shadow-sm ${
        item.id_variacao ? 'bg-green-50' : 'bg-yellow-50'
      } ${!item.id_categoria ? 'border-red-300' : 'border-green-300'}`}
    >
      <div className="flex flex-column md:flex-row justify-between gap-4 p-3">
        {/* COLUNA PRINCIPAL */}
        <div className="flex-1">
          {/* Informações principais */}
          <fieldset className="mb-3">
            <legend className="text-sm font-medium text-gray-600">
              Informações do Produto
            </legend>

            <div className="formgrid grid">
              {/* Categoria */}
              <div className="field col-12 md:col-3">
                <label className="block text-xs font-medium mb-1">Categoria</label>
                <Dropdown
                  value={item.id_categoria || null}
                  options={categoriasOptions}
                  placeholder="Selecione"
                  className={`w-full p-inputtext-sm ${
                    !item.id_categoria ? 'p-invalid' : ''
                  }`}
                  onChange={(e) => !isCadastrado && onChangeItem(index, 'id_categoria', e.value)}
                  filter
                  disabled={isCadastrado}
                />
              </div>

              {/* Referência */}
              <div className="field col-12 md:col-3">
                <label className="block text-xs font-medium mb-1">Referência</label>
                <InputText
                  value={item.ref || ''}
                  onChange={(e) => onChangeItem(index, 'ref', e.target.value)}
                  className="w-full p-inputtext-sm"
                  disabled={isCadastrado}
                />
              </div>

              {/* Nome */}
              <div className="field col-12 md:col-6">
                <label className="block text-xs font-medium mb-1">Nome</label>
                <InputText
                  value={item.nome || ''}
                  onChange={(e) => onChangeItem(index, 'nome', e.target.value)}
                  className="w-full p-inputtext-sm"
                  disabled={isCadastrado}
                />
              </div>

              {/* Depósito */}
              <div className="field col-12 md:col-4">
                <label className="block text-xs font-medium mb-1">Depósito</label>
                <Dropdown
                  value={item.id_deposito || null}
                  options={depositosOptions}
                  placeholder="Selecione"
                  className={`w-full p-inputtext-sm ${
                    !item.id_deposito ? '' : ''
                  }`}
                  onChange={(e) => onChangeItem(index, 'id_deposito', e.value)}
                  filter
                />
              </div>

              {/* Quantidade */}
              <div className="field col-6 md:col-2">
                <label className="block text-xs font-medium mb-1">Quantidade</label>
                <InputNumber
                  value={item.quantidade}
                  onValueChange={(e) => onChangeItem(index, 'quantidade', e.value)}
                  min={1}
                  className="w-full p-inputtext-sm"
                />
              </div>

              {/* Valor Unitário */}
              <div className="field col-6 md:col-3">
                <label className="block text-xs font-medium mb-1">Valor Unitário</label>
                <InputNumber
                  value={valorUnitario}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  onValueChange={(e) => {
                    const novoUnitario = e.value || 0;
                    const novaQuantidade = Number(item.quantidade || 0) || 1;
                    const novoTotal = novoUnitario * novaQuantidade;
                    onChangeItem(index, 'valor', Number(novoTotal.toFixed(2)));
                  }}
                  className="w-full p-inputtext-sm"
                />
              </div>
            </div>
          </fieldset>

          {/* Dimensões */}
          <fieldset className="mb-3">
            <legend className="text-sm font-medium text-gray-600">Dimensões</legend>

            <div className="formgrid grid">
              {['largura', 'profundidade', 'altura'].map((campo) => (
                <div key={campo} className="field col-4">
                  <label className="block text-xs font-medium mb-1">
                    {campo[0].toUpperCase() + campo.substring(1)}
                  </label>

                  <InputNumber
                    value={fixos[campo] || null}
                    onValueChange={(e) => handleFixosChange(campo, e.value)}
                    className="w-full p-inputtext-sm"
                    disabled={isCadastrado}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {/* ATRIBUTOS */}
          {atributos && Object.keys(atributos).length > 0 && (
            <Accordion multiple activeIndex={[0]}>
              <AccordionTab header="Atributos do Produto">
                <div className="formgrid grid">
                  {Object.entries(atributos).map(([key, value]) => (
                    <div key={key} className="field col-12 md:col-6">
                      <label className="block text-xs font-medium mb-1">
                        {key.replace('_', ' ').toUpperCase()}
                      </label>

                      {key === 'observacao' ? (
                        <InputTextarea
                          value={value || ''}
                          rows={2}
                          className="w-full"
                          onChange={(e) => atualizarAtributo(key, e.target.value)}
                          disabled={isCadastrado}
                        />
                      ) : (
                        <InputText
                          value={value || ''}
                          className="w-full p-inputtext-sm"
                          onChange={(e) => atualizarAtributo(key, e.target.value)}
                          disabled={isCadastrado}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionTab>
            </Accordion>
          )}
        </div>

        {/* COLUNA LATERAL */}
        <div className="flex flex-column gap-2 text-right min-w-48 md:w-64 justify-between">
          <div>
            <span className="block text-sm font-medium">Total: {totalFormatado}</span>

            <div className="mt-2">
              {item.id_variacao ? (
                <Tag
                  severity="success"
                  value="Produto já cadastrado"
                  style={{ background: '#16a34a', color: 'white', fontWeight: 'bold' }}
                />
              ) : (
                <Tag
                  severity="warning"
                  value="Produto novo"
                  style={{ background: '#f59e0b', color: 'black', fontWeight: 'bold' }}
                />
              )}
            </div>

            {!item.id_categoria && (
              <div className="mt-2">
                <Tag
                  severity="danger"
                  value="Categoria obrigatória"
                  style={{ background: '#dc2626', color: 'white' }}
                />
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-content-end">
            <Button
              type="button"
              icon="pi pi-trash"
              label="Remover"
              className="p-button-text p-button-danger"
              onClick={() => onRemove?.(index)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
