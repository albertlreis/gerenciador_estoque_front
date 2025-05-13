import React from 'react';
import { Card } from 'primereact/card';
import { Bell } from 'lucide-react';

const Avisos = () => {
  const avisos = [
    'Fechamento de caixa até às 17h',
    'Sistema será atualizado amanhã às 22h'
  ];

  return (
    <div className="col-12">
      <Card title="Avisos Importantes" className="bg-yellow-50">
        <div className="max-h-20rem overflow-auto">
          {avisos.length === 0 ? (
            <p className="text-center text-700">Nenhum aviso no momento.</p>
          ) : (
            <ul className="list-none m-0 p-0">
              {avisos.map((aviso, idx) => (
                <li
                  key={idx}
                  className="flex align-items-start border-bottom-1 border-yellow-300 py-2"
                >
                  <Bell className="mr-2 text-yellow-600 mt-1" size={16} />
                  <span className="text-800">{aviso}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Avisos;
