import React from 'react';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';
import {Panel} from 'primereact/panel';
import {formatarMotivo} from './helpers';

const ProdutoVariacoes = ({
                            variacoes,
                            setVariacoes,
                            abrirDialogOutlet,
                            confirmarExcluirOutlet
                          }) => {
  const updateVariacao = (index, field, value) => {
    const novas = [...variacoes];
    novas[index] = {...novas[index], [field]: value};
    setVariacoes(novas);
  };

  const updateAtributo = (varIndex, attrIndex, field, value) => {
    const novas = [...variacoes];
    const atributos = [...novas[varIndex].atributos];
    atributos[attrIndex] = {...atributos[attrIndex], [field]: value};
    novas[varIndex].atributos = atributos;
    setVariacoes(novas);
  };

  const addAtributo = (varIndex) => {
    const novas = [...variacoes];
    const atributos = [...(novas[varIndex].atributos || [])];
    atributos.push({atributo: '', valor: ''});
    novas[varIndex].atributos = atributos;
    setVariacoes(novas);
  };

  const removeAtributo = (varIndex, attrIndex) => {
    const novas = [...variacoes];
    novas[varIndex].atributos = novas[varIndex].atributos.filter((_, i) => i !== attrIndex);
    setVariacoes(novas);
  };

  const removeVariacao = (index) => {
    const novas = variacoes.filter((_, i) => i !== index);
    setVariacoes(novas);
  };

  const addVariacao = () => {
    setVariacoes([
      ...variacoes,
      {nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: []}
    ]);
  };

  return (
    <div className="field col-12">
      {variacoes.map((v, i) => (
        <Panel key={i} header={`Variação ${i + 1}`} toggleable className="mb-4" collapsed>
          <div className="formgrid grid">
            <div className="field md:col-3">
              <label>Preço *</label>
              <InputNumber
                value={parseFloat(v.preco) || 0}
                onValueChange={(e) => updateVariacao(i, 'preco', e.value)}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                placeholder="Preço de venda"
                className={!v.preco ? 'p-invalid' : ''}
              />
            </div>

            <div className="field md:col-3">
              <label>Custo *</label>
              <InputNumber
                value={parseFloat(v.custo) || 0}
                onValueChange={(e) => updateVariacao(i, 'custo', e.value)}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                placeholder="Custo do produto"
                className={!v.custo ? 'p-invalid' : ''}
              />
            </div>

            <div className="field md:col-4">
              <label>Referência *</label>
              <InputText
                value={v.referencia}
                onChange={(e) => updateVariacao(i, 'referencia', e.target.value)}
                placeholder="Código ou referência interna"
                className={!v.referencia ? 'p-invalid' : ''}
              />
            </div>

            <div className="field md:col-2 text-right">
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger mt-4"
                type="button"
                onClick={() => removeVariacao(i)}
                tooltip="Remover variação"
              />
            </div>

            <div className="field md:col-6">
              <label>Código de Barras</label>
              <InputText
                value={v.codigo_barras}
                onChange={(e) => updateVariacao(i, 'codigo_barras', e.target.value)}
                placeholder="Código de barras"
              />
            </div>
          </div>

          {/* Outlets */}
          {v.outlets?.length > 0 && (
            <>
              <h6 className="mt-3 mb-2">Outlets cadastrados</h6>
              <div className="formgrid grid">
                {v.outlets.map((o, j) => (
                  <div key={j} className="col-12 md:col-6">
                    <div
                      className="flex justify-content-between align-items-center gap-2 px-3 py-2 surface-100 border-round border-1 border-warning">
                        <span className="text-sm font-semibold text-yellow-900">
                          {`${o.quantidade} unid • ${o.percentual_desconto}% • ${formatarMotivo(o.motivo)}`}
                        </span>
                      <div className="flex gap-2">
                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" type="button"
                                onClick={() => abrirDialogOutlet(v, o)}/>
                        <Button icon="pi pi-trash" className="p-button-rounded p-button-text" type="button"
                                onClick={() => confirmarExcluirOutlet(v, o)}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Button
            label="Adicionar Outlet"
            icon="pi pi-plus"
            className="p-button-sm p-button-warning mt-2"
            type="button"
            onClick={() => abrirDialogOutlet(v)}
          />

          {/* Atributos */}
          <h6 className="mt-4">Atributos da Variação</h6>
          <p className="text-sm text-color-secondary mb-2">
            Exemplo: <strong>cor: nogueira</strong>, <strong>tecido: veludo</strong>
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
                  tooltip="Remover atributo"
                />
              </div>
            </div>
          ))}

          <Button
            label="Adicionar Atributo"
            icon="pi pi-plus"
            type="button"
            onClick={() => addAtributo(i)}
            className="p-button-sm mt-2"
          />
        </Panel>
      ))}

      <Button
        type="button"
        label="Adicionar Variação"
        icon="pi pi-plus"
        className="p-button-secondary mt-3"
        onClick={addVariacao}
      />
    </div>
  );
};

export default ProdutoVariacoes;
