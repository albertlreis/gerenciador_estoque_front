import React, { useEffect, useState } from 'react';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import FiltroLateral from '../components/FiltroLateral';
import CatalogoGrid from '../components/CatalogoGrid';
import OverlayLoading from '../components/OverlayLoading';
import apiEstoque from '../services/apiEstoque';

const filtrosIniciais = {
  nome: '',
  categoria: [],
  ativo: null,
  atributos: {},
};

const CatalogoProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, [filtros]);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await apiEstoque.get('/produtos', {
        params: {
          nome: filtros.nome,
          id_categoria: filtros.categoria,
          ativo: filtros.ativo,
          ...Object.entries(filtros.atributos || {}).reduce((acc, [chave, valores]) => {
            acc[`atributos[${chave}]`] = valores;
            return acc;
          }, {})
        },
      });
      setProdutos(response.data.data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const resetarFiltros = () => {
    setFiltros(filtrosIniciais);
  };

  return (
    <div className="grid p-4">
      <div className="col-12 md:col-3">
        <FiltroLateral filtros={filtros} onChange={handleFiltroChange} disabled={loading} />
      </div>
      <div className="col-12 md:col-9">
        <div className="flex justify-content-between align-items-center mb-3">
          <h2>Catálogo de Produtos</h2>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Buscar por nome..."
              value={filtros.nome}
              onChange={(e) => handleFiltroChange({ nome: e.target.value })}
              disabled={loading}
            />
          </span>
        </div>

        <Divider />

        <div className="flex justify-content-end mb-3">
          <button className="p-button p-button-sm p-button-secondary" onClick={resetarFiltros} disabled={loading}>
            Limpar Filtros
          </button>
        </div>

        <OverlayLoading visible={loading} message="Carregando produtos do catálogo...">
          <CatalogoGrid produtos={produtos} />
        </OverlayLoading>
      </div>
    </div>
  );
};

export default CatalogoProdutos;
