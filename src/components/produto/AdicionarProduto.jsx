// src/components/produto/AdicionarProduto.jsx
import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from 'primereact/autocomplete';

import apiEstoque from '../../services/apiEstoque';

/**
 * Componente para adicionar produtos ao pedido.
 * Permite:
 * 1. Buscar produto existente
 * 2. Cadastrar novo produto (com variação única)
 */
const AdicionarProduto = ({ visible, onHide, onAdicionarItem, categorias = [] }) => {
  const toastRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  // BUSCA
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loadingBusca, setLoadingBusca] = useState(false);

  // NOVO PRODUTO
  const [produto, setProduto] = useState({
    nome: '',
    id_categoria: null,
    altura: null,
    largura: null,
    profundidade: null,
    peso: null,
  });

  // VARIAÇÃO ÚNICA
  const [variacao, setVariacao] = useState({
    referencia: '',
    codigo_barras: '',
    preco: 0,
    custo: 0, // ← custo vem do PDF
    atributos: []
  });

  // Sugestões dos atributos
  const [sugNomes, setSugNomes] = useState({});
  const [sugValores, setSugValores] = useState({});
  const timers = useRef({});

  const debounce = (key, fn, delay = 250) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(fn, delay);
  };

  const categoriasOptions = categorias.map((c) => ({
    label: c.nome,
    value: Number(c.id)
  }));

  // RESET
  const resetar = () => {
    setActiveIndex(0);
    setBusca('');
    setResultados([]);
    setProduto({
      nome: '',
      id_categoria: null,
      altura: null,
      largura: null,
      profundidade: null,
      peso: null
    });
    setVariacao({
      referencia: '',
      codigo_barras: '',
      preco: 0,
      custo: 0,
      atributos: []
    });
  };

  const handleHide = () => {
    resetar();
    onHide?.();
  };

  // ======================================================
  // BUSCAR PRODUTOS
  // ======================================================
  const buscarProdutos = async () => {
    if (!busca.trim()) {
      toastRef.current.show({
        severity: 'info',
        summary: 'Informe algo para buscar',
        life: 2000
      });
      return;
    }

    setLoadingBusca(true);
    try {
      const { data } = await apiEstoque.get('/produtos', {
        params: { q: busca.trim(), view: 'minima', per_page: 20 }
      });

      const lista = Array.isArray(data?.data) ? data.data :
        Array.isArray(data) ? data : [];

      setResultados(lista);
    } catch (e) {
      toastRef.current.show({
        severity: 'error',
        summary: 'Erro ao buscar produtos',
        detail: 'Tente novamente.',
        life: 3000
      });
    } finally {
      setLoadingBusca(false);
    }
  };

  const selecionarVariacaoExistente = async (produto, variacaoSel) => {
    try {
      const resp = await apiEstoque.get(`/produtos/${produto.id}`);
      const completo = resp.data?.data || resp.data;

      const variacoes = completo.variacoes || [];
      const vari = variacoes.find(v => v.id === variacaoSel.id) || variacaoSel;

      const atributosMap = {};
      if (Array.isArray(vari.atributos)) {
        vari.atributos.forEach(a => {
          atributosMap[a.atributo] = a.valor;
        });
      }

      const custo = Number(vari.custo || 0);

      onAdicionarItem({
        ref: vari.referencia,
        nome: completo.nome,
        nome_completo: vari.nome_completo || `${completo.nome} - ${vari.referencia}`,
        quantidade: 1,
        preco_unitario: custo,
        valor: custo * 1,
        unidade: 'PC',
        id_categoria: completo.id_categoria,
        produto_id: completo.id,
        id_variacao: vari.id,
        atributos: atributosMap,
        atributos_raw: vari.atributos || [],
        fixos: {
          altura: completo.altura,
          largura: completo.largura,
          profundidade: completo.profundidade,
          peso: completo.peso,
        },
        tipo: 'PEDIDO',
        enviar_fabrica: false,
        id_deposito: null,
      });

      toastRef.current.show({
        severity: 'success',
        summary: 'Produto adicionado',
        life: 1500
      });

      handleHide();
    } catch (err) {
      toastRef.current.show({
        severity: 'error',
        summary: 'Erro ao selecionar variação',
        life: 2500
      });
    }
  };
  // ======================================================
  // CADASTRO DO PRODUTO + VARIAÇÃO
  // ======================================================

  const salvarNovoProduto = async () => {
    if (!produto.nome.trim()) {
      toastRef.current.show({
        severity: 'warn',
        summary: 'Nome é obrigatório',
        life: 2000
      });
      return;
    }

    if (!produto.id_categoria) {
      toastRef.current.show({
        severity: 'warn',
        summary: 'Categoria obrigatória',
        life: 2000
      });
      return;
    }

    if (!variacao.referencia.trim()) {
      toastRef.current.show({
        severity: 'warn',
        summary: 'Referência é obrigatória',
        life: 2000
      });
      return;
    }

    if (!variacao.custo && variacao.custo !== 0) {
      toastRef.current.show({
        severity: 'warn',
        summary: 'Custo é obrigatório',
        life: 2000
      });
      return;
    }

    try {
      // 1) Cadastrar produto base
      const respProduto = await apiEstoque.post('/produtos', {
        nome: produto.nome,
        id_categoria: produto.id_categoria,
        altura: produto.altura,
        largura: produto.largura,
        profundidade: produto.profundidade,
        peso: produto.peso,
      });

      const produtoId = respProduto.data.id;

      // 2) Cadastrar variação única
      const respVar = await apiEstoque.post(`/produtos/${produtoId}/variacoes`, {
        referencia: variacao.referencia,
        codigo_barras: variacao.codigo_barras,
        preco: variacao.preco || 0,
        custo: variacao.custo || 0,
      });

      const vari = respVar.data;

      const atributosFinal = variacao.atributos
        .filter(a => a.atributo?.trim() && a.valor?.trim())
        .map(a => ({ atributo: a.atributo, valor: a.valor }));

      // Se houver atributos, cadastrar via PUT
      if (atributosFinal.length > 0) {
        await apiEstoque.put(`/produtos/${produtoId}/variacoes/${vari.id}`, {
          ...vari,
          atributos: atributosFinal
        });
      }

      // 3) Retorno padronizado pro pedido
      const custo = Number(variacao.custo || 0);

      onAdicionarItem({
        ref: variacao.referencia,
        nome: produto.nome,
        nome_completo: `${produto.nome} - ${variacao.referencia}`,
        quantidade: 1,
        preco_unitario: custo,
        valor: custo * 1,
        unidade: "PC",
        id_categoria: produto.id_categoria,
        produto_id: produtoId,
        id_variacao: vari.id,
        atributos: Object.fromEntries(atributosFinal.map(a => [a.atributo, a.valor])),
        atributos_raw: atributosFinal,
        fixos: {
          altura: produto.altura,
          largura: produto.largura,
          profundidade: produto.profundidade,
          peso: produto.peso,
        },
        tipo: "PEDIDO",
        enviar_fabrica: false,
        id_deposito: null,
      });

      toastRef.current.show({
        severity: "success",
        summary: "Produto cadastrado",
        detail: "Produto e variação adicionados ao pedido.",
        life: 2000
      });

      handleHide();
    } catch (err) {
      toastRef.current.show({
        severity: "error",
        summary: "Erro ao cadastrar",
        detail: err?.response?.data?.message || "Erro desconhecido",
        life: 3000
      });
    }
  };
  // ======================================================
  // ATRIBUTOS DA VARIAÇÃO
  // ======================================================
  const buscarNomeAtributo = (query, idx) => {
    debounce(`nome-${idx}`, async () => {
      try {
        const { data } = await apiEstoque.get('/atributos/sugestoes', {
          params: { q: query }
        });
        setSugNomes(prev => ({ ...prev, [idx]: data || [] }));
      } catch {
        setSugNomes(prev => ({ ...prev, [idx]: [] }));
      }
    });
  };

  const buscarValorAtributo = (query, idx) => {
    const nome = variacao.atributos[idx]?.atributo || "";
    if (!nome.trim()) return;

    debounce(`valor-${idx}`, async () => {
      try {
        const { data } = await apiEstoque.get(`/atributos/${encodeURIComponent(nome)}/valores`, {
          params: { q: query }
        });
        setSugValores(prev => ({ ...prev, [idx]: data || [] }));
      } catch {
        setSugValores(prev => ({ ...prev, [idx]: [] }));
      }
    });
  };

  const addAtributo = () => {
    setVariacao(v => ({
      ...v,
      atributos: [...v.atributos, { atributo: "", valor: "" }]
    }));
  };

  const removeAtributo = (index) => {
    setVariacao(v => ({
      ...v,
      atributos: v.atributos.filter((_, i) => i !== index)
    }));
  };

  // ======================================================
  // RENDER
  // ======================================================
  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Fechar" className="p-button-text" onClick={handleHide} />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header="Adicionar Produto"
      modal
      style={{ width: "900px", maxWidth: "95vw" }}
      footer={footer}
    >
      <Toast ref={toastRef} />

      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>

        {/* ============================ */}
        {/* TAB 1 - BUSCAR PRODUTO       */}
        {/* ============================ */}
        <TabPanel header="Buscar cadastrado">
          <div className="flex gap-2 mb-3">
            <span className="p-input-icon-left flex-1">
              <i className="pi pi-search" />
              <InputText
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, referência ou código de barras"
                className="w-full"
              />
            </span>

            <Button
              icon="pi pi-search"
              className="p-button-primary"
              onClick={buscarProdutos}
              loading={loadingBusca}
            />
          </div>

          {resultados.map(p => (
            <div key={p.id} className="border-1 surface-border p-3 mb-2 border-round">
              <div className="flex justify-content-between">
                <div>
                  <strong>{p.nome}</strong>
                  <div className="text-sm text-color-secondary">{p.categoria}</div>
                </div>
                {p.imagem && (
                  <img src={p.imagem} alt="" style={{ width: 50, height: 50, borderRadius: 4 }} />
                )}
              </div>

              {p.variacoes?.map(v => (
                <div key={v.id} className="flex justify-content-between align-items-center mt-2 p-2 surface-100 border-round">
                  <div>
                    <strong>{v.referencia}</strong>
                    {v.nome_completo && <div className="text-sm">{v.nome_completo}</div>}
                  </div>

                  <Button
                    label="Usar"
                    icon="pi pi-plus"
                    className="p-button-sm"
                    onClick={() => selecionarVariacaoExistente(p, v)}
                  />
                </div>
              ))}
            </div>
          ))}
        </TabPanel>

        {/* ============================ */}
        {/* TAB 2 - CADASTRAR NOVO       */}
        {/* ============================ */}
        <TabPanel header="Cadastrar novo">

          <div className="formgrid grid">

            <div className="field col-12">
              <label>Nome *</label>
              <InputText
                value={produto.nome}
                onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
              />
            </div>

            <div className="field col-12 md:col-4">
              <label>Categoria *</label>
              <Dropdown
                value={produto.id_categoria}
                options={categoriasOptions}
                placeholder="Selecione"
                filter
                onChange={(e) => setProduto({ ...produto, id_categoria: e.value })}
              />
            </div>

            <div className="field col-4">
              <label>Altura (cm)</label>
              <InputNumber
                value={produto.altura}
                onValueChange={e => setProduto({ ...produto, altura: e.value })}
              />
            </div>

            <div className="field col-4">
              <label>Largura (cm)</label>
              <InputNumber
                value={produto.largura}
                onValueChange={e => setProduto({ ...produto, largura: e.value })}
              />
            </div>

            <div className="field col-4">
              <label>Profundidade (cm)</label>
              <InputNumber
                value={produto.profundidade}
                onValueChange={e => setProduto({ ...produto, profundidade: e.value })}
              />
            </div>

            <div className="field col-4">
              <label>Peso (kg)</label>
              <InputNumber
                value={produto.peso}
                onValueChange={e => setProduto({ ...produto, peso: e.value })}
              />
            </div>
          </div>

          {/* ============================ */}
          {/* VARIAÇÃO ÚNICA              */}
          {/* ============================ */}
          <h5 className="mt-4">Variação</h5>

          <div className="formgrid grid">

            <div className="field col-6">
              <label>Referência *</label>
              <InputText
                value={variacao.referencia}
                className={!variacao.referencia ? "p-invalid" : ""}
                onChange={(e) => setVariacao({ ...variacao, referencia: e.target.value })}
              />
            </div>

            <div className="field col-6">
              <label>Código de Barras</label>
              <InputText
                value={variacao.codigo_barras}
                onChange={(e) => setVariacao({ ...variacao, codigo_barras: e.target.value })}
              />
            </div>

            <div className="field col-4">
              <label>Preço</label>
              <InputNumber
                value={variacao.preco}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                onValueChange={(e) => setVariacao({ ...variacao, preco: e.value })}
              />
            </div>

            <div className="field col-4">
              <label>Custo *</label>
              <InputNumber
                value={variacao.custo}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                className={!variacao.custo ? "p-invalid" : ""}
                onValueChange={(e) => setVariacao({ ...variacao, custo: e.value })}
              />
            </div>
          </div>

          {/* ============================ */}
          {/* ATRIBUTOS                    */}
          {/* ============================ */}
          <h5 className="mt-4">Atributos da Variação</h5>

          {variacao.atributos.map((attr, idx) => (
            <div className="formgrid grid mb-2" key={idx}>
              <div className="field col-5">
                <label>Nome</label>
                <AutoComplete
                  value={attr.atributo}
                  suggestions={sugNomes[idx] || []}
                  completeMethod={(e) => buscarNomeAtributo(e.query, idx)}
                  onChange={(e) =>
                    setVariacao(v => {
                      const att = [...v.atributos];
                      att[idx].atributo = e.value;
                      return { ...v, atributos: att };
                    })
                  }
                />
              </div>

              <div className="field col-5">
                <label>Valor</label>
                <AutoComplete
                  value={attr.valor}
                  suggestions={sugValores[idx] || []}
                  completeMethod={(e) => buscarValorAtributo(e.query, idx)}
                  onChange={(e) =>
                    setVariacao(v => {
                      const att = [...v.atributos];
                      att[idx].valor = e.value;
                      return { ...v, atributos: att };
                    })
                  }
                />
              </div>

              <div className="field col-2 flex align-items-end">
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-rounded"
                  onClick={() => removeAtributo(idx)}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            icon="pi pi-plus"
            label="Adicionar atributo"
            className="p-button-sm"
            onClick={addAtributo}
          />

          <div className="flex justify-content-end mt-4">
            <Button
              label="Adicionar ao Pedido"
              icon="pi pi-check"
              className="p-button-success"
              onClick={salvarNovoProduto}
            />
          </div>

        </TabPanel>
      </TabView>
    </Dialog>
  );
};

export default AdicionarProduto;
