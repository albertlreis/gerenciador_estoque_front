import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CalendarClock, User2, PackageCheck } from 'lucide-react';

const ConsignacoesAlert = ({ consignacoesVencendo = [], loading = false }) => {
  const navigate = useNavigate();

  const getPrazoLabel = (dias) => {
    if (dias < 0) return { texto: 'Vencida', icon: <AlertCircle className="text-red-600 mr-2 mt-1" size={18} /> };
    if (dias === 0) return { texto: 'Vence hoje', icon: <Clock className="text-orange-500 mr-2 mt-1" size={18} /> };
    return {
      texto: `Vence em ${dias} dia${dias > 1 ? 's' : ''}`,
      icon: <CalendarClock className="text-yellow-700 mr-2 mt-1" size={18} />
    };
  };

  const formatarPrazo = (prazo) => {
    if (!prazo) return { dias: 0, ...getPrazoLabel(0) };
    const hoje = new Date();
    const prazoData = new Date(prazo.split('/').reverse().join('-')); // d/m/Y → Y-m-d
    const diff = Math.ceil((prazoData - hoje) / (1000 * 60 * 60 * 24));
    return { dias: diff, ...getPrazoLabel(diff) };
  };

  return (
    <Card title="Consignações Vencendo" className="bg-yellow-50">
      <div className="max-h-20rem overflow-auto">
        {loading ? (
          <p className="text-center text-700">Carregando...</p>
        ) : consignacoesVencendo.length === 0 ? (
          <p className="text-center text-700">Nenhuma consignação com prazo próximo.</p>
        ) : (
          <ul className="list-none m-0 p-0">
            {consignacoesVencendo.slice(0, 3).map((item, index) => {
              if (!item) return null;

              const prazo = formatarPrazo(item.prazo_resposta);

              return (
                <li
                  key={item.id || `sem-id-${index}`}
                  className="flex align-items-start border-bottom-1 border-yellow-300 py-2"
                >
                  {prazo.icon}
                  <div>
                    <span className="font-semibold">Pedido #{item.pedido_id}</span>{' '}
                    {item.numero_externo ? `(${item.numero_externo})` : null}
                    <br />
                    <small className="text-700">
                      <User2 size={12} className="inline mr-1" /> {item.cliente_nome} —{' '}
                      <PackageCheck size={12} className="inline mr-1" /> {item.status_calculado}
                    </small>
                    <br />
                    <small className="text-700">
                      Prazo: {item.prazo_resposta} — {prazo.texto}
                    </small>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="text-right mt-3">
        <Button
          label="Ver todas"
          className="p-button-sm p-button-warning"
          onClick={() => navigate('/consignacoes')}
        />
      </div>
    </Card>
  );
};

export default ConsignacoesAlert;
