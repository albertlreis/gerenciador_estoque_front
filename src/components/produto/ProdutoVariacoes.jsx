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
    atualizarImagemVariacao,
    removerImagemVariacao,
    salvarImagemVariacao,
} from '../../services/variacaoImagemService';

const isFileLike = (v) => {
    // File herda de Blob; em alguns casos pode vir como Blob
    try {
        return v instanceof File || v instanceof Blob;
    } catch {
        return !!v && typeof v === 'object' && typeof v.size === 'number';
    }
};

const ProdutoVariacoes = ({
                              produtoId,
                              variacoes = [],
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
    const PLACEHOLDER_URL = 'https://placehold.co/600x400.jpg';

    const lista = Array.isArray(variacoes) ? variacoes : [];

    /**
     * Update seguro (evita "stale state").
     * Aceita:
     * - updateVariacao(i, 'campo', valor)
     * - updateVariacao(i, {campo1: v1, campo2: v2})
     */
    const updateVariacao = React.useCallback((index, fieldOrPatch, value) => {
        setVariacoes((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            const current = arr[index] || {};

            if (fieldOrPatch && typeof fieldOrPatch === 'object' && !Array.isArray(fieldOrPatch)) {
                arr[index] = { ...current, ...fieldOrPatch };
                return arr;
            }

            arr[index] = { ...current, [fieldOrPatch]: value };
            return arr;
        });
    }, [setVariacoes]);

    const updateAtributo = (varIndex, attrIndex, field, value) => {
        setVariacoes((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            const v = { ...(arr[varIndex] || {}) };
            const atributos = [...(v.atributos || [])];
            atributos[attrIndex] = { ...(atributos[attrIndex] || {}), [field]: value };
            v.atributos = atributos;
            arr[varIndex] = v;
            return arr;
        });
    };

    const addAtributo = (varIndex) => {
        setVariacoes((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            const v = { ...(arr[varIndex] || {}) };
            const atributos = [...(v.atributos || [])];
            atributos.push({ atributo: '', valor: '' });
            v.atributos = atributos;
            arr[varIndex] = v;
            return arr;
        });
    };

    const removeAtributo = (varIndex, attrIndex) => {
        setVariacoes((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            const v = { ...(arr[varIndex] || {}) };
            v.atributos = (v.atributos || []).filter((_, i) => i !== attrIndex);
            arr[varIndex] = v;
            return arr;
        });
    };

    const removeVariacao = (index) => {
        setVariacoes((prev) => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            const v = arr[index];

            // limpa preview (evita leak)
            if (v?.imagem_preview_draft) {
                try { URL.revokeObjectURL(v.imagem_preview_draft); } catch (_) {}
            }

            return arr.filter((_, i) => i !== index);
        });
    };

    const addVariacao = () => {
        setVariacoes((prev) => ([
            ...(Array.isArray(prev) ? prev : []),
            { preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }
        ]));
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

    const getImagemExibicaoSrc = (variacao) => {
        if (variacao?.imagem_preview_draft) return variacao.imagem_preview_draft;
        if (variacao?.imagem_url) return getImageSrc(variacao.imagem_url);
        return PLACEHOLDER_URL;
    };

    const selecionarArquivoImagem = (indexReal, file) => {
        if (!file) return;

        if (!file.type?.startsWith('image/')) {
            toastRef.current?.show({
                severity: 'warn',
                summary: 'Arquivo inválido',
                detail: 'Selecione um arquivo de imagem (jpg, png, webp...).',
                life: 3500,
            });
            return;
        }

        // revoga preview anterior
        const atual = lista[indexReal];
        if (atual?.imagem_preview_draft) {
            try { URL.revokeObjectURL(atual.imagem_preview_draft); } catch (_) {}
        }

        const previewUrl = URL.createObjectURL(file);

        // ✅ Atualização atômica (resolve o bug do botão)
        updateVariacao(indexReal, {
            imagem_file_draft: file,
            imagem_preview_draft: previewUrl,
        });
    };

    const limparSelecaoImagem = (indexReal) => {
        const variacao = lista[indexReal];
        if (variacao?.imagem_preview_draft) {
            try { URL.revokeObjectURL(variacao.imagem_preview_draft); } catch (_) {}
        }

        // ✅ Atualização atômica
        updateVariacao(indexReal, {
            imagem_file_draft: null,
            imagem_preview_draft: null,
        });
    };

    const salvarImagemDaVariacao = async (indexReal) => {
        const variacao = lista[indexReal];

        if (!variacao?.id) {
            toastRef.current?.show({
                severity: 'warn',
                summary: 'Salve a variação primeiro',
                detail: 'É necessário salvar a variação antes de cadastrar a imagem.',
                life: 3500,
            });
            return;
        }

        const file = variacao?.imagem_file_draft;
        if (!isFileLike(file)) {
            toastRef.current?.show({
                severity: 'warn',
                summary: 'Imagem obrigatória',
                detail: 'Selecione uma imagem para fazer upload.',
                life: 3500,
            });
            return;
        }

        try {
            setSalvandoImagemId(variacao.id);

            const formData = new FormData();
            formData.append('imagem', file);

            const response = variacao.imagem_url
                ? await atualizarImagemVariacao(variacao.id, formData)
                : await salvarImagemVariacao(variacao.id, formData);

            const novaUrl = response?.data?.url || response?.data?.data?.url || null;
            if (novaUrl) updateVariacao(indexReal, 'imagem_url', novaUrl);

            limparSelecaoImagem(indexReal);

            toastRef.current?.show({
                severity: 'success',
                summary: 'Imagem salva',
                detail: 'Imagem da variação atualizada com sucesso.',
                life: 3000,
            });

            onAlterado && onAlterado();
        } catch (error) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Erro ao salvar imagem',
                detail: error?.response?.data?.message || 'Não foi possível salvar a imagem da variação.',
                life: 4000,
            });
        } finally {
            setSalvandoImagemId(null);
        }
    };

    const removerImagemDaVariacao = async (indexReal) => {
        const variacao = lista[indexReal];

        // Se só tinha seleção local, limpa e sai
        if (variacao?.imagem_file_draft || variacao?.imagem_preview_draft) {
            limparSelecaoImagem(indexReal);
            toastRef.current?.show({
                severity: 'info',
                summary: 'Seleção removida',
                detail: 'A imagem selecionada foi descartada (não havia upload).',
                life: 2500,
            });
            return;
        }

        if (!variacao?.id) return;

        if (!variacao?.imagem_url) {
            toastRef.current?.show({
                severity: 'warn',
                summary: 'Sem imagem',
                detail: 'Esta variação não possui imagem cadastrada.',
                life: 2500,
            });
            return;
        }

        try {
            setRemovendoImagemId(variacao.id);
            await removerImagemVariacao(variacao.id);
            updateVariacao(indexReal, 'imagem_url', null);

            toastRef.current?.show({
                severity: 'success',
                summary: 'Imagem removida',
                detail: 'Imagem da variação removida com sucesso.',
                life: 3000,
            });

            onAlterado && onAlterado();
        } catch (error) {
            const status = error?.response?.status;
            toastRef.current?.show({
                severity: status === 404 ? 'warn' : 'error',
                summary: status === 404 ? 'Imagem não encontrada' : 'Erro ao remover imagem',
                detail: error?.response?.data?.message || 'Não foi possível remover a imagem da variação.',
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
                {ordenadas.map((v) => {
                    const indexReal = lista.indexOf(v);
                    const podeSalvar = !!v.id && !salvandoImagemId && isFileLike(v.imagem_file_draft);

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

                            {/* IMAGEM (UPLOAD) */}
                            <div className="mt-3 border-1 surface-border border-round p-3">
                                <div className="text-sm font-semibold mb-2">Imagem da Variação</div>
                                <div className="grid">
                                    <div className="col-12 md:col-3">
                                        <img
                                            src={getImagemExibicaoSrc(v)}
                                            alt={v.referencia || `Variação ${indexReal + 1}`}
                                            className="w-full border-round"
                                            style={{ maxHeight: '120px', objectFit: 'cover' }}
                                        />
                                    </div>

                                    <div className="col-12 md:col-9">
                                        <label className="block mb-2">Upload da imagem *</label>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full mb-2"
                                            onChange={(e) => selecionarArquivoImagem(indexReal, e.target.files?.[0] || null)}
                                            disabled={!v.id}
                                        />

                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                type="button"
                                                label="Salvar Imagem"
                                                icon={salvandoImagemId === v.id ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
                                                className="p-button-sm p-button-success"
                                                disabled={!podeSalvar || salvandoImagemId === v.id}
                                                onClick={() => salvarImagemDaVariacao(indexReal)}
                                            />

                                            <Button
                                                type="button"
                                                label={v.imagem_url ? 'Remover Imagem' : 'Descartar Seleção'}
                                                icon={removendoImagemId === v.id ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
                                                className="p-button-sm p-button-danger"
                                                disabled={removendoImagemId === v.id || (!v.imagem_url && !v.imagem_file_draft && !v.imagem_preview_draft)}
                                                onClick={() => removerImagemDaVariacao(indexReal)}
                                            />

                                            {(v.imagem_file_draft || v.imagem_preview_draft) && (
                                                <Button
                                                    type="button"
                                                    label="Limpar"
                                                    icon="pi pi-times"
                                                    className="p-button-sm p-button-secondary"
                                                    onClick={() => limparSelecaoImagem(indexReal)}
                                                />
                                            )}
                                        </div>

                                        {!v.id && (
                                            <small className="text-color-secondary block mt-2">
                                                Salve a variação primeiro para habilitar o upload da imagem.
                                            </small>
                                        )}

                                        {v.id && !isFileLike(v.imagem_file_draft) && (
                                            <small className="text-color-secondary block mt-2">
                                                Selecione um arquivo de imagem para habilitar “Salvar Imagem”.
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
                    <Button
                        type="button"
                        label="Adicionar Variação"
                        icon="pi pi-plus"
                        className="p-button-secondary"
                        onClick={addVariacao}
                    />
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
