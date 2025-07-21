import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export default function FormularioCliente({ cliente, onChange }) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="formgrid grid p-fluid">
      <div className="field col-12 md:col-6">
        <label htmlFor="nome">Nome</label>
        <InputText id="nome" value={cliente.nome || ''} onChange={(e) => handleChange('nome', e.target.value)} />
      </div>
      <div className="field col-12 md:col-6">
        <label htmlFor="documento">Documento</label>
        <InputText id="documento" value={cliente.documento || ''} onChange={(e) => handleChange('documento', e.target.value)} />
      </div>
      <div className="field col-12 md:col-6">
        <label htmlFor="email">E-mail</label>
        <InputText id="email" value={cliente.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
      </div>
      <div className="field col-12 md:col-6">
        <label htmlFor="telefone">Telefone</label>
        <InputText id="telefone" value={cliente.telefone || ''} onChange={(e) => handleChange('telefone', e.target.value)} />
      </div>
      <div className="field col-12">
        <label htmlFor="endereco">Endereço</label>
        <InputText id="endereco" value={cliente.endereco || ''} onChange={(e) => handleChange('endereco', e.target.value)} />
      </div>
      <div className="field col-12 md:col-3">
        <label htmlFor="bairro">Bairro</label>
        <InputText id="bairro" value={cliente.bairro || ''} onChange={(e) => handleChange('bairro', e.target.value)} />
      </div>
      <div className="field col-12 md:col-3">
        <label htmlFor="cidade">Cidade</label>
        <InputText id="cidade" value={cliente.cidade || ''} onChange={(e) => handleChange('cidade', e.target.value)} />
      </div>
      <div className="field col-12 md:col-3">
        <label htmlFor="cep">CEP</label>
        <InputText id="cep" value={cliente.cep || ''} onChange={(e) => handleChange('cep', e.target.value)} />
      </div>
      <div className="field col-12">
        <label htmlFor="endereco_entrega">Endereço de Entrega</label>
        <InputText id="endereco_entrega" value={cliente.endereco_entrega || ''} onChange={(e) => handleChange('endereco_entrega', e.target.value)} />
      </div>
      <div className="field col-12">
        <label htmlFor="prazo_entrega">Prazo de Entrega</label>
        <InputTextarea id="prazo_entrega" value={cliente.prazo_entrega || ''} onChange={(e) => handleChange('prazo_entrega', e.target.value)} rows={3} />
      </div>
    </div>
  );
}
