import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { Chip } from 'primereact/chip';
import { v4 as uuidv4 } from 'uuid';

const opcoesSugestoes = ['cor', 'tecido', 'estrutura', 'acabamento', 'formato'];

const ProdutoAtributos = ({ atributos, onChange, onAdd, onRemove }) => {
  const [sugestoes, setSugestoes] = useState([]);

  const buscarSugestoes = (e) => {
    if (!e.query) return setSugestoes([]);
    setSugestoes(
      opcoesSugestoes.filter((s) => s.toLowerCase().includes(e.query.toLowerCase()))
    );
  };

  const isDuplicado = (atributoAtual, indexAtual) =>
    atributos.some((a, i) => a.atributo === atributoAtual && i !== indexAtual);

  const atributosValidos = (atributos && atributos.length) ? atributos.filter((a) => a.atributo && a.valor) : [];

  return (
    <>
      <h6 className="mt-3">Atributos da Variação</h6>
      <p className="text-sm text-color-secondary mb-2">
        Exemplo: <strong>cor: nogueira</strong>, <strong>tecido: veludo</strong>
      </p>

      {atributosValidos.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {atributosValidos.map((attr, i) => (
            <Chip key={`${attr.atributo}-${attr.valor}-${i}`} label={`${attr.atributo}: ${attr.valor}`} />
          ))}
        </div>
      )}

      {(atributos || []).map((attr, j) => {
        const duplicado = isDuplicado(attr.atributo, j);
        return (
          <div key={attr.id || j} className="formgrid grid align-items-center">
            <div className="field md:col-5">
              <AutoComplete
                value={attr.atributo}
                suggestions={sugestoes}
                completeMethod={buscarSugestoes}
                onChange={(e) => onChange(j, 'atributo', e.value)}
                placeholder="Atributo (ex: cor)"
                className={(!attr.atributo || duplicado) ? 'p-invalid' : ''}
                tooltip={duplicado ? 'Atributo duplicado' : attr.atributo ? '' : 'Campo obrigatório'}
              />
            </div>

            <div className="field md:col-5">
              <InputText
                value={attr.valor}
                placeholder="Valor (ex: nogueira)"
                onChange={(e) => onChange(j, 'valor', e.target.value)}
                className={!attr.valor ? 'p-invalid' : ''}
                tooltip={!attr.valor ? 'Campo obrigatório' : ''}
              />
            </div>

            <div className="field md:col-2 text-right">
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger"
                type="button"
                onClick={() => onRemove(j)}
                tooltip="Remover atributo"
                aria-label="Remover atributo"
              />
            </div>
          </div>
        );
      })}

      <Button
        label="Adicionar Atributo"
        icon="pi pi-plus"
        type="button"
        onClick={() =>
          onAdd({
            id: uuidv4(),
            atributo: '',
            valor: ''
          })
        }
        className="p-button-sm mt-2"
        aria-label="Adicionar novo atributo"
      />
    </>
  );
};

export default ProdutoAtributos;
