import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import apiEstoque from '../services/apiEstoque';

const ClienteForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState(initialData.tipo || '');
  const [loading, setLoading] = useState(false);
  const [docInvalido, setDocInvalido] = useState(false);
  const toast = useRef(null);

  const [cliente, setCliente] = useState({
    nome: initialData.nome || '',
    nome_fantasia: initialData.nome_fantasia || '',
    documento: initialData.documento || '',
    inscricao_estadual: initialData.inscricao_estadual || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    whatsapp: initialData.whatsapp || '',
    cep: initialData.cep || '',
    endereco: initialData.endereco || '',
    numero: initialData.numero || '',
    complemento: initialData.complemento || '',
    bairro: initialData.bairro || '',
    cidade: initialData.cidade || '',
    estado: initialData.estado || '',
    tipo: initialData.tipo || '',
  });

  const tipoOptions = [
    { label: 'Pessoa Física', value: 'pf' },
    { label: 'Pessoa Jurídica', value: 'pj' }
  ];

  useEffect(() => {
    if (tipoSelecionado) {
      setCliente(prev => ({ ...prev, tipo: tipoSelecionado }));
    }
  }, [tipoSelecionado]);

  useEffect(() => {
    const buscarCep = async () => {
      const cep = cliente.cep.replace(/\D/g, '');
      if (cep.length !== 8) return;

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();

        if (data.erro) {
          toast.current?.show({ severity: 'error', summary: 'CEP inválido', detail: 'CEP não encontrado.', life: 3000 });
          setCliente(prev => ({
            ...prev,
            endereco: '',
            bairro: '',
            cidade: '',
            estado: ''
          }));
          return;
        }

        setCliente(prev => ({
          ...prev,
          endereco: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.current?.show({ severity: 'error', summary: 'Erro ao buscar CEP', detail: 'Falha de conexão com o serviço.', life: 3000 });
      }
    };

    if (cliente.cep?.length >= 8) {
      buscarCep();
    }
  }, [cliente.cep]);


  const handleChange = (field, value) => {
    setCliente({ ...cliente, [field]: value });
    if (field === 'documento') {
      setDocInvalido(false); // libera botão se novo documento for digitado
    }
  };

  const checkDocumentoExistente = async () => {
    const docLimpo = cliente.documento.replace(/\D/g, '');
    const id = initialData?.id;
    try {
      const res = await apiEstoque.get(`/clientes/verifica-documento/${docLimpo}${id ? `/${id}` : ''}`);
      if (res.data.existe) {
        setDocInvalido(true);
        toast.current?.show({ severity: 'warn', summary: 'Duplicado', detail: 'Documento já cadastrado!' });
      }
    } catch (err) {
      console.error('Erro ao verificar documento', err);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(cliente);
    } catch (error) {
      console.error('Erro no submit', error);
    } finally {
      setLoading(false);
    }
  };

  const nomeLabel = tipoSelecionado === 'pj' ? 'Razão Social' : 'Nome';
  const documentoLabel = tipoSelecionado === 'pj' ? 'CNPJ' : 'CPF';
  const documentoMask = tipoSelecionado === 'pf' ? '999.999.999-99' : '99.999.999/9999-99';
  const telefoneMask = '(99) 99999-9999';

  if (!tipoSelecionado) {
    return (
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="tipo">Tipo de Cliente</label>
          <Dropdown
            id="tipo"
            value={tipoSelecionado}
            options={tipoOptions}
            onChange={(e) => setTipoSelecionado(e.value)}
            placeholder="Selecione o tipo"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="formgrid grid">

          <div className="field col-12">
            <label>Tipo de Cliente</label>
            <Dropdown value={tipoSelecionado} options={tipoOptions} disabled className="w-full" />
          </div>

          <div className="field col-12 md:col-8">
            <label htmlFor="nome">{nomeLabel}</label>
            <InputText id="nome" value={cliente.nome} onChange={(e) => handleChange('nome', e.target.value)} />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="documento">{documentoLabel}</label>
            <InputMask id="documento" mask={documentoMask} value={cliente.documento}
                       onChange={(e) => handleChange('documento', e.target.value)}
                       onBlur={checkDocumentoExistente}
            />
          </div>

          {tipoSelecionado === 'pj' && (
            <>
              <div className="field col-12 md:col-8">
                <label htmlFor="nome_fantasia">Nome Fantasia</label>
                <InputText id="nome_fantasia" value={cliente.nome_fantasia} onChange={(e) => handleChange('nome_fantasia', e.target.value)} />
              </div>
              <div className="field col-12 md:col-4">
                <label htmlFor="inscricao_estadual">Inscrição Estadual</label>
                <InputText id="inscricao_estadual" value={cliente.inscricao_estadual} onChange={(e) => handleChange('inscricao_estadual', e.target.value)} />
              </div>
            </>
          )}

          <div className="field col-12 md:col-6">
            <label htmlFor="email">Email</label>
            <InputText id="email" value={cliente.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="telefone">Telefone</label>
            <InputMask id="telefone" mask={telefoneMask} value={cliente.telefone} onChange={(e) => handleChange('telefone', e.target.value)} />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="whatsapp">Whatsapp</label>
            <InputMask id="whatsapp" mask={telefoneMask} value={cliente.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} />
          </div>

          <div className="field col-12 md:col-3">
            <label htmlFor="cep">CEP</label>
            <InputText id="cep" value={cliente.cep} onChange={(e) => handleChange('cep', e.target.value)} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="endereco">Rua</label>
            <InputText id="endereco" value={cliente.endereco} onChange={(e) => handleChange('endereco', e.target.value)} />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="numero">Número</label>
            <InputText id="numero" value={cliente.numero} onChange={(e) => handleChange('numero', e.target.value)} />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="bairro">Bairro</label>
            <InputText id="bairro" value={cliente.bairro} onChange={(e) => handleChange('bairro', e.target.value)} />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="cidade">Cidade</label>
            <InputText id="cidade" value={cliente.cidade} onChange={(e) => handleChange('cidade', e.target.value)} />
          </div>
          <div className="field col-12 md:col-2">
            <label htmlFor="estado">UF</label>
            <InputText id="estado" value={cliente.estado} onChange={(e) => handleChange('estado', e.target.value)} />
          </div>

          <div className="field col-12">
            <label htmlFor="complemento">Complemento</label>
            <InputText id="complemento" value={cliente.complemento} onChange={(e) => handleChange('complemento', e.target.value)} />
          </div>

          <div className="field col-12 flex justify-content-end">
            <Button label="Salvar" type="submit" icon="pi pi-check" className="mr-2" disabled={docInvalido} loading={loading} />
            <Button label="Cancelar" type="button" icon="pi pi-times" className="p-button-secondary" onClick={onCancel} />
          </div>
        </div>
      </form>
    </>
  );
};

export default ClienteForm;
