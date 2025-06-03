import React from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';

const GraficoCard = ({ titulo, tipo = 'bar', dados, opcoes, carregando, children }) => {
  const chartContainerStyle = {
    height: '400px',
    position: 'relative',
    overflowX: 'auto'
  };

  const chartCanvasStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  };

  return (
    <Card title={titulo} className="h-full">
      {children && <div className="mb-3">{children}</div>}

      {carregando || !dados?.datasets?.length ? (
        <Skeleton height="360px" />
      ) : (
        <div style={chartContainerStyle}>
          <Chart
            type={tipo}
            data={dados}
            options={opcoes}
            style={chartCanvasStyle}
          />
        </div>
      )}
    </Card>
  );
};

export default GraficoCard;
