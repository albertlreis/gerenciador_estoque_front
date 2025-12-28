import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import apiEstoque from '../services/apiEstoque';

const exportOptions = [
  {
    label: 'PDF Simples',
    value: { formato: 'pdf', detalhado: false },
    icon: 'pi pi-file-pdf text-red-500',
  },
  {
    label: 'PDF Detalhado',
    value: { formato: 'pdf', detalhado: true },
    icon: 'pi pi-file-pdf text-danger',
  },
  {
    label: 'Excel',
    value: { formato: 'excel', detalhado: false },
    icon: 'pi pi-file-excel text-green-500',
  },
];

export default function PedidosExportar({ toast, loading }) {
  const [executando, setExecutando] = useState(false);

  const handleExport = async ({ formato, detalhado }) => {
    try {
      setExecutando(true);

      const params = new URLSearchParams({ formato });
      if (detalhado) params.append('detalhado', 'true');

      const response = await apiEstoque.get(`/pedidos/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedidos${detalhado ? '-detalhado' : ''}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: `Falha ao exportar (${formato}).` });
    } finally {
      setExecutando(false);
    }
  };

  return (
    <Dropdown
      options={exportOptions}
      optionLabel="label"
      value={null}
      onChange={(e) => handleExport(e.value)}
      placeholder="Exportar"
      className="w-full sm:w-auto"
      disabled={executando || loading}
      itemTemplate={(option) => (
        <div className="flex align-items-center gap-2">
          <i className={option.icon}></i>
          <span>{option.label}</span>
        </div>
      )}
      valueTemplate={() => (
        <div className="flex align-items-center gap-2">
          <i className="pi pi-download"></i>
          <span>Exportar</span>
        </div>
      )}
      panelClassName="w-15rem"
      showClear={false}
    />
  );
}
