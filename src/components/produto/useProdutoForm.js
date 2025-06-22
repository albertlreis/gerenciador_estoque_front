import { useEffect, useRef, useState } from 'react';
import apiEstoque from '../../services/apiEstoque';
import isEqual from 'lodash/isEqual';

export const useProdutoForm = (produto = {}) => {
  const toastRef = useRef(null);
  const fileUploadRef = useRef(null);

  const [nome, setNome] = useState(produto.nome || '');
  const [descricao, setDescricao] = useState(produto.descricao || '');
  const [idCategoria, setIdCategoria] = useState(produto.categoria || produto.id_categoria || null);
  const [idFornecedor, setIdFornecedor] = useState(produto.id_fornecedor || null);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [variacoes, setVariacoes] = useState(
    produto.variacoes?.length
      ? produto.variacoes
      : [{ nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }]
  );
  const [existingImages, setExistingImages] = useState(produto.imagens || []);
  const [loading, setLoading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    if (!produto || !produto.id) return;

    const novo = {
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      idCategoria: produto.categoria || produto.id_categoria || null,
      idFornecedor: produto.id_fornecedor || null,
      variacoes: produto.variacoes?.length
        ? produto.variacoes
        : [{ nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }],
      imagens: produto.imagens || [],
    };

    if (
      nome !== novo.nome ||
      descricao !== novo.descricao ||
      !isEqual(idCategoria, novo.idCategoria) ||
      idFornecedor !== novo.idFornecedor ||
      !isEqual(variacoes, novo.variacoes) ||
      !isEqual(existingImages, novo.imagens)
    ) {
      setNome(novo.nome);
      setDescricao(novo.descricao);
      setIdCategoria(novo.idCategoria);
      setIdFornecedor(novo.idFornecedor);
      setVariacoes(novo.variacoes);
      setExistingImages(novo.imagens);
    }
  }, [produto]);

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
      const obj = categorias.find((c) => c.id === idCategoria);
      if (obj) setIdCategoria(obj);
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

  const atualizarDados = (data) => {
    setNome(data.nome || '');
    setDescricao(data.descricao || '');
    setIdCategoria(data.categoria || data.id_categoria || null);
    setIdFornecedor(data.id_fornecedor || null);
    setVariacoes(
      data.variacoes?.length
        ? data.variacoes
        : [{ nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }]
    );
    setExistingImages(data.imagens || []);
  };

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
    atualizarDados,
  };
};
