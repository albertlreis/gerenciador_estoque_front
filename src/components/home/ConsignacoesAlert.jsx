import React from 'react';
import {Card} from 'primereact/card';
import {Clock} from 'lucide-react';
import {Button} from 'primereact/button';
import {useNavigate} from 'react-router-dom';

const ConsignacoesAlert = ({consignacoesVencendo = [], loading = false}) => {
  const navigate = useNavigate();

  return (
    <Card title="Consignações Vencendo" className="bg-yellow-50">
      <div className="max-h-20rem overflow-auto">
        {loading ? (
          <p className="text-center text-700">Carregando...</p>
        ) : consignacoesVencendo.length === 0 ? (
          <p className="text-center text-700">Nenhuma consignação com prazo próximo.</p>
        ) : (
          <ul className="list-none m-0 p-0">
            {consignacoesVencendo.slice(0, 3).map((item) => (
              <li key={item.id} className="flex align-items-start border-bottom-1 border-yellow-300 py-2">
                <Clock className="mr-2 text-yellow-600 mt-1" size={16}/>
                <div>
                  <span
                    className="font-semibold">Pedido #{item.pedido.id}</span> — {item.produto_nome}
                  <br/>
                  <small className="text-700">Prazo: {item.prazo_resposta} ({item.dias_para_vencer} dia(s))</small>
                </div>
              </li>
            ))}
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
