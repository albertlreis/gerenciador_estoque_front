import React, { useEffect, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import { RadioButton } from 'primereact/radiobutton';
import OverlayLoading from './OverlayLoading';
import apiEstoque from '../services/apiEstoque';

const FiltroLateral = ({ filtros, onChange, disabled = false }) => {
  const [categorias, setCategorias] = useState([]);
  const [atributos, setAtributos] = useState([]);

  const renderCategorias = (lista, nivel = 0) => {
    return lista.flatMap(cat => [
      { ...cat, nivel },
      ...(cat.subcategorias?.length ? renderCategorias(cat.subcategorias, nivel + 1) : [])
    ]);
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiEstoque.get('/categorias');
        const hierarquicas = renderCategorias(response.data);
        setCategorias(hierarquicas);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };

    const fetchAtributos = async () => {
      try {
        const response = await apiEstoque.get('/atributos');
        const atributosFormatados = Object.entries(response.data).map(([nome, valores]) => ({
          nome,
          valores
        }));
        setAtributos(atributosFormatados);
      } catch (err) {
        console.error('Erro ao buscar atributos:', err);
      }
    };

    fetchCategorias();
    fetchAtributos();
  }, []);

  const handleCategoriaChange = (id) => {
    const categoriasAtuais = Array.isArray(filtros.categoria) ? filtros.categoria : [];
    const novaCategoria = categoriasAtuais.includes(id)
      ? categoriasAtuais.filter(c => c !== id)
      : [...categoriasAtuais, id];

    onChange({ categoria: novaCategoria });
  };

  const handleAtributoChange = (nome, valor) => {
    const atual = filtros.atributos?.[nome] || [];
    const atualizado = atual.includes(valor)
      ? atual.filter(v => v !== valor)
      : [...atual, valor];
    onChange({ atributos: { ...filtros.atributos, [nome]: atualizado } });
  };

  const formatarTexto = (str) => {
    return str.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <OverlayLoading visible={disabled} message="Carregando filtros...">
      <div className="p-3 surface-card shadow-2 border-round">
        <h4 className="mb-4">Filtrar por</h4>

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
            { id: 'estoque_sem', label: 'Sem estoque', value: 'sem_estoque' }
          ].map(opcao => (
            <div key={opcao.id} className="field-radiobutton">
              <RadioButton
                inputId={opcao.id}
                name="estoque_status"
                value={opcao.value}
                onChange={(e) => onChange({ estoque_status: e.value })}
                checked={filtros.estoque_status === opcao.value}
                disabled={disabled}
              />
              <label htmlFor={opcao.id} className="ml-2">{opcao.label}</label>
            </div>
          ))}
        </div>

        {/* Categoria */}
        <div className="mb-4 border-bottom-1 surface-border pb-3">
          <h5 className="text-sm mb-2">Categoria</h5>
          {categorias.map(cat => (
            <div key={`${cat.id}-${cat.nivel}`} className="field-checkbox" style={{ paddingLeft: `${cat.nivel * 16}px` }}>
              <Checkbox
                inputId={`cat-${cat.id}`}
                value={cat.id}
                onChange={() => handleCategoriaChange(cat.id)}
                checked={Array.isArray(filtros.categoria) && filtros.categoria.includes(cat.id)}
                disabled={disabled}
              />
              <label htmlFor={`cat-${cat.id}`} className="ml-2">{cat.nome}</label>
            </div>
          ))}
        </div>

        {/* Atributos dinâmicos */}
        {atributos.map(attr => (
          <div key={attr.nome} className="mb-4 border-bottom-1 surface-border pb-3">
            <h5 className="text-sm mb-2">{formatarTexto(attr.nome)}</h5>
            {Array.isArray(attr.valores) &&
              attr.valores.map((v) => (
                <div key={`${attr.nome}-${v}`} className="field-checkbox">
                  <Checkbox
                    inputId={`att-${attr.nome}-${v}`}
                    value={v}
                    onChange={() => handleAtributoChange(attr.nome, v)}
                    checked={filtros.atributos?.[attr.nome]?.includes(v)}
                    disabled={disabled}
                  />
                  <label htmlFor={`att-${attr.nome}-${v}`} className="ml-2">{formatarTexto(v)}</label>
                </div>
              ))}
          </div>
        ))}
      </div>
    </OverlayLoading>
  );
};

export default FiltroLateral;
