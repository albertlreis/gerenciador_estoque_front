import React, { useMemo } from 'react';

export default function JsonViewer({ value }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value ?? null, null, 2);
    } catch {
      return String(value ?? '');
    }
  }, [value]);

  return (
    <pre
      style={{
        margin: 0,
        padding: '12px',
        borderRadius: 8,
        background: 'var(--surface-50)',
        border: '1px solid var(--surface-200)',
        overflow: 'auto',
        maxHeight: 420,
        fontSize: 12,
      }}
    >
      {text}
    </pre>
  );
}
