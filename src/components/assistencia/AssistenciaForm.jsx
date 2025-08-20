import React, { useEffect, useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
].map(uf => ({ label: uf, value: uf }));

/**
 * Formulário reutilizável para criar/editar Assistência Autorizada.
 * Campos genéricos (ajuste conforme seu backend aceitar):
 * - nome* (string)
 * - documento (CNPJ/CPF)
 * - email
 * - telefone
 * - prazo_sla_dias (int)
 * - endereco_* (logradouro, numero, complemento, bairro, cidade, uf, cep)
 * - observacoes
 */
const AssistenciaForm = ({ initialData = {}, loading, onSubmit, onCancel }) => {
  const toastRef = useRef(null);

  const [form, setForm] = useState({
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    prazo_sla_dias: '',
    endereco_logradouro: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_uf: '',
    endereco_cep: '',
    observacoes: '',
  });

  useEffect(() => {
    setForm({
      nome: initialData.nome || '',
      documento: initialData.documento || '',
      email: initialData.email || '',
      telefone: initialData.telefone || '',
      prazo_sla_dias: initialData.prazo_sla_dias ?? '',
      endereco_logradouro: initialData.endereco_logradouro || '',
      endereco_numero: initialData.endereco_numero || '',
      endereco_complemento: initialData.endereco_complemento || '',
      endereco_bairro: initialData.endereco_bairro || '',
      endereco_cidade: initialData.endereco_cidade || '',
      endereco_uf: initialData.endereco_uf || '',
      endereco_cep: initialData.endereco_cep || '',
      observacoes: initialData.observacoes || '',
    });
  }, [initialData]);

  const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome?.trim()) {
      toastRef.current?.show({ severity: 'warn', summary: 'Validação', detail: 'Informe o nome da assistência.', life: 3000 });
      return;
    }
    const payload = {
      ...form,
      prazo_sla_dias: form.prazo_sla_dias === '' ? null : Number(form.prazo_sla_dias),
    };
    await onSubmit?.(payload);
  };

  return (
    <>
      <Toast ref={toastRef} position="top-center" />

      <form onSubmit={submit} className="p-fluid">
        <Panel header="Dados da Assistência">
          <div className="formgrid grid">
            <div className="field col-12 md:col-8">
              <label className="font-bold">Nome *</label>
              <InputText value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} placeholder="Ex.: Assistência ABC"/>
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-bold">Documento</label>
              <InputText value={form.documento} onChange={(e) => handleChange('documento', e.target.value)} placeholder="CNPJ/CPF"/>
            </div>

            <div className="field col-12 md:col-4">
              <label className="font-bold">E-mail</label>
              <InputText value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="contato@exemplo.com"/>
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-bold">Telefone</label>
              <InputText value={form.telefone} onChange={(e) => handleChange('telefone', e.target.value)} placeholder="(00) 00000-0000"/>
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-bold">SLA (dias)</label>
              <InputText keyfilter="int" value={form.prazo_sla_dias} onChange={(e) => handleChange('prazo_sla_dias', e.target.value)} placeholder="Ex.: 10"/>
            </div>

            <div className="field col-12">
              <label className="font-bold">Observações</label>
              <InputTextarea rows={2} value={form.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)}/>
            </div>
          </div>
        </Panel>

        <Panel header="Endereço" className="mt-3">
          <div className="formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="font-bold">Logradouro</label>
              <InputText value={form.endereco_logradouro} onChange={(e) => handleChange('endereco_logradouro', e.target.value)}/>
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-bold">Número</label>
              <InputText value={form.endereco_numero} onChange={(e) => handleChange('endereco_numero', e.target.value)}/>
            </div>
            <div className="field col-6 md:col-4">
              <label className="font-bold">Complemento</label>
              <InputText value={form.endereco_complemento} onChange={(e) => handleChange('endereco_complemento', e.target.value)}/>
            </div>

            <div className="field col-12 md:col-4">
              <label className="font-bold">Bairro</label>
              <InputText value={form.endereco_bairro} onChange={(e) => handleChange('endereco_bairro', e.target.value)}/>
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-bold">Cidade</label>
              <InputText value={form.endereco_cidade} onChange={(e) => handleChange('endereco_cidade', e.target.value)}/>
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-bold">UF</label>
              <Dropdown value={form.endereco_uf} options={UFS} onChange={(e) => handleChange('endereco_uf', e.value)} placeholder="UF" showClear/>
            </div>
            <div className="field col-6 md:col-2">
              <label className="font-bold">CEP</label>
              <InputText value={form.endereco_cep} onChange={(e) => handleChange('endereco_cep', e.target.value)} placeholder="00000-000"/>
            </div>
          </div>

          <div className="mt-3 flex justify-content-end gap-2">
            <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-secondary" onClick={onCancel}/>
            <Button type="submit" label="Salvar" icon="pi pi-check" loading={loading}/>
          </div>
        </Panel>
      </form>
    </>
  );
};

export default AssistenciaForm;
