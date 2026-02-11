import { useEffect, useRef, useState } from 'react';
import apiEstoque from '../services/apiEstoque';
import isEqual from 'lodash/isEqual';

export const useProdutoForm = (produto = {}) => {
  const toastRef = useRef(null);
  const fileUploadRef = useRef(null);

  const [nome, setNome] = useState(produto.nome || '');
  const [descricao, setDescricao] = useState(produto.descricao || '');
  const [idCategoria, setIdCategoria] = useState(produto.id_categoria || produto.categoria?.id || null);
  const [idFornecedor, setIdFornecedor] = useState(produto.id_fornecedor || null);

  const [altura, setAltura] = useState(produto.altura || '');
  const [largura, setLargura] = useState(produto.largura || '');
  const [profundidade, setProfundidade] = useState(produto.profundidade || '');
  const [peso, setPeso] = useState(produto.peso || '');

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

  const toArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.dados?.results)) return res.dados.results;
    if (Array.isArray(res?.dados)) return res.dados;
    if (Array.isArray(res?.results)) return res.results;
    return [];
  };

  useEffect(() => {
    if (!produto || !produto.id) return;

    const novo = {
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      idCategoria: produto.categoria?.id || produto.id_categoria || null,
      idFornecedor: produto.id_fornecedor || null,
      altura: produto.altura || '',
      largura: produto.largura || '',
      profundidade: produto.profundidade || '',
      peso: produto.peso || '',
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
      altura !== novo.altura ||
      largura !== novo.largura ||
      profundidade !== novo.profundidade ||
      peso !== novo.peso ||
      !isEqual(variacoes, novo.variacoes) ||
      !isEqual(existingImages, novo.imagens)
    ) {
      setNome(novo.nome);
      setDescricao(novo.descricao);
      setIdCategoria(novo.idCategoria);
      setIdFornecedor(novo.idFornecedor);
      setAltura(novo.altura);
      setLargura(novo.largura);
      setProfundidade(novo.profundidade);
      setPeso(novo.peso);
      setVariacoes(novo.variacoes);
      setExistingImages(novo.imagens);
    }
  }, [produto]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiEstoque.get('/categorias');
        setCategorias(toArray(response.data));
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
    const fetchFornecedores = async () => {
      try {
        const { data } = await apiEstoque.get('/fornecedores');
        setFornecedores(toArray(data));
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
    setIdCategoria(data.categoria?.id || data.id_categoria || null);
    setIdFornecedor(data.id_fornecedor || null);
    setAltura(data.altura || '');
    setLargura(data.largura || '');
    setProfundidade(data.profundidade || '');
    setPeso(data.peso || '');
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
    altura, setAltura,
    largura, setLargura,
    profundidade, setProfundidade,
    peso, setPeso,
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
