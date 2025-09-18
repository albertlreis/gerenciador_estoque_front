import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import { RadioButton } from 'primereact/radiobutton';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import OverlayLoading from './OverlayLoading';
import apiEstoque from '../services/apiEstoque';
import InputWithIcon from './InputWithIcon';

const FiltroLateral = ({ filtros, onChange, disabled = false }) => {
  const [categorias, setCategorias] = useState([]);
  const [atributos, setAtributos] = useState([]);

  // texto digitado local; só aplicamos em filtros.nome quando o usuário clicar/Enter
  const [nomeBusca, setNomeBusca] = useState(filtros.nome || '');
  const [qCategorias, setQCategorias] = useState('');
  const [qAtributos, setQAtributos] = useState('');
  const [qValores, setQValores] = useState({});

  useEffect(() => {
    setNomeBusca(filtros.nome || '');
  }, [filtros.nome]);

  const normalizar = (s) =>
    (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const renderCategorias = (lista, nivel = 0) =>
    lista.flatMap((cat) => [
      { ...cat, nivel },
      ...(cat.subcategorias?.length ? renderCategorias(cat.subcategorias, nivel + 1) : []),
    ]);

  const ordenarAtributos = (list) =>
    [...list].sort((a, b) => normalizar(a.nome).localeCompare(normalizar(b.nome)));
  const ordenarValores = (vals) => [...vals].sort((a, b) => normalizar(a).localeCompare(normalizar(b)));

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data } = await apiEstoque.get('/categorias');
        const hierarquicas = renderCategorias(data);
        setCategorias(hierarquicas);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };

    const fetchAtributos = async () => {
      try {
        const { data } = await apiEstoque.get('/atributos');
        const attrs = Object.entries(data).map(([nome, valores]) => ({ nome, valores }));
        setAtributos(ordenarAtributos(attrs));
      } catch (err) {
        console.error('Erro ao buscar atributos:', err);
      }
    };

    fetchCategorias();
    fetchAtributos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoriaChange = (id) => {
    const categoriasAtuais = Array.isArray(filtros.categoria) ? filtros.categoria : [];
    const novaCategoria = categoriasAtuais.includes(id)
      ? categoriasAtuais.filter((c) => c !== id)
      : [...categoriasAtuais, id];
    onChange({ categoria: novaCategoria });
  };

  const handleAtributoChange = (nome, valor) => {
    const atual = filtros.atributos?.[nome] || [];
    const atualizado = atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor];
    onChange({ atributos: { ...filtros.atributos, [nome]: atualizado } });
  };

  const formatarTexto = (str) => (str || '').replace(/_/g, ' ').trim();

  const categoriasFiltradas = useMemo(() => {
    if (!qCategorias) return categorias;
    const q = normalizar(qCategorias);
    return categorias.filter((c) => normalizar(c.nome).includes(q));
  }, [categorias, qCategorias]);

  const atributosFiltrados = useMemo(() => {
    if (!qAtributos) return atributos;
    const q = normalizar(qAtributos);
    return atributos.filter((a) => normalizar(a.nome).includes(q));
  }, [atributos, qAtributos]);

  const valoresFiltradosPorAtributo = useMemo(() => {
    const mapa = {};
    for (const attr of atributosFiltrados) {
      const vals = Array.isArray(attr.valores) ? ordenarValores(attr.valores) : [];
      const qVal = qValores[attr.nome] || '';
      mapa[attr.nome] = qVal ? vals.filter((v) => normalizar(v).includes(normalizar(qVal))) : vals;
    }
    return mapa;
  }, [atributosFiltrados, qValores]);

  const aplicarBuscaNome = () => {
    onChange({ nome: (nomeBusca || '').trim() });
  };

  const handleNomeKeyDown = (e) => {
    if (e.key === 'Enter') {
      aplicarBuscaNome();
    }
  };

  return (
    <OverlayLoading visible={disabled} message="Carregando filtros...">
      <div className="p-3 surface-card shadow-2 border-round">
        <h4 className="mb-4">Filtrar por</h4>

        {/* Busca textual de produtos (só dispara no clique/Enter) */}
          <div className="flex gap-3 align-items-center">
            <div className="flex-grow-1">
              <InputWithIcon
                iconClass="pi pi-search"
                name="busca_nome"
                placeholder="Nome, referência..."
                value={nomeBusca}
                onChange={(e) => setNomeBusca(e.target.value)}
                onKeyDown={handleNomeKeyDown}
                onClear={() => setNomeBusca('')}
                clearable
                disabled={disabled}
              />
            </div>
            <Button
              icon="pi pi-search"
              className="p-button-sm"
              onClick={aplicarBuscaNome}
              disabled={disabled}
              aria-label="Buscar"
            />
          </div>


        {/* Outlet */}
        <div className="mb-4 border-bottom-1 surface-border pb-3">
          <h5 className="text-sm mb-2">Somente Outlet</h5>
          <InputSwitch
            checked={filtros.outlet === true}
            onChange={(e) => onChange({ outlet: e.value ? true : null })}
            disabled={disabled}
          />
        </div>

        {/* Estoque */}
        <div className="mb-4 border-bottom-1 surface-border pb-3">
          <h5 className="text-sm mb-2">Estoque</h5>
          {[
            { id: 'estoque_todos', label: 'Todos', value: null },
            { id: 'estoque_com', label: 'Com estoque', value: 'com_estoque' },
            { id: 'estoque_sem', label: 'Sem estoque', value: 'sem_estoque' },
          ].map((opcao) => (
            <div key={opcao.id} className="field-radiobutton">
              <RadioButton
                inputId={opcao.id}
                name="estoque_status"
                value={opcao.value}
                onChange={(e) => onChange({ estoque_status: e.value })}
                checked={filtros.estoque_status === opcao.value}
                disabled={disabled}
              />
              <label htmlFor={opcao.id} className="ml-2">
                {opcao.label}
              </label>
            </div>
          ))}
        </div>

        {/* Categorias + Atributos */}
        <Accordion multiple activeIndex={[0, 1]}>
          <AccordionTab header="Categorias">
            <div className="mb-3">
              <InputWithIcon
                iconClass="pi pi-search"
                name="busca_categorias"
                placeholder="Buscar categorias..."
                value={qCategorias}
                onChange={(e) => setQCategorias(e.target.value)}
                onClear={() => setQCategorias('')}
                clearable
                disabled={disabled}
              />
            </div>

            {categoriasFiltradas.map((cat) => (
              <div key={`${cat.id}-${cat.nivel}`} className="field-checkbox" style={{ paddingLeft: `${cat.nivel * 16}px` }}>
                <Checkbox
                  inputId={`cat-${cat.id}`}
                  value={cat.id}
                  onChange={() => handleCategoriaChange(cat.id)}
                  checked={Array.isArray(filtros.categoria) && filtros.categoria.includes(cat.id)}
                  disabled={disabled}
                />
                <label htmlFor={`cat-${cat.id}`} className="ml-2">
                  {cat.nome}
                </label>
              </div>
            ))}
          </AccordionTab>

          <AccordionTab header="Atributos">
            <div className="mb-3">
              <InputWithIcon
                iconClass="pi pi-search"
                name="busca_atributos"
                placeholder="Buscar atributos..."
                value={qAtributos}
                onChange={(e) => setQAtributos(e.target.value)}
                onClear={() => setQAtributos('')}
                clearable
                disabled={disabled}
              />
            </div>

            {atributosFiltrados.map((attr) => {
              const qVal = qValores[attr.nome] || '';
              const valoresFiltrados = valoresFiltradosPorAtributo[attr.nome] || [];

              return (
                <div key={attr.nome} className="mb-4 border-bottom-1 surface-border pb-3">
                  <div className="flex align-items-center justify-content-between mb-2">
                    <h5 className="text-sm m-0">{formatarTexto(attr.nome)}</h5>
                  </div>

                  <div className="mb-2">
                    <InputWithIcon
                      iconClass="pi pi-search"
                      name={`busca_valores_${attr.nome}`}
                      placeholder={`Buscar valores de ${formatarTexto(attr.nome)}...`}
                      value={qVal}
                      onChange={(e) => setQValores((prev) => ({ ...prev, [attr.nome]: e.target.value }))}
                      onClear={() => setQValores((prev) => ({ ...prev, [attr.nome]: '' }))}
                      clearable
                      disabled={disabled}
                    />
                  </div>

                  {valoresFiltrados.map((v) => (
                    <div key={`${attr.nome}-${v}`} className="field-checkbox">
                      <Checkbox
                        inputId={`att-${attr.nome}-${v}`}
                        value={v}
                        onChange={() => handleAtributoChange(attr.nome, v)}
                        checked={filtros.atributos?.[attr.nome]?.includes(v)}
                        disabled={disabled}
                      />
                      <label htmlFor={`att-${attr.nome}-${v}`} className="ml-2">
                        {formatarTexto(v)}
                      </label>
                    </div>
                  ))}
                </div>
              );
            })}
          </AccordionTab>
        </Accordion>
      </div>
    </OverlayLoading>
  );
};

export default FiltroLateral;
