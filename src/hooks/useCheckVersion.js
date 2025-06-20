import { useEffect } from 'react';

const useCheckVersion = () => {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' });
        const { version } = await res.json();

        const savedVersion = localStorage.getItem('app_version');

        if (savedVersion && savedVersion !== version) {
          localStorage.setItem('app_version', version);
          window.location.reload(true);
        } else if (!savedVersion) {
          localStorage.setItem('app_version', version);
        }
      } catch (error) {
        console.warn('Erro ao verificar versão:', error);
      }
    };

    checkVersion();
  }, []);
};

export default useCheckVersion;
