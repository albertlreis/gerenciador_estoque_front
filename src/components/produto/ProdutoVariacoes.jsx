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
import getImageSrc from '../../utils/getImageSrc';
import {
  removerImagemVariacao,
  salvarImagemVariacao,
} from '../../services/variacaoImagemService';

const ProdutoVariacoes = ({
                            produtoId,
                            variacoes = [],            // <- default quando vier undefined
                            setVariacoes,
                            abrirDialogOutlet,
                            confirmarExcluirOutlet,
                            toastRef,
                            loading,
                            setLoading,
                            onAlterado,
                            somenteImagens = false,
                          }) => {
  const { has } = usePermissions();
  const [salvandoImagemId, setSalvandoImagemId] = React.useState(null);
  const [removendoImagemId, setRemovendoImagemId] = React.useState(null);
  const [arquivosImagem, setArquivosImagem] = React.useState({});
  const [previewsImagem, setPreviewsImagem] = React.useState({});
  const previewsImagemRef = React.useRef({});
  const PLACEHOLDER_URL = 'https://placehold.co/600x400.jpg';

  // Fallback absoluto: se vier null/objeto, vira []
  const lista = Array.isArray(variacoes) ? variacoes : [];

  const updateVariacao = (index, field, value) => {
    const novas = [...lista];
    novas[index] = { ...novas[index], [field]: value };
    setVariacoes(novas);
  };

  React.useEffect(() => {
    previewsImagemRef.current = previewsImagem;
  }, [previewsImagem]);

  React.useEffect(() => () => {
    Object.values(previewsImagemRef.current).forEach((preview) => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    });
  }, []);

  const updateAtributo = (varIndex, attrIndex, field, value) => {
    const novas = [...lista];
    const atributos = [...(novas[varIndex].atributos || [])];
    atributos[attrIndex] = { ...atributos[attrIndex], [field]: value };
    novas[varIndex].atributos = atributos;
    setVariacoes(novas);
  };

  const addAtributo = (varIndex) => {
    const novas = [...lista];
    const atributos = [...(novas[varIndex].atributos || [])];
    atributos.push({ atributo: '', valor: '' });
    novas[varIndex].atributos = atributos;
    setVariacoes(novas);
  };

  const removeAtributo = (varIndex, attrIndex) => {
    const novas = [...lista];
    novas[varIndex].atributos = (novas[varIndex].atributos || []).filter((_, i) => i !== attrIndex);
    setVariacoes(novas);
  };

  const removeVariacao = (index) => {
    const novas = lista.filter((_, i) => i !== index);
    setVariacoes(novas);
  };

  const addVariacao = () => {
    setVariacoes([
      ...lista,
      { preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }
    ]);
  };

  const isEmptyValue = (v) => v === null || v === undefined || v === '';
  const isEmptyText = (v) => !v || String(v).trim() === '';

  const toDecimalOrNull = (v) => {
    if (isEmptyValue(v)) return null;
    if (typeof v === 'number') return v;
    const raw = String(v).trim().replace(',', '.');
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  };

  /** Verifica duplicidade de nomes de atributos por variação (case-insensitive). */
  const variacaoTemDuplicidadeDeAtributos = (v) => {
    const nomes = (v.atributos || [])
      .map(a => (a.atributo || '').trim().toLowerCase())
      .filter(Boolean);
    const set = new Set();
    for (const n of nomes) {
      if (set.has(n)) return true;
      set.add(n);
    }
    return false;
  };

  const salvarVariacoes = async () => {
    if (!produtoId) return;

    // Validação: campos obrigatórios + duplicidade de atributos
    const invalidos = [];
    const duplicidade = [];
    lista.forEach((v, i) => {
      if (isEmptyValue(v.preco) || isEmptyText(v.referencia)) invalidos.push(i + 1);
      if (variacaoTemDuplicidadeDeAtributos(v)) duplicidade.push(i + 1);
    });

    if (invalidos.length) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Variações incompletas',
        detail: `Preencha preço e referência nas variações: ${invalidos.join(', ')}.`,
        life: 4000
      });
      return;
    }

    if (duplicidade.length) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Atributos duplicados',
        detail: `Remova atributos duplicados nas variações: ${duplicidade.join(', ')}.`,
        life: 4000
      });
      return;
    }

    setLoading(true);
    try {
      const novas = [];
      const existentes = [];

      for (const v of lista) {
        const data = {
          ...v,
          preco: toDecimalOrNull(v.preco),
          custo: toDecimalOrNull(v.custo),
          atributos: (v.atributos || []).filter(a => (a.atributo || '').trim() && (a.valor || '').trim())
        };
        if (v.id) existentes.push(data);
        else novas.push(data);
      }

      if (existentes.length) await apiEstoque.patch(`/produtos/${produtoId}/variacoes/bulk`, existentes);
      for (const nova of novas) await apiEstoque.post(`/produtos/${produtoId}/variacoes`, nova);

      await carregarVariacoes();

      toastRef.current?.show({
        severity: 'success',
        summary: 'Variações salvas',
        detail: `Foram ${novas.length} adicionadas e ${existentes.length} atualizadas.`,
        life: 3000
      });

      onAlterado && onAlterado();
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
      const resp = await apiEstoque.get(`/produtos/${produtoId}/variacoes`);
      const arr = Array.isArray(resp.data?.data) ? resp.data.data : Array.isArray(resp.data) ? resp.data : [];
      setVariacoes(arr);
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: error?.response?.data?.message || 'Erro ao carregar variações do produto',
        life: 4000
      });
    }
  };

  const getVariacaoKey = (variacao, indexReal) => variacao?.id ?? `new-${indexReal}`;

  const selecionarArquivoImagem = (variacao, indexReal, file) => {
    if (!file) return;

    const key = getVariacaoKey(variacao, indexReal);
    setArquivosImagem((prev) => ({ ...prev, [key]: file }));

    setPreviewsImagem((prev) => {
      const atual = prev[key];
      if (atual) {
        URL.revokeObjectURL(atual);
      }

      return {
        ...prev,
        [key]: URL.createObjectURL(file),
      };
    });
  };

  const limparArquivoSelecionado = (variacao, indexReal) => {
    const key = getVariacaoKey(variacao, indexReal);

    setArquivosImagem((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, key)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

    setPreviewsImagem((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, key)) return prev;
      if (prev[key]) {
        URL.revokeObjectURL(prev[key]);
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const salvarImagemDaVariacao = async (indexReal) => {
    const variacao = lista[indexReal];

    if (!variacao?.id) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Salve a variacao primeiro',
        detail: 'E necessario salvar a variacao antes de cadastrar a imagem.',
        life: 3500,
      });
      return;
    }

    const key = getVariacaoKey(variacao, indexReal);
    const arquivo = arquivosImagem[key];

    if (!arquivo) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Arquivo obrigatorio',
        detail: 'Selecione uma imagem para enviar.',
        life: 3500,
      });
      return;
    }

    try {
      setSalvandoImagemId(variacao.id);
      const response = await salvarImagemVariacao(variacao.id, arquivo);

      const novaUrl = response?.data?.url || null;
      updateVariacao(indexReal, 'imagem_url', novaUrl);
      limparArquivoSelecionado(variacao, indexReal);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Imagem salva',
        detail: 'Imagem da variacao atualizada com sucesso.',
        life: 3000,
      });

      onAlterado && onAlterado();
    } catch (error) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro ao salvar imagem',
        detail: error?.response?.data?.message || 'Nao foi possivel salvar a imagem da variacao.',
        life: 4000,
      });
    } finally {
      setSalvandoImagemId(null);
    }
  };

  const removerImagemDaVariacao = async (indexReal) => {
    const variacao = lista[indexReal];

    if (!variacao?.id) {
      return;
    }

    try {
      setRemovendoImagemId(variacao.id);
      await removerImagemVariacao(variacao.id);

      updateVariacao(indexReal, 'imagem_url', null);
      limparArquivoSelecionado(variacao, indexReal);

      toastRef.current?.show({
        severity: 'success',
        summary: 'Imagem removida',
        detail: 'Imagem da variacao removida com sucesso.',
        life: 3000,
      });

      onAlterado && onAlterado();
    } catch (error) {
      const status = error?.response?.status;
      toastRef.current?.show({
        severity: status === 404 ? 'warn' : 'error',
        summary: status === 404 ? 'Imagem nao encontrada' : 'Erro ao remover imagem',
        detail: error?.response?.data?.message || 'Nao foi possivel remover a imagem da variacao.',
        life: 4000,
      });
    } finally {
      setRemovendoImagemId(null);
    }
  };
  const variacoesIncompletas = lista.some(v => isEmptyValue(v.preco) || isEmptyText(v.referencia));

  const renderHeader = (v, i) => {
    const invalido = !somenteImagens && (isEmptyValue(v.preco) || isEmptyText(v.referencia));
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

  const ordenadas = [...lista].sort((a, b) => {
    const aValido = !isEmptyValue(a.preco) && !isEmptyText(a.referencia);
    const bValido = !isEmptyValue(b.preco) && !isEmptyText(b.referencia);
    return aValido === bValido ? 0 : aValido ? 1 : -1;
  });

  const activeIndex = somenteImagens
    ? null
    : ordenadas
      .map((v, i) => (isEmptyValue(v.preco) || isEmptyText(v.referencia) ? i : null))
      .filter((i) => i !== null);

  return (
    <div className="field col-12">
      <Accordion multiple activeIndex={activeIndex}>
        {ordenadas.map((v, i) => {
          const indexReal = lista.indexOf(v);
          return (
            <AccordionTab key={indexReal} header={renderHeader(v, indexReal)}>
              {!somenteImagens && (
                <>
                  <div className="formgrid grid">
                    <div className="field md:col-3">
                      <label>Preço *</label>
                      <InputNumber
                        value={toDecimalOrNull(v.preco)}
                        onValueChange={(e) => updateVariacao(indexReal, 'preco', e.value)}
                        mode="currency"
                        currency="BRL"
                        locale="pt-BR"
                        className={isEmptyValue(v.preco) ? 'p-invalid' : ''}
                      />
                    </div>
                    <div className="field md:col-3">
                      <label>Custo</label>
                      <InputNumber
                        value={toDecimalOrNull(v.custo)}
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
                        className={isEmptyText(v.referencia) ? 'p-invalid' : ''}
                      />
                    </div>
                    <div className="field md:col-2 text-right">
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger mt-4"
                        type="button"
                        onClick={() => removeVariacao(indexReal)}
                      />
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
                    atributos={v.atributos || []}
                    onChange={(j, campo, valor) => updateAtributo(indexReal, j, campo, valor)}
                    onAdd={() => addAtributo(indexReal)}
                    onRemove={(j) => removeAtributo(indexReal, j)}
                  />
                </>
              )}

              <div className="mt-3 border-1 surface-border border-round p-3">
                <div className="text-sm font-semibold mb-2">Imagem da Variação</div>
                <div className="grid">
                                    <div className="col-12 md:col-3">
                    {(() => {
                      const key = getVariacaoKey(v, indexReal);
                      const preview = previewsImagem[key];
                      return (
                        <img
                          src={preview || (v.imagem_url ? getImageSrc(v.imagem_url) : PLACEHOLDER_URL)}
                          alt={v.referencia || `Variacao ${indexReal + 1}`}
                          className="w-full border-round"
                          style={{ maxHeight: '120px', objectFit: 'cover' }}
                        />
                      );
                    })()}
                  </div>
                  <div className="col-12 md:col-9">
                    <label className="block mb-2">Arquivo da imagem *</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full mb-2"
                      onChange={(e) => selecionarArquivoImagem(v, indexReal, e.target.files?.[0])}
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        label="Salvar Imagem"
                        icon={salvandoImagemId === v.id ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
                        className="p-button-sm p-button-success"
                        disabled={!v.id || salvandoImagemId === v.id}
                        onClick={() => salvarImagemDaVariacao(indexReal)}
                      />
                      <Button
                        type="button"
                        label="Remover Imagem"
                        icon={removendoImagemId === v.id ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
                        className="p-button-sm p-button-danger"
                        disabled={!v.id || !v.imagem_url || removendoImagemId === v.id}
                        onClick={() => removerImagemDaVariacao(indexReal)}
                      />
                    </div>
                    {!v.id && (
                      <small className="text-color-secondary block mt-2">
                        Salve a variação primeiro para habilitar o CRUD da imagem.
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTab>
          );
        })}
      </Accordion>

      {!somenteImagens && (
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
      )}
    </div>
  );
};

export default ProdutoVariacoes;


