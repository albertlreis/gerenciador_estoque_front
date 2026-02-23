import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { TabMenu } from 'primereact/tabmenu';
import { Skeleton } from 'primereact/skeleton';

import { listarAniversarios } from '../../services/aniversariosService';

const TABS = [
  { label: 'Hoje', dias: 0 },
  { label: 'Proximos 7', dias: 7 },
  { label: 'Proximos 30', dias: 30 },
];

const TIPOS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Clientes', value: 'clientes' },
  { label: 'Parceiros', value: 'parceiros' },
];

export default function AniversariantesCard() {
  const [tabIndex, setTabIndex] = useState(1);
  const [tipo, setTipo] = useState('todos');
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const diasSelecionado = useMemo(() => TABS[tabIndex]?.dias ?? 7, [tabIndex]);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setLoading(true);
      try {
        const response = await listarAniversarios({
          tipo,
          dias: diasSelecionado,
        });

        if (!ativo) return;
        setLista(Array.isArray(response?.data) ? response.data : []);
      } catch (_) {
        if (!ativo) return;
        setLista([]);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
    };
  }, [diasSelecionado, tipo]);

  return (
    <Card className="shadow-2">
      <div className="flex justify-content-between align-items-center mb-2">
        <h4 className="m-0">Aniversariantes</h4>
        <span className="text-sm text-600">{lista.length} encontrados</span>
      </div>

      <TabMenu
        model={TABS.map((tab) => ({ label: tab.label }))}
        activeIndex={tabIndex}
        onTabChange={(e) => setTabIndex(e.index)}
      />

      <div className="mt-2 mb-3">
        <SelectButton
          value={tipo}
          onChange={(e) => setTipo(e.value)}
          options={TIPOS}
          optionLabel="label"
          optionValue="value"
          allowEmpty={false}
        />
      </div>

      {loading ? (
        <div className="flex flex-column gap-2">
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
        </div>
      ) : (
        <ul className="m-0 pl-3" style={{ minHeight: '88px' }}>
          {lista.slice(0, 5).map((item) => (
            <li key={`${item.tipo}-${item.id}`} className="mb-2 text-sm">
              <strong>{item.nome}</strong> - {item.dia_mes} ({item.tipo})
            </li>
          ))}
          {lista.length === 0 && (
            <li className="text-sm text-600">Nenhum aniversariante no periodo.</li>
          )}
        </ul>
      )}
    </Card>
  );
}

