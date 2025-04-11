import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

const ProdutoVariacaoForm = ({ initialData = {}, produtos = [], onSubmit, onCancel }) => {
  // Valores iniciais: se houver edição, usa os dados passados; caso contrário, define valores padrão.
  const [variacao, setVariacao] = useState({
    id_produto: initialData.id_produto || null,
    sku: initialData.sku || '',
    nome: initialData.nome || '',
    preco: initialData.preco || 0,
    custo: initialData.custo || 0,
    peso: initialData.peso || 0,
    altura: initialData.altura || 0,
    largura: initialData.largura || 0,
    profundidade: initialData.profundidade || 0,
    codigo_barras: initialData.codigo_barras || ''
  });

  const handleChange = (field, value) => {
    setVariacao({ ...variacao, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(variacao);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Produto */}
      <div className="p-field">
        <label htmlFor="id_produto">Produto</label>
        <Dropdown
          id="id_produto"
          value={variacao.id_produto}
          options={produtos}
          onChange={(e) => handleChange('id_produto', e.value)}
          optionLabel="nome"
          placeholder="Selecione um produto"
        />
      </div>
      {/* SKU */}
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="sku"
            value={variacao.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
          />
          <label htmlFor="sku">SKU</label>
        </span>
      </div>
      {/* Nome */}
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="nome"
            value={variacao.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
          <label htmlFor="nome">Nome</label>
        </span>
      </div>
      {/* Preço */}
      <div className="p-field">
        <span className="p-float-label">
          <InputNumber
            id="preco"
            value={variacao.preco}
            onValueChange={(e) => handleChange('preco', e.value)}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
          <label htmlFor="preco">Preço</label>
        </span>
      </div>
      {/* Custo */}
      <div className="p-field">
        <span className="p-float-label">
          <InputNumber
            id="custo"
            value={variacao.custo}
            onValueChange={(e) => handleChange('custo', e.value)}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
          <label htmlFor="custo">Custo</label>
        </span>
      </div>
      {/* Peso */}
      <div className="p-field">
        <span className="p-float-label">
          <InputNumber
            id="peso"
            value={variacao.peso}
            onValueChange={(e) => handleChange('peso', e.value)}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
          />
          <label htmlFor="peso">Peso</label>
        </span>
      </div>
      {/* Altura */}
      <div className="p-field">
        <span className="p-float-label">
          <InputNumber
            id="altura"
            value={variacao.altura}
            onValueChange={(e) => handleChange('altura', e.value)}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
          />
          <label htmlFor="altura">Altura</label>
        </span>
      </div>
      {/* Largura */}
      <div className="p-field">
        <span className="p-float-label">
          <InputNumber
            id="largura"
            value={variacao.largura}
            onValueChange={(e) => handleChange('largura', e.value)}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
          />
          <label htmlFor="largura">Largura</label>
        </span>
      </div>
      {/* Profundidade */}
      <div className="p-field">
        <span className="p-float-label">
          <InputNumber
            id="profundidade"
            value={variacao.profundidade}
            onValueChange={(e) => handleChange('profundidade', e.value)}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
          />
          <label htmlFor="profundidade">Profundidade</label>
        </span>
      </div>
      {/* Código de Barras */}
      <div className="p-field">
        <span className="p-float-label">
          <InputText
            id="codigo_barras"
            value={variacao.codigo_barras}
            onChange={(e) => handleChange('codigo_barras', e.target.value)}
          />
          <label htmlFor="codigo_barras">Código de Barras</label>
        </span>
      </div>
      {/* Ações */}
      <div className="p-field" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button label="Salvar" type="submit" className="p-mr-2" />
        <Button label="Cancelar" type="button" className="p-button-secondary" onClick={onCancel} />
      </div>
    </form>
  );
};

export default ProdutoVariacaoForm;
