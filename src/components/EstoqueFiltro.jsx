import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { motion } from 'framer-motion';
import CalendarBR from "./CalendarBR";

const EstoqueFiltro = ({
  filtros,
  setFiltros,
  onProdutoChange,
  depositos,
  categorias,
  fornecedores,
  tipos,
  onBuscar,
  onLimpar,
}) => {
  return (
    <motion.div
      className="surface-card border-round shadow-1 p-4 mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid formgrid">

        {/* Tipo */}
        <div className="field col-12 sm:col-6 md:col-2">
          <label htmlFor="tipo" className="font-medium mb-2 block">Tipo</label>
          <Dropdown
            id="tipo"
            value={filtros.tipo}
            options={tipos}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.value })}
            placeholder="Selecione o tipo"
            showClear
            className="w-full"
          />
        </div>

        {/* Depósito */}
        <div className="field col-12 sm:col-6 md:col-2">
          <label htmlFor="deposito" className="font-medium mb-2 block">Depósito</label>
          <Dropdown
            id="deposito"
            value={filtros.deposito}
            options={depositos}
            onChange={(e) => setFiltros({ ...filtros, deposito: e.value })}
            placeholder="Selecione o depósito"
            showClear
            className="w-full"
          />
        </div>

        {/* Categoria */}
        <div className="field col-12 sm:col-6 md:col-2">
          <label htmlFor="categoria" className="font-medium mb-2 block">Categoria</label>
          <Dropdown
            id="categoria"
            value={filtros.categoria}
            options={categorias}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.value })}
            placeholder="Selecione"
            showClear
            filter
            className="w-full"
          />
        </div>

        {/* Fornecedor */}
        <div className="field col-12 sm:col-6 md:col-2">
          <label htmlFor="fornecedor" className="font-medium mb-2 block">Fornecedor</label>
          <Dropdown
            id="fornecedor"
            value={filtros.fornecedor}
            options={fornecedores}
            onChange={(e) => setFiltros({ ...filtros, fornecedor: e.value })}
            placeholder="Selecione"
            showClear
            filter
            className="w-full"
          />
        </div>

        {/* Produto */}
        <div className="field col-12 sm:col-6 md:col-3">
          <label htmlFor="produto" className="font-medium mb-2 block">
            Produto <i className="pi pi-info-circle text-500 ml-1" data-pr-tooltip="Você pode buscar por nome ou referência" />
          </label>
          <InputText
            id="produto"
            value={filtros.produto}
            onChange={(e) => {
              if (onProdutoChange) {
                onProdutoChange(e.target.value);
                return;
              }
              setFiltros({ ...filtros, produto: e.target.value });
            }}
            placeholder="Nome ou referência"
            className="w-full"
          />
        </div>

        {/* Período */}
        <div className="field col-12 sm:col-6 md:col-3">
          <label htmlFor="periodo" className="font-medium mb-2 block">
            Período <i className="pi pi-info-circle text-500 ml-1" data-pr-tooltip="Filtra os produtos com movimentações no intervalo" />
          </label>
          <CalendarBR
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.value })}
            placeholder="Selecionar intervalo"
          />
        </div>
        {/* Status de estoque */}
        <div className="field col-12 sm:col-6 md:col-2">
          <label htmlFor="estoque_status" className="font-medium mb-2 block">
            Estoque
            <i className="pi pi-info-circle text-500 ml-1" data-pr-tooltip="Filtra por produtos com ou sem estoque" />
          </label>
          <Dropdown
            id="estoque_status"
            value={filtros.estoque_status}
            options={[
              { label: 'Todos', value: 'all' },
              { label: 'Somente em estoque', value: 'com_estoque' },
              { label: 'Somente sem estoque', value: 'sem_estoque' },
            ]}
            onChange={(e) => setFiltros({ ...filtros, estoque_status: e.value })}
            className="w-full"
          />
        </div>

        {/* Botões */}
        <div className="col-12 flex justify-end gap-2 mt-4">
          <Button
            label="Filtrar"
            icon="pi pi-search"
            className="p-button-primary"
            type="button"
            onClick={onBuscar}
          />
          <Button
            label="Limpar"
            icon="pi pi-times"
            className="p-button-outlined p-button-secondary"
            type="button"
            onClick={onLimpar}
          />
        </div>
      </div>

      {/* Tooltips global init */}
      <Tooltip target="[data-pr-tooltip]" position="top" />
    </motion.div>
  );
};

export default EstoqueFiltro;
