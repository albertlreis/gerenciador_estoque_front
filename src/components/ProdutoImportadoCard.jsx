import React from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';

const ProdutoImportadoCard = ({ item, index, categorias, onChangeItem }) => {
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

  const total = ((item.quantidade ?? 0) * (item.valor ?? 0)).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <Card
      className={`mb-3 border-left-4 shadow-sm ${
        item.tipo === 'PRONTA ENTREGA' ? 'bg-blue-50' : 'bg-pink-50'
      } ${
        !item.id_categoria || !item.id_variacao ? 'border-red-300' : 'border-green-300'
      }`}
    >
      <div className="flex flex-column md:flex-row justify-between gap-4 p-3">
        <div className="flex-1">
          <div className="text-base font-semibold mb-3">{item.descricao}</div>

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
                  className="w-full p-inputtext-sm"
                  aria-label="Categoria"
                  filter
                  filterBy="nome"
                  onChange={(e) => {
                    console.log(
                      'Categoria selecionada:',
                      e.value,
                      categorias.find((c) => c.id === Number(e.value))
                    );
                    onChangeItem(index, 'id_categoria', e.value);
                  }}
                />
              </div>
              <div className="field col-12 md:col-3">
                <label className="block text-xs font-medium mb-1">Referência</label>
                <InputText value={item.ref || ''} onChange={(e) => onChangeItem(index, 'ref', e.target.value)}
                           className="w-full p-inputtext-sm" aria-label="Referência" />
              </div>
              <div className="field col-12 md:col-6">
                <label className="block text-xs font-medium mb-1">Nome</label>
                <InputText value={item.nome || ''} onChange={(e) => onChangeItem(index, 'nome', e.target.value)}
                           className="w-full p-inputtext-sm" aria-label="Nome do Produto" />
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
              <div className="field col-6 md:col-2">
                <label className="block text-xs font-medium mb-1">Quantidade</label>
                <InputNumber value={item.quantidade} onValueChange={(e) => onChangeItem(index, 'quantidade', e.value)}
                             min={1} className="w-full p-inputtext-sm" aria-label="Quantidade" />
              </div>
              <div className="field col-6 md:col-3">
                <label className="block text-xs font-medium mb-1">Valor Unitário</label>
                <InputNumber value={item.valor} onValueChange={(e) => onChangeItem(index, 'valor', e.value)}
                             mode="currency" currency="BRL" locale="pt-BR" className="w-full p-inputtext-sm"
                             aria-label="Valor Unitário" />
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
                  <InputNumber value={item.fixos?.[campo] || null}
                               onValueChange={(e) => handleFixosChange(campo, e.value)}
                               className="w-full p-inputtext-sm" aria-label={campo} />
                </div>
              ))}
            </div>
          </fieldset>

          {['cores', 'tecidos', 'acabamentos'].map((grupo) => (
            item.atributos?.[grupo] ? (
              <fieldset key={grupo} className="mb-3">
                <legend className="text-sm font-medium text-gray-600 capitalize">{grupo}</legend>
                <div className="formgrid grid">
                  {Object.entries(item.atributos[grupo]).map(([campo, valor]) => (
                    <div key={`${grupo}-${campo}`} className="field col-12 md:col-4">
                      <label className="block text-xs font-medium mb-1">
                        {campo.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                      <InputText value={valor}
                                 onChange={(e) => handleAtributoChange(grupo, campo, e.target.value)}
                                 className="w-full p-inputtext-sm"
                                 aria-label={`${grupo} - ${campo}`} />
                    </div>
                  ))}
                </div>
              </fieldset>
            ) : null
          ))}

          {['observacoes'].map((grupo) => (
            item.atributos?.[grupo] ? (
              <fieldset key={grupo} className="mb-3">
                <legend className="text-sm font-medium text-gray-600 capitalize">{grupo}</legend>
                <div className="formgrid grid">
                  {Object.entries(item.atributos[grupo]).map(([campo, valor]) => (
                    <div key={`${grupo}-${campo}`} className="field col-12">
                      <label className="block text-xs font-medium mb-1">
                        {campo.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                      <InputTextarea value={valor}
                                     onChange={(e) => handleAtributoChange(grupo, campo, e.target.value)}
                                     className="w-full p-inputtextarea-sm"
                                     rows={3}
                                     aria-label={`${grupo} - ${campo}`} />
                    </div>
                  ))}
                </div>
              </fieldset>
            ) : null
          ))}
        </div>

        <div className="flex flex-column gap-2 text-right min-w-48 md:w-64 justify-between">
          <div>
            <span className="block text-sm font-medium">
              Total: {total}
            </span>

            <span className="block text-xs mt-2">
              {item.id_variacao ? (
                <span className="text-green-600">Variação encontrada</span>
              ) : (
                <span className="text-red-500 font-semibold">Sem variação</span>
              )}
            </span>

            {!item.id_categoria && (
              <span className="block text-xs text-red-600 font-medium mt-1">Categoria obrigatória</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProdutoImportadoCard;
