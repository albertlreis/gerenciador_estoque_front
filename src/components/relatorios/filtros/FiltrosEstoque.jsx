import React from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { AutoComplete } from 'primereact/autocomplete';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';

export function FiltrosEstoque({
                                 // depósitos
                                 depositos,
                                 depositoIds,
                                 setDepositoIds,

                                 // toggles
                                 somenteOutlet,
                                 setSomenteOutlet,
                                 somenteSemEstoque,
                                 setSomenteSemEstoque,

                                 // categoria
                                 categoria,
                                 setCategoria,
                                 catInput,
                                 setCatInput,
                                 catSug,
                                 buscarCategorias,
                                 onClearCategoria,

                                 // produto
                                 produto,
                                 setProduto,
                                 prodSug,
                                 buscarProdutos,

                                 // fornecedor (NOVO)
                                 fornecedor,
                                 setFornecedor,
                                 fornInput,
                                 setFornInput,
                                 fornSug,
                                 buscarFornecedores,
                                 onClearFornecedor,
                               }) {
  return (
    <div className="field col-12">
      <div className="grid">
        {/* Depósitos (agora não ocupa 100% no desktop) */}
        <div className="col-12 md:col-6 mt-2">
          <label className="mb-2 block">Depósitos</label>
          <MultiSelect
            value={depositoIds}
            onChange={(e) => setDepositoIds(e.value)}
            options={depositos}
            placeholder="Selecione um ou mais depósitos"
            display="chip"
            filter
            showClear
            className="w-full"
            maxSelectedLabels={3}
            selectedItemsLabel="{0} depósitos selecionados"
          />
        </div>

        {/* Fornecedor (NOVO) */}
        <div className="col-12 md:col-6 mt-2">
          <label className="mb-2 block">Fornecedor</label>
          <AutoComplete
            value={fornInput}
            suggestions={fornSug}
            completeMethod={({ query }) => buscarFornecedores(query)}
            field="label"
            placeholder="Buscar fornecedor…"
            dropdown
            forceSelection={false}
            onChange={(e) => {
              if (typeof e.value === 'string') {
                setFornInput(e.value);
              } else {
                setFornecedor(e.value);
                setFornInput(e.value?.label ?? '');
              }
            }}
            onSelect={(e) => {
              setFornecedor(e.value);
              setFornInput(e.value?.label ?? '');
            }}
            onClear={onClearFornecedor}
            emptySearchMessage="Nenhum fornecedor encontrado"
            emptyMessage="Nenhum fornecedor"
            aria-label="Fornecedor"
            itemTemplate={(op) => <span className="font-medium">{op.label}</span>}
            className="w-full"
          />
        </div>

        {/* Categoria */}
        <div className="col-12 md:col-6 mt-2">
          <label className="mb-2 block">Categoria</label>
          <AutoComplete
            value={catInput}
            suggestions={catSug}
            completeMethod={({ query }) => buscarCategorias(query)}
            field="label"
            placeholder="Buscar categoria…"
            dropdown
            forceSelection={false}
            onChange={(e) => {
              if (typeof e.value === 'string') {
                setCatInput(e.value);
              } else {
                setCategoria(e.value);
                setCatInput(e.value?.label ?? '');
              }
            }}
            onSelect={(e) => {
              setCategoria(e.value);
              setCatInput(e.value?.label ?? '');
            }}
            onClear={onClearCategoria}
            emptySearchMessage="Nenhuma categoria encontrada"
            emptyMessage="Nenhuma categoria"
            aria-label="Categoria"
            itemTemplate={(op) => <span className="font-medium">{op.label}</span>}
            className="w-full"
          />
        </div>

        {/* Produto + checkboxes */}
        <div className="col-12 md:col-6 mt-2">
          <div className="flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
            <label className="m-0">Produto</label>

            <div className="flex align-items-center gap-3 flex-wrap">
              <div className="flex align-items-center">
                <Checkbox
                  inputId="somenteOutlet"
                  checked={somenteOutlet}
                  onChange={(e) => setSomenteOutlet(e.checked)}
                />
                <label htmlFor="somenteOutlet" className="ml-2 mb-0">
                  Somente outlet
                </label>
              </div>

              <div className="flex align-items-center">
                <Checkbox
                  inputId="somenteSemEstoque"
                  checked={somenteSemEstoque}
                  onChange={(e) => setSomenteSemEstoque(e.checked)}
                />
                <label htmlFor="somenteSemEstoque" className="ml-2 mb-0">
                  Sem estoque
                </label>
              </div>
            </div>
          </div>

          <AutoComplete
            value={produto}
            suggestions={prodSug}
            completeMethod={(e) => buscarProdutos(e.query || '')}
            field="label"
            placeholder="Buscar por nome ou referência…"
            dropdown
            onChange={(e) => setProduto(e.value)}
            onSelect={(e) => setProduto(e.value)}
            aria-label="Produto"
            itemTemplate={(op) => (
              <div className="flex flex-column">
                <span className="font-medium">{op.label}</span>
                {op.sku ? <small className="text-500">{op.sku}</small> : null}
              </div>
            )}
            className="w-full"
          />
        </div>

        <div className="col-12 mt-2">
          <Tag value="Dica" severity="info" className="mr-2" />
          <small>Você pode combinar Depósitos + Fornecedor + Categoria + Produto para filtrar exatamente o que irá para o PDF/Excel.</small>
        </div>
      </div>
    </div>
  );
}
