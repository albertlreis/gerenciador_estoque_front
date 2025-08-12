import React from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tooltip } from 'primereact/tooltip';
import ProdutoAtributos from "../ProdutoAtributos";
import apiEstoque from '../../services/apiEstoque';
import usePermissions from "../../hooks/usePermissions";
import { PERMISSOES } from '../../constants/permissoes';

const ProdutoVariacoes = ({
                            produtoId,
                            variacoes,
                            setVariacoes,
                            abrirDialogOutlet,
                            confirmarExcluirOutlet,
                            toastRef,
                            loading,
                            setLoading
                          }) => {
  const { has } = usePermissions();

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

  const salvarVariacoes = async () => {
    if (!produtoId) return;
    setLoading(true);

    try {
      const novas = [];
      const existentes = [];

      for (const v of variacoes) {
        const data = {
          ...v,
          atributos: (v.atributos || []).filter(a => a.atributo && a.valor)
        };

        if (v.id) existentes.push(data);
        else novas.push(data);
      }

      if (existentes.length) await apiEstoque.put(`/produtos/${produtoId}/variacoes`, existentes);
      for (const nova of novas) await apiEstoque.post(`/produtos/${produtoId}/variacoes`, nova);

      await carregarVariacoes();

      toastRef.current?.show({
        severity: 'success',
        summary: 'Variações salvas',
        detail: `Foram ${novas.length} adicionadas e ${existentes.length} atualizadas.`,
        life: 3000
      });
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Erro ao salvar variações',
        life: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarVariacoes = async () => {
    if (!produtoId) return;

    try {
      const { data } = await apiEstoque.get(`/produtos/${produtoId}/variacoes`);
      setVariacoes(data);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Erro ao carregar variações do produto',
        life: 4000
      });
    }
  };

  const variacoesIncompletas = variacoes.some(v => !v.preco || !v.referencia);

  const renderHeader = (v, i) => {
    const invalido = !v.preco || !v.referencia;
    const tooltipId = `tooltip-var-${i}`;
    return (
      <div className="flex align-items-center justify-content-between w-full gap-2">
        <span className="flex align-items-center gap-2">
          {invalido && (
            <>
              <i id={tooltipId} className="pi pi-exclamation-triangle text-orange-600" />
              <Tooltip target={`#${tooltipId}`} content="Preencha os campos obrigatórios" position="top" />
            </>
          )}
          <strong>Variação {i + 1}</strong>
          {v.referencia ? ` - ${v.referencia}` : ''}
        </span>
      </div>
    );
  };

  const ordenadas = [...variacoes].sort((a, b) => {
    const aValido = a.preco && a.referencia;
    const bValido = b.preco && b.referencia;
    return aValido === bValido ? 0 : aValido ? 1 : -1;
  });

  const activeIndex = ordenadas
    .map((v, i) => (!v.preco || !v.referencia ? i : null))
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
                    className={!v.preco ? 'p-invalid' : ''}
                  />
                </div>
                <div className="field md:col-3">
                  <label>Custo</label>
                  <InputNumber
                    value={parseFloat(v.custo) || 0}
                    onValueChange={(e) => updateVariacao(indexReal, 'custo', e.value)}
                    mode="currency"
                    currency="BRL"
                    locale="pt-BR"
                  />
                </div>
                <div className="field md:col-4">
                  <label>Referência *</label>
                  <InputText
                    value={v.referencia}
                    onChange={(e) => updateVariacao(indexReal, 'referencia', e.target.value)}
                    className={!v.referencia ? 'p-invalid' : ''}
                  />
                </div>
                <div className="field md:col-2 text-right">
                  <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mt-4" type="button" onClick={() => removeVariacao(indexReal)} />
                </div>
                <div className="field md:col-6">
                  <label>Código de Barras</label>
                  <InputText
                    value={v.codigo_barras}
                    onChange={(e) => updateVariacao(indexReal, 'codigo_barras', e.target.value)}
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
                        <div className="px-3 py-2 surface-100 border-round border-1 border-warning">
                          <div className="mb-1 text-sm font-semibold text-yellow-900">
                            {`${o.quantidade} unid • Motivo #${o.motivo?.nome}`}
                          </div>
                          {o.formas_pagamento?.length > 0 && (
                            <ul className="pl-3 mb-2">
                              {o.formas_pagamento.map((fp, k) => (
                                <li key={k} className="text-sm">
                                  {`Forma #${fp.forma_pagamento?.nome}`}: {fp.percentual_desconto}%
                                  {fp.max_parcelas && ` • até ${fp.max_parcelas}x`}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="flex gap-2 justify-content-end">
                            {has(PERMISSOES.PRODUTOS.OUTLET_EDITAR) && (
                              <Button
                                icon="pi pi-pencil"
                                className="p-button-rounded p-button-text"
                                type="button"
                                onClick={() => abrirDialogOutlet(v, o)}
                              />
                            )}
                            {has(PERMISSOES.PRODUTOS.OUTLET_EXCLUIR) && (
                              <Button
                                icon="pi pi-trash"
                                className="p-button-rounded p-button-text"
                                type="button"
                                onClick={() => confirmarExcluirOutlet(v, o)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {v.id && has(PERMISSOES.PRODUTOS.OUTLET_CADASTRAR) && (
                <Button
                  label="Adicionar Outlet"
                  icon="pi pi-plus"
                  className="p-button-sm p-button-warning mt-2 mb-4"
                  type="button"
                  onClick={() => abrirDialogOutlet(v)}
                />
              )}

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

      <div className="mt-3 flex justify-content-end gap-2">
        <Button type="button" label="Adicionar Variação" icon="pi pi-plus" className="p-button-secondary"
                onClick={addVariacao} />
        <Button
          type="button"
          label="Salvar Variações"
          icon="pi pi-save"
          className="p-button-success"
          onClick={() => {
            if (variacoesIncompletas) {
              toastRef.current?.show({
                severity: 'warn',
                summary: 'Variações incompletas',
                detail: 'Preencha todos os campos obrigatórios (preço e referência) antes de salvar.',
                life: 4000
              });
              return;
            }
            salvarVariacoes();
          }}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default ProdutoVariacoes;
