import React from 'react';
import GraficoCard from '../shared/GraficoCard';
import FiltrosGrafico from '../shared/FiltrosGrafico';
import { defaultChartOptions } from '../../utils/chartOptions';

const ChartsSection = ({
                         graficoPedidos,
                         graficoValores,
                         graficoStatus,
                         carregandoGrafico,
                         carregandoStatus,
                         periodo,
                         tipoGrafico,
                         setPeriodo,
                         setTipoGrafico,
                         handleAtualizarGrafico,
                         perfil
                       }) => {
  if (perfil !== 'admin') return null;

  return (
    <div className="grid">
      <div className="col-12 md:col-6">
        <GraficoCard
          titulo="Pedidos por Mês"
          tipo={tipoGrafico}
          dados={graficoPedidos}
          opcoes={defaultChartOptions}
          carregando={carregandoGrafico}
        >
          <FiltrosGrafico
            periodo={periodo}
            setPeriodo={setPeriodo}
            tipoGrafico={tipoGrafico}
            setTipoGrafico={setTipoGrafico}
            aoAtualizar={handleAtualizarGrafico}
            carregando={carregandoGrafico}
          />
        </GraficoCard>
      </div>

      <div className="col-12 md:col-6">
        <GraficoCard
          titulo="Faturamento por Mês"
          tipo="line"
          dados={graficoValores}
          opcoes={defaultChartOptions}
          carregando={carregandoGrafico}
        />
      </div>
    </div>
  );
};

export default ChartsSection;
