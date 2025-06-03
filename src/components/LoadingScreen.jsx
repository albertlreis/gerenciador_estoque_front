import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingScreen = () => {
  return (
    <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '100vh' }}>
      <ProgressSpinner />
    </div>
  );
};

export default LoadingScreen;
