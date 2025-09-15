import React, { useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';

/**
 * BarcodeScanner
 * - Usa Quagga2 para leitura via câmera (desktop e mobile).
 * Props:
 *  - onDetected(code: string): callback quando um código é detectado
 *  - facingMode: 'environment' | 'user' (traseira / frontal)
 *  - continuous: boolean (se true, não para após detectar)
 *  - className: string opcional para estilização
 */
export default function BarcodeScanner({
                                         onDetected,
                                         facingMode = 'environment',
                                         continuous = true,
                                         className = '',
                                       }) {
  const nodeRef = useRef(null);
  const lastRef = useRef({ code: null, ts: 0 });

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!nodeRef.current) return;
      try { Quagga.stop(); } catch {}

      await Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: nodeRef.current,
          constraints: { facingMode },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'code_128_reader',
            'code_39_reader',
            'upc_reader',
            'upc_e_reader',
          ],
        },
        locate: true,
      });

      if (!isMounted) return;
      Quagga.start();

      const handler = (data) => {
        const code = data?.codeResult?.code;
        if (!code) return;

        const now = Date.now();
        if (lastRef.current.code === code && now - lastRef.current.ts < 800) return;
        lastRef.current = { code, ts: now };

        onDetected?.(code);
        if (!continuous) {
          Quagga.offDetected(handler);
          try { Quagga.stop(); } catch {}
        }
      };

      Quagga.onDetected(handler);
    };

    init().catch(console.error);

    return () => {
      isMounted = false;
      try { Quagga.stop(); } catch {}
    };
  }, [onDetected, facingMode, continuous]);

  return (
    <div
      ref={nodeRef}
      className={className}
      style={{ width: '100%', minHeight: 280, borderRadius: 8, overflow: 'hidden', background: '#000' }}
    />
  );
}
