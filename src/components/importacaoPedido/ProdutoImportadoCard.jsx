import React from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Accordion, AccordionTab } from 'primereact/accordion';

const ProdutoImportadoCard = ({ item, index, categorias, depositos, onChangeItem }) => {
  const quantidade = Number(item.quantidade) || 0;
  const totalItem = Number(item.valor) || 0;
  const valorUnitario = quantidade > 0 ? totalItem / quantidade : 0;
  const total = totalItem.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const handleFixosChange = (campo, value) => {
    const atualizados = { ...item.fixos, [campo]: value };
    onChangeItem(index, 'fixos', atualizados);
  };

  const handleAtributoChange = (grupo, campo, value) => {
    const atualizados = {
      ...item.atributos,
      [grupo]: {
        ...item.atributos?.[grupo],
        [campo]: value,
      },
    };
    onChangeItem(index, 'atributos', atualizados);
  };

  return (
    <Card
      title={`Produto ${index + 1}: ${item.nome || item.descricao?.slice(0, 50)}`}
      className={`mb-3 border-left-4 shadow-sm ${
        item.tipo === 'PRONTA ENTREGA' ? 'bg-blue-50' : 'bg-pink-50'
      } ${
        !item.id_categoria || !item.id_variacao ? 'border-red-300' : 'border-green-300'
      }`}
    >
      <div className="flex flex-column md:flex-row justify-between gap-4 p-3">
        <div className="flex-1">
          <fieldset className="mb-3">
            <legend className="text-sm font-medium text-gray-600">Informações do Produto</legend>
            <div className="formgrid grid">
              <div className="field col-12 md:col-3">
                <label className="block text-xs font-medium mb-1">Categoria</label>
                <Dropdown
                  value={item.id_categoria !== undefined && item.id_categoria !== null ? Number(item.id_categoria) : null}
                  options={categorias}
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione"
                  className={`w-full p-inputtext-sm ${!item.id_categoria ? 'p-invalid' : ''}`}
                  aria-label="Categoria"
                  filter
                  filterBy="nome"
                  onChange={(e) => onChangeItem(index, 'id_categoria', e.value)}
                />
              </div>

              <div className="field col-12 md:col-3">
                <label className="block text-xs font-medium mb-1">Referência</label>
                <InputText
                  value={item.ref || ''}
                  onChange={(e) => onChangeItem(index, 'ref', e.target.value)}
                  className="w-full p-inputtext-sm"
                  aria-label="Referência"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label className="block text-xs font-medium mb-1">Nome</label>
                <InputText
                  value={item.nome || ''}
                  onChange={(e) => onChangeItem(index, 'nome', e.target.value)}
                  className="w-full p-inputtext-sm"
                  aria-label="Nome do Produto"
                />
              </div>

              <div className="field col-12 md:col-4">
                <label className="block text-xs font-medium mb-1">Tipo</label>
                <Dropdown
                  value={item.tipo || ''}
                  options={[
                    { label: 'PEDIDO', value: 'PEDIDO' },
                    { label: 'PRONTA ENTREGA', value: 'PRONTA ENTREGA' }
                  ]}
                  onChange={(e) => onChangeItem(index, 'tipo', e.value)}
                  className="w-full p-inputtext-sm"
                  placeholder="Selecione"
                  aria-label="Tipo do Produto"
                />
              </div>

              <div className="field col-12 md:col-4">
                <label className="block text-xs font-medium mb-1">Depósito</label>
                <Dropdown
                  value={item.id_deposito || null}
                  options={depositos}
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione"
                  className={`w-full p-inputtext-sm ${!item.id_deposito ? 'p-invalid' : ''}`}
                  onChange={(e) => onChangeItem(index, 'id_deposito', e.value)}
                  filter
                />
              </div>

              <div className="field col-6 md:col-2">
                <label className="block text-xs font-medium mb-1">Quantidade</label>
                <InputNumber
                  value={item.quantidade}
                  onValueChange={(e) => onChangeItem(index, 'quantidade', e.value)}
                  min={1}
                  className="w-full p-inputtext-sm"
                  aria-label="Quantidade"
                />
              </div>

              <div className="field col-6 md:col-3">
                <label className="block text-xs font-medium mb-1">Valor Unitário</label>
                <InputNumber
                  value={valorUnitario}
                  onValueChange={(e) => {
                    const novoUnitario = e.value || 0;
                    const novoTotal = novoUnitario * (item.quantidade || 0);
                    onChangeItem(index, 'valor', parseFloat(novoTotal.toFixed(2)));
                  }}
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  className="w-full p-inputtext-sm"
                  aria-label="Valor Unitário"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-3">
            <legend className="text-sm font-medium text-gray-600">Dimensões</legend>
            <div className="formgrid grid">
              {['largura', 'profundidade', 'altura'].map((campo) => (
                <div key={campo} className="field col-4">
                  <label className="block text-xs font-medium mb-1">
                    {campo.charAt(0).toUpperCase() + campo.slice(1)}
                  </label>
                  <InputNumber
                    value={item.fixos?.[campo] || null}
                    onValueChange={(e) => handleFixosChange(campo, e.value)}
                    className="w-full p-inputtext-sm"
                    aria-label={campo}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {item.atributos && (
            <Accordion multiple activeIndex={[0]}>
              {['cores', 'tecidos', 'acabamentos', 'observacoes'].map((grupo) =>
                item.atributos?.[grupo] ? (
                  <AccordionTab
                    key={grupo}
                    header={grupo.charAt(0).toUpperCase() + grupo.slice(1)}
                  >
                    <div className="formgrid grid">
                      {Object.entries(item.atributos[grupo]).map(([campo, valor]) => (
                        <div
                          key={`${grupo}-${campo}`}
                          className={`field ${
                            grupo === 'observacoes' ? 'col-12' : 'col-12 md:col-4'
                          }`}
                        >
                          <label className="block text-xs font-medium mb-1">
                            {campo.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </label>
                          {grupo === 'observacoes' ? (
                            <InputTextarea
                              value={valor}
                              onChange={(e) =>
                                handleAtributoChange(grupo, campo, e.target.value)
                              }
                              className="w-full p-inputtextarea-sm"
                              rows={3}
                              aria-label={`${grupo} - ${campo}`}
                            />
                          ) : (
                            <InputText
                              value={valor}
                              onChange={(e) =>
                                handleAtributoChange(grupo, campo, e.target.value)
                              }
                              className="w-full p-inputtext-sm"
                              aria-label={`${grupo} - ${campo}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionTab>
                ) : null
              )}
            </Accordion>
          )}
        </div>

        <div className="flex flex-column gap-2 text-right min-w-48 md:w-64 justify-between">
          <div>
            <span className="block text-sm font-medium">Total: {total}</span>
            <div className="mt-2">
              {item.id_variacao ? (
                <Tag severity="success" value="Produto vinculado" />
              ) : (
                <Tag severity="warning" value="Produto não cadastrado" />
              )}
            </div>
            {!item.id_categoria && (
              <div className="mt-2">
                <Tag severity="danger" value="Categoria obrigatória" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProdutoImportadoCard;
