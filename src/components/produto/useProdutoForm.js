import { useEffect, useRef, useState } from 'react';
import apiEstoque from '../../services/apiEstoque';

export const useProdutoForm = (initialData = {}) => {
  const toastRef = useRef(null);
  const fileUploadRef = useRef(null);

  const [nome, setNome] = useState(initialData.nome || '');
  const [descricao, setDescricao] = useState(initialData.descricao || '');
  const [idCategoria, setIdCategoria] = useState(
    initialData.categoria ? initialData.categoria : initialData.id_categoria || null
  );
  const [idFornecedor, setIdFornecedor] = useState(initialData.id_fornecedor || null);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [variacoes, setVariacoes] = useState(initialData.variacoes || [
    { nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }
  ]);
  const [existingImages, setExistingImages] = useState(initialData.imagens || []);
  const [loading, setLoading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiEstoque.get('/categorias');
        setCategorias(response.data);
      } catch {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar categorias',
          life: 3000,
        });
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (categorias.length > 0 && typeof idCategoria === 'number') {
      const catObj = categorias.find((c) => c.id === idCategoria);
      if (catObj) setIdCategoria(catObj);
    }
  }, [categorias, idCategoria]);

  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const { data } = await apiEstoque.get('/fornecedores');
        setFornecedores(data);
      } catch {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar fornecedores',
          life: 3000,
        });
      }
    };
    fetchFornecedores();
  }, []);

  return {
    nome, setNome,
    descricao, setDescricao,
    idCategoria, setIdCategoria,
    idFornecedor, setIdFornecedor,
    categorias,
    fornecedores,
    variacoes, setVariacoes,
    existingImages, setExistingImages,
    loading, setLoading,
    totalSize, setTotalSize,
    toastRef,
    fileUploadRef,
  };
};
