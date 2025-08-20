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
 * Formulário para criar/editar Assistência Autorizada.
 * Backend espera:
 * - nome* (string)
 * - cnpj (string|null)
 * - email, telefone, contato
 * - prazo_padrao_dias (int|null)
 * - endereco_json (array/obj) => { logradouro, numero, complemento, bairro, cidade, uf, cep }
 * - observacoes
 */
const AssistenciaForm = ({ initialData = {}, loading, onSubmit, onCancel }) => {
  const toastRef = useRef(null);

  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    email: '',
    telefone: '',
    prazo_padrao_dias: '',
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
    const e = initialData?.endereco || {};
    setForm({
      nome: initialData.nome || '',
      cnpj: initialData.cnpj || '',
      contato: initialData.contato || '',
      email: initialData.email || '',
      telefone: initialData.telefone || '',
      prazo_padrao_dias: initialData.prazo_padrao_dias ?? '',
      endereco_logradouro: e.logradouro || '',
      endereco_numero: e.numero || '',
      endereco_complemento: e.complemento || '',
      endereco_bairro: e.bairro || '',
      endereco_cidade: e.cidade || '',
      endereco_uf: e.uf || '',
      endereco_cep: e.cep || '',
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

    const endereco_json = {
      logradouro: form.endereco_logradouro || null,
      numero: form.endereco_numero || null,
      complemento: form.endereco_complemento || null,
      bairro: form.endereco_bairro || null,
      cidade: form.endereco_cidade || null,
      uf: form.endereco_uf || null,
      cep: form.endereco_cep || null,
    };

    const payload = {
      nome: form.nome,
      cnpj: form.cnpj || null,
      contato: form.contato || null,
      email: form.email || null,
      telefone: form.telefone || null,
      prazo_padrao_dias: form.prazo_padrao_dias === '' ? null : Number(form.prazo_padrao_dias),
      endereco_json,
      observacoes: form.observacoes || null,
      // ativo pode ser tratado em outra UI; se quiser, inclua aqui.
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
              <InputText value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} placeholder="Ex.: Autorizada Norte Sul"/>
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-bold">CNPJ</label>
              <InputText value={form.cnpj} onChange={(e) => handleChange('cnpj', e.target.value)} placeholder="11.111.111/0001-11"/>
            </div>

            <div className="field col-12 md:col-4">
              <label className="font-bold">E-mail</label>
              <InputText value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="atendimento@exemplo.com"/>
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-bold">Telefone</label>
              <InputText value={form.telefone} onChange={(e) => handleChange('telefone', e.target.value)} placeholder="(00) 0000-0000"/>
            </div>
            <div className="field col-12 md:col-4">
              <label className="font-bold">Contato</label>
              <InputText value={form.contato} onChange={(e) => handleChange('contato', e.target.value)} placeholder="Nome do responsável"/>
            </div>

            <div className="field col-12 md:col-4">
              <label className="font-bold">SLA padrão (dias)</label>
              <InputText keyfilter="int" value={form.prazo_padrao_dias} onChange={(e) => handleChange('prazo_padrao_dias', e.target.value)} placeholder="Ex.: 35"/>
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
