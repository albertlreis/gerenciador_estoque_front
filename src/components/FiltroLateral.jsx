import React, { useEffect, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import OverlayLoading from './OverlayLoading';
import apiEstoque from '../services/apiEstoque';

const FiltroLateral = ({ filtros, onChange, disabled = false }) => {
  const [categorias, setCategorias] = useState([]);
  const [atributos, setAtributos] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiEstoque.get('/categorias');
        setCategorias(response.data);
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
    const novaCategoria = filtros.categoria.includes(id)
      ? filtros.categoria.filter(c => c !== id)
      : [...filtros.categoria, id];
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
        <h4 className="mb-3">Filtrar por</h4>

        <div className="mb-4">
          <h5 className="mb-2">SOMENTE ATIVOS</h5>
          <InputSwitch
            checked={filtros.ativo === true}
            onChange={(e) => onChange({ativo: e.value ? true : null})}
            disabled={disabled}
          />
        </div>

        <div className="mb-4">
          <h5 className="mb-2">SOMENTE OUTLET</h5>
          <InputSwitch
            checked={filtros.outlet === true}
            onChange={(e) => onChange({outlet: e.value ? true : null})}
            disabled={disabled}
          />
        </div>

        <div className="mb-4">
          <h5 className="mb-2">CATEGORIA</h5>
          {categorias.map(cat => (
            <div key={cat.id} className="field-checkbox">
              <Checkbox
                inputId={`cat-${cat.id}`}
                value={cat.id}
                onChange={() => handleCategoriaChange(cat.id)}
                checked={filtros.categoria.includes(cat.id)}
                disabled={disabled}
              />
              <label htmlFor={`cat-${cat.id}`} className="ml-2">{formatarTexto(cat.nome)}</label>
            </div>
          ))}
        </div>

        {atributos.map(attr => (
          <div key={attr.nome} className="mb-3">
            <h5 className="mb-2">{formatarTexto(attr.nome)}</h5>
            {attr.valores.map(v => (
              <div key={v} className="field-checkbox">
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
