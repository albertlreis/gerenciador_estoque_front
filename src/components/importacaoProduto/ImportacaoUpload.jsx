import React, { useEffect, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import { Toolbar } from 'primereact/toolbar';
import apiEstoque from '../../services/apiEstoque';

export default function ImportacaoUpload({ nota, deposito, produtos, onUpload, onDepositoChange, loadingUpload }) {
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiEstoque.get('/depositos')
      .then(({ data }) => setDepositos(data || []))
      .finally(() => setLoading(false));
  }, []);

  const Kpis = () => {
    const novos = produtos.filter(p => !p.variacao_id && !p.variacao_id_manual);
    const vinculados = produtos.length - novos.length;
    const custoTotal = produtos.reduce((acc, p) => acc + (p.custo_unitario || 0) * (p.quantidade || 0), 0);
    return (
      <div className="flex flex-wrap gap-2">
        <Chip label={`Itens: ${produtos.length}`} />
        <Chip label={`Novos: ${novos.length}`} />
        <Chip label={`Vinculados: ${vinculados}`} />
        <Chip label={`Custo total: R$ ${custoTotal.toFixed(2)}`} />
      </div>
    );
  };

  const leftToolbar = (
    <div className="flex items-center gap-2 text-sm md:text-base">
      <span className={`font-semibold ${!nota ? 'text-blue-600' : 'text-gray-500'}`}>
        1) Enviar XML
      </span>
      <i className="pi pi-angle-right text-gray-400" />
      <span className={`font-semibold ${nota && produtos.length ? 'text-blue-600' : 'text-gray-500'}`}>
        2) Revisar Produtos
      </span>
      <i className="pi pi-angle-right text-gray-400" />
      <span className="font-semibold text-gray-500">3) Confirmar Importação</span>
    </div>
  );

  return (
    <div className="sticky top-0 z-20 bg-white border-b">
      <Toolbar left={leftToolbar} />
      <div className="px-3 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <FileUpload
            name="arquivo"
            accept=".xml"
            mode="basic"
            customUpload
            uploadHandler={onUpload}
            auto
            chooseLabel={loadingUpload ? 'Enviando...' : 'Selecionar XML'}
            disabled={loadingUpload}
          />
          <Divider layout="vertical" className="hidden md:block" />
          <div className="flex items-center gap-2">
            <span>Depósito:</span>
            {loading ? (
              <Skeleton width="12rem" height="2.5rem" />
            ) : (
              <Dropdown
                value={deposito}
                options={(depositos || []).map(d => ({ label: d.nome, value: d.id }))}
                optionLabel="label"
                optionValue="value"
                placeholder="Escolha o depósito"
                className="w-12rem md:w-16rem"
                onChange={e => onDepositoChange(e.value)}
                disabled={loadingUpload}
              />
            )}
          </div>
        </div>
        <Kpis />
      </div>
    </div>
  );
}
