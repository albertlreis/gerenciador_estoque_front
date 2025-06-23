import React from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tooltip } from 'primereact/tooltip';
import { formatarMotivo } from './helpers';
import ProdutoAtributos from "../ProdutoAtributos";

const ProdutoVariacoes = ({
                            variacoes,
                            setVariacoes,
                            abrirDialogOutlet,
                            confirmarExcluirOutlet
                          }) => {
  const updateVariacao = (index, field, value) => {
    const novas = [...variacoes];
    novas[index] = { ...novas[index], [field]: value };
    setVariacoes(novas);
  };

  const updateAtributo = (varIndex, attrIndex, field, value) => {
    const novas = [...variacoes];
    const atributos = [...novas[varIndex].atributos];
    atributos[attrIndex] = { ...atributos[attrIndex], [field]: value };
    novas[varIndex].atributos = atributos;
    setVariacoes(novas);
  };

  const addAtributo = (varIndex) => {
    const novas = [...variacoes];
    const atributos = [...(novas[varIndex].atributos || [])];
    atributos.push({ atributo: '', valor: '' });
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
      { preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }
    ]);
  };

  const renderHeader = (v, i) => {
    const invalido = !v.preco || !v.custo || !v.referencia;
    const tooltipId = `tooltip-var-${i}`;

    return (
      <div className="flex align-items-center justify-content-between w-full gap-2">
      <span className="flex align-items-center gap-2">
        {invalido && (
          <>
            <i
              id={tooltipId}
              className="pi pi-exclamation-triangle text-orange-600"
              style={{ fontSize: '1rem' }}
            />
            <Tooltip
              target={`#${tooltipId}`}
              content="Preencha os campos obrigatórios"
              position="top"
            />
          </>
        )}
        <strong>Variação {i + 1}</strong>
        {v.referencia ? ` - ${v.referencia}` : ''}
      </span>
      </div>
    );
  };

  // Reordena: incompletas no topo
  const ordenadas = [...variacoes].sort((a, b) => {
    const aValido = a.preco && a.custo && a.referencia;
    const bValido = b.preco && b.custo && b.referencia;
    return aValido === bValido ? 0 : aValido ? 1 : -1;
  });

  const activeIndex = ordenadas
    .map((v, i) => (!v.preco || !v.custo || !v.referencia ? i : null))
    .filter((i) => i !== null);

  return (
    <div className="field col-12">
      <Accordion multiple activeIndex={activeIndex}>
        {ordenadas.map((v, i) => {
          const indexReal = variacoes.indexOf(v);
          return (
            <AccordionTab key={indexReal} header={renderHeader(v, indexReal)}>
              <div className="formgrid grid">
                <div className="field md:col-3">
                  <label>Preço *</label>
                  <InputNumber
                    value={parseFloat(v.preco) || 0}
                    onValueChange={(e) => updateVariacao(indexReal, 'preco', e.value)}
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
                    onValueChange={(e) => updateVariacao(indexReal, 'custo', e.value)}
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
                    onChange={(e) => updateVariacao(indexReal, 'referencia', e.target.value)}
                    placeholder="Código ou referência interna"
                    className={!v.referencia ? 'p-invalid' : ''}
                  />
                </div>

                <div className="field md:col-2 text-right">
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger mt-4"
                    type="button"
                    onClick={() => removeVariacao(indexReal)}
                    tooltip="Remover variação"
                  />
                </div>

                <div className="field md:col-6">
                  <label>Código de Barras</label>
                  <InputText
                    value={v.codigo_barras}
                    onChange={(e) => updateVariacao(indexReal, 'codigo_barras', e.target.value)}
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
                        <div className="flex justify-content-between align-items-center gap-2 px-3 py-2 surface-100 border-round border-1 border-warning">
                          <span className="text-sm font-semibold text-yellow-900">
                            {`${o.quantidade} unid • ${o.percentual_desconto}% • ${formatarMotivo(o.motivo)}`}
                          </span>
                          <div className="flex gap-2">
                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" type="button"
                                    onClick={() => abrirDialogOutlet(v, o)} />
                            <Button icon="pi pi-trash" className="p-button-rounded p-button-text" type="button"
                                    onClick={() => confirmarExcluirOutlet(v, o)} />
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
                className="p-button-sm p-button-warning mt-2 mb-4"
                type="button"
                onClick={() => abrirDialogOutlet(v)}
              />

              <ProdutoAtributos
                atributos={v.atributos}
                onChange={(j, campo, valor) => updateAtributo(indexReal, j, campo, valor)}
                onAdd={() => addAtributo(indexReal)}
                onRemove={(j) => removeAtributo(indexReal, j)}
              />
            </AccordionTab>
          );
        })}
      </Accordion>

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
