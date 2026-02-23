import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { useNavigate } from 'react-router-dom';

import { listarAvisos } from '../../services/avisosService';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSOES } from '../../constants/permissoes';

export default function AvisosCard() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const podeVisualizar = has([PERMISSOES.AVISOS.VISUALIZAR, PERMISSOES.AVISOS.GERENCIAR]);

  const [loading, setLoading] = useState(podeVisualizar);
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    if (!podeVisualizar) return;

    let ativo = true;
    const carregar = async () => {
      setLoading(true);
      try {
        const response = await listarAvisos({ ativos: 1, per_page: 5 });
        if (!ativo) return;
        setAvisos(Array.isArray(response?.data?.data) ? response.data.data : []);
      } catch (_) {
        if (!ativo) return;
        setAvisos([]);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
    };
  }, [podeVisualizar]);

  const naoLidos = useMemo(
    () => avisos.filter((aviso) => !aviso?.lido).length,
    [avisos]
  );

  if (!podeVisualizar) return null;

  return (
    <Card className="shadow-2">
      <div className="flex justify-content-between align-items-center mb-2">
        <h4 className="m-0">Avisos</h4>
        <span className="text-sm text-600">Nao lidos: {naoLidos}</span>
      </div>

      {loading ? (
        <div className="flex flex-column gap-2">
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" />
        </div>
      ) : (
        <ul className="m-0 pl-3" style={{ minHeight: '88px' }}>
          {avisos.slice(0, 3).map((aviso) => (
            <li key={aviso.id} className="mb-2 text-sm">
              {aviso.titulo}
            </li>
          ))}
          {avisos.length === 0 && (
            <li className="text-sm text-600">Nenhum aviso ativo.</li>
          )}
        </ul>
      )}

      <div className="flex justify-content-end mt-2">
        <Button
          label="Abrir mural"
          icon="pi pi-comments"
          className="p-button-sm"
          onClick={() => navigate('/mural')}
        />
      </div>
    </Card>
  );
}

