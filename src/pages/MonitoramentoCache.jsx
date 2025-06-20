import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import apiAuth from '../services/apiAuth';
import SakaiLayout from '../layouts/SakaiLayout';

const MonitoramentoCache = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAuth.get('/monitoramento/cache')
      .then(res => setDados(res.data))
      .finally(() => setLoading(false));
  }, []);

  const formatarStatus = (rowData) => {
    const cores = {
      cache_hit: 'success',
      cache_miss: 'warning'
    };
    return <Tag value={rowData.status} severity={cores[rowData.status] || 'info'} />;
  };

  return (
    <SakaiLayout>
      <Card title="Monitoramento de Cache e Métricas">
        <DataTable value={dados} loading={loading} paginator rows={20} responsiveLayout="scroll">
          <Column field="criado_em" header="Data/Hora" />
          <Column field="origem" header="Origem" />
          <Column field="status" header="Status" body={formatarStatus} />
          <Column field="chave" header="Chave de Cache" />
          <Column field="usuario_id" header="Usuário" />
          <Column field="duracao_ms" header="Duração (ms)" />
        </DataTable>
      </Card>
    </SakaiLayout>
  );
};

export default MonitoramentoCache;
