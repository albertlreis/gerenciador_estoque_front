import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { formatarMotivo } from './helpers';

const ProdutoVariacoes = ({
                            variacoes,
                            setVariacoes,
                            abrirDialogOutlet
                          }) => {

  const updateVariacao = (index, field, value) => {
    const novas = [...variacoes];
    novas[index][field] = value;
    setVariacoes(novas);
  };

  const updateAtributo = (varIndex, attrIndex, field, value) => {
    const novas = [...variacoes];
    novas[varIndex].atributos[attrIndex][field] = value;
    setVariacoes(novas);
  };

  const addAtributo = (varIndex) => {
    const novas = [...variacoes];
    novas[varIndex].atributos.push({ atributo: '', valor: '' });
    setVariacoes(novas);
  };

  const removeAtributo = (varIndex, attrIndex) => {
    const novas = [...variacoes];
    novas[varIndex].atributos.splice(attrIndex, 1);
    setVariacoes(novas);
  };

  const removeVariacao = (index) => {
    const novas = [...variacoes];
    novas.splice(index, 1);
    setVariacoes(novas);
  };

  const addVariacao = () => {
    setVariacoes([
      ...variacoes,
      { nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }
    ]);
  };

  return (
    <div className="field col-12">
      <h4>Variações do Produto</h4>
      <p className="text-sm text-color-secondary mb-3">
        Um mesmo móvel pode ter diferentes variações,
        como <strong>cor</strong>, <strong>acabamento</strong> ou <strong>material</strong>.
        Cada variação pode ter um preço e código de barras distintos.
      </p>

      {variacoes.map((v, i) => (
        <div key={i} className="p-fluid p-3 mb-4 border-round surface-border border-1">
          <div className="formgrid grid align-items-start">
            <div className="field col-12 mt-2">
              <div className="flex flex-wrap align-items-center gap-2 mb-2">
                {v.outlets?.map((o, index) => (
                  <Tag
                    key={index}
                    value={`${o.quantidade} unid • ${o.percentual_desconto}% • ${formatarMotivo(o.motivo)}`}
                    severity="warning"
                    className="text-sm px-3 py-2 border-round"
                  />
                ))}
              </div>

              {v.estoque?.quantidade > (v.outlets?.reduce((s, o) => s + (o.quantidade || 0), 0)) && (
                <Button
                  label="Adicionar Outlet"
                  icon="pi pi-plus"
                  className="p-button-sm p-button-warning w-full md:w-auto"
                  type="button"
                  onClick={() => abrirDialogOutlet(v)}
                  tooltip="Registrar mais unidades como outlet"
                />
              )}
            </div>

            <div className="field md:col-3">
              <label>Preço</label>
              <InputNumber
                value={parseFloat(v.preco) || 0}
                onValueChange={(e) => updateVariacao(i, 'preco', e.value)}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                minFractionDigits={2}
                maxFractionDigits={2}
              />
            </div>

            <div className="field md:col-3">
              <label>Custo</label>
              <InputNumber
                value={parseFloat(v.custo) || 0}
                onValueChange={(e) => updateVariacao(i, 'custo', e.value)}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                minFractionDigits={2}
                maxFractionDigits={2}
              />
            </div>

            <div className="field md:col-6">
              <label>Referência</label>
              <InputText
                value={v.referencia}
                onChange={(e) => updateVariacao(i, 'referencia', e.target.value)}
              />
            </div>

            <div className="field md:col-5">
              <label>Código de Barras</label>
              <InputText
                value={v.codigo_barras}
                onChange={(e) => updateVariacao(i, 'codigo_barras', e.target.value)}
              />
            </div>

            <div className="field md:col-1 text-right">
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger mt-4"
                type="button"
                onClick={() => removeVariacao(i)}
                tooltip="Remover Variação"
              />
            </div>
          </div>

          <h5 className="mt-3">Atributos</h5>
          <p className="text-sm text-color-secondary mb-2">
            Detalhe esta variação com atributos. Exemplos: <strong>cor: nogueira</strong>, <strong>material: MDF</strong>.
          </p>

          {v.atributos.map((attr, j) => (
            <div key={j} className="formgrid grid align-items-center">
              <div className="field md:col-5">
                <InputText
                  value={attr.atributo}
                  placeholder="Atributo (ex: cor)"
                  onChange={(e) => updateAtributo(i, j, 'atributo', e.target.value)}
                />
              </div>
              <div className="field md:col-5">
                <InputText
                  value={attr.valor}
                  placeholder="Valor (ex: nogueira)"
                  onChange={(e) => updateAtributo(i, j, 'valor', e.target.value)}
                />
              </div>
              <div className="field md:col-2 text-right">
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger"
                  type="button"
                  onClick={() => removeAtributo(i, j)}
                  tooltip="Remover Atributo"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            label="Adicionar Atributo"
            icon="pi pi-plus"
            onClick={() => addAtributo(i)}
            className="p-button-sm mt-2"
          />
        </div>
      ))}

      <Button
        type="button"
        label="Adicionar Variação"
        icon="pi pi-plus"
        className="p-button-secondary mt-2"
        onClick={addVariacao}
      />
    </div>
  );
};

export default ProdutoVariacoes;
