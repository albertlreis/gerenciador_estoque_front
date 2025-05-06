import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

const ClienteForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [tipoSelecionado, setTipoSelecionado] = useState(initialData.tipo || '');

  const [cliente, setCliente] = useState({
    nome: initialData.nome || '',
    nome_fantasia: initialData.nome_fantasia || '',
    documento: initialData.documento || '',
    inscricao_estadual: initialData.inscricao_estadual || '',
    email: initialData.email || '',
    telefone: initialData.telefone || '',
    endereco: initialData.endereco || '',
    tipo: initialData.tipo || '',
    whatsapp: initialData.whatsapp || '',
    cep: initialData.cep || '',
    complemento: initialData.complemento || '',
  });

  const [loading, setLoading] = useState(false);

  const tipoOptions = [
    { label: 'Pessoa Física', value: 'pf' },
    { label: 'Pessoa Jurídica', value: 'pj' }
  ];

  useEffect(() => {
    if (tipoSelecionado) {
      setCliente(prev => ({ ...prev, tipo: tipoSelecionado }));
    }
  }, [tipoSelecionado]);

  const handleChange = (field, value) => {
    setCliente({ ...cliente, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(cliente);
    } catch (error) {
      console.error('Erro no processamento do formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!tipoSelecionado) {
    return (
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="tipo">Selecione o Tipo de Cliente</label>
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

  const nomeLabel = tipoSelecionado === 'pj' ? 'Razão Social' : 'Nome';
  const documentoLabel = tipoSelecionado === 'pj' ? 'CNPJ' : 'CPF';
  const documentoMask = tipoSelecionado === 'pf' ? '999.999.999-99' : '99.999.999/9999-99';
  const telefoneMask = '(99) 99999-9999';

  return (
    <form onSubmit={handleSubmit} className="p-fluid">
      <div className="formgrid grid">
        {/* Tipo de Cliente */}
        <div className="field col-12">
          <label>Tipo de Cliente</label>
          <Dropdown value={tipoSelecionado} options={tipoOptions} disabled className="w-full" />
        </div>

        {/* Nome e CPF/CNPJ */}
        <div className="field col-12 md:col-8">
          <label htmlFor="nome">{nomeLabel}</label>
          <InputText id="nome" value={cliente.nome} onChange={(e) => handleChange('nome', e.target.value)} />
        </div>
        <div className="field col-12 md:col-4">
          <label htmlFor="documento">{documentoLabel}</label>
          <InputMask id="documento" mask={documentoMask} value={cliente.documento} onChange={(e) => handleChange('documento', e.target.value)} />
        </div>

        {/* Nome Fantasia e IE (somente PJ) */}
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

        {/* Email, Telefone, Whatsapp */}
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

        {/* Endereço, CEP, Complemento */}
        <div className="field col-12 md:col-3">
          <label htmlFor="cep">CEP</label>
          <InputText id="cep" value={cliente.cep} onChange={(e) => handleChange('cep', e.target.value)} />
        </div>
        <div className="field col-12 md:col-9">
          <label htmlFor="endereco">Endereço</label>
          <InputText id="endereco" value={cliente.endereco} onChange={(e) => handleChange('endereco', e.target.value)} />
        </div>
        <div className="field col-12 md:col-12">
          <label htmlFor="complemento">Complemento</label>
          <InputText id="complemento" value={cliente.complemento} onChange={(e) => handleChange('complemento', e.target.value)} />
        </div>

        {/* Botões */}
        <div className="field col-12 flex justify-content-end">
          <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading} className="mr-2" />
          <Button label="Cancelar" type="button" icon="pi pi-times" className="p-button-secondary" onClick={onCancel} />
        </div>
      </div>
    </form>
  );
};

export default ClienteForm;
