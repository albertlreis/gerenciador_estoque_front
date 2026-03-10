import React, { useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';

const AvisosAniversariosCard = ({
  avisosNaoLidos = 0,
  aniversariantesHoje = [],
  aniversariantesProximos7 = [],
  aniversariantesProximos30 = [],
  onAbrirMural,
}) => {
  const [aba, setAba] = useState('hoje');
  const [tipo, setTipo] = useState('todos');

  const listaAtual = useMemo(() => {
    if (aba === '7') return aniversariantesProximos7;
    if (aba === '30') return aniversariantesProximos30;
    return aniversariantesHoje;
  }, [aba, aniversariantesHoje, aniversariantesProximos7, aniversariantesProximos30]);

  const listaFiltrada = listaAtual.filter((item) => (tipo === 'todos' ? true : item.tipo === tipo));

  return (
    <div className="grid mb-4">
      <div className="col-12 md:col-4">
        <Card className="h-full shadow-2 border-round-xl">
          <div className="flex justify-content-between align-items-center">
            <div>
              <div className="text-600">Avisos</div>
              <div className="text-900 text-3xl font-bold">{avisosNaoLidos}</div>
              <small className="text-600">não lidos</small>
            </div>
            <Button
              label="Abrir mural"
              icon="pi pi-megaphone"
              className="p-button-sm p-button-outlined"
              onClick={onAbrirMural}
            />
          </div>
        </Card>
      </div>

      <div className="col-12 md:col-8">
        <Card className="h-full shadow-2 border-round-xl">
          <div className="flex justify-content-between align-items-center mb-3">
            <div>
              <div className="text-900 text-xl font-semibold">Aniversariantes</div>
              <small className="text-600">Clientes e parceiros</small>
            </div>
            <div className="flex gap-2">
              <Button className={`p-button-sm ${aba === 'hoje' ? '' : 'p-button-outlined'}`} label="Hoje" onClick={() => setAba('hoje')} />
              <Button className={`p-button-sm ${aba === '7' ? '' : 'p-button-outlined'}`} label="Próx. 7" onClick={() => setAba('7')} />
              <Button className={`p-button-sm ${aba === '30' ? '' : 'p-button-outlined'}`} label="Próx. 30" onClick={() => setAba('30')} />
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <Button className={`p-button-sm ${tipo === 'todos' ? '' : 'p-button-outlined'}`} label="Todos" onClick={() => setTipo('todos')} />
            <Button className={`p-button-sm ${tipo === 'cliente' ? '' : 'p-button-outlined'}`} label="Clientes" onClick={() => setTipo('cliente')} />
            <Button className={`p-button-sm ${tipo === 'parceiro' ? '' : 'p-button-outlined'}`} label="Parceiros" onClick={() => setTipo('parceiro')} />
          </div>

          {listaFiltrada.length === 0 && <div className="text-600">Nenhum aniversariante no período.</div>}

          {listaFiltrada.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listaFiltrada.map((item) => (
                <Chip
                  key={`${item.tipo}-${item.id}`}
                  label={`${item.nome} (${item.dia_mes})`}
                  className="surface-200 text-800"
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AvisosAniversariosCard;
