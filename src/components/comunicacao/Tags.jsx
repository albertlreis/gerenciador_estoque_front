import React from 'react';
import { Tag } from 'primereact/tag';

const statusMeta = (sRaw) => {
  const s = String(sRaw || '').toLowerCase();
  if (['delivered', 'read'].includes(s)) return { severity: 'success', label: s };
  if (['sent', 'sending', 'queued'].includes(s)) return { severity: 'info', label: s };
  if (['failed'].includes(s)) return { severity: 'danger', label: s };
  if (['blocked'].includes(s)) return { severity: 'warning', label: s };
  if (['canceled', 'cancelled'].includes(s)) return { severity: 'secondary', label: s };
  return { severity: 'contrast', label: s || 'unknown' };
};

export function StatusTag({ value }) {
  const { severity, label } = statusMeta(value);
  return <Tag severity={severity} value={label} />;
}

export function ChannelTag({ value }) {
  const c = String(value || '').toLowerCase();
  const map = {
    whatsapp: { severity: 'success', label: 'whatsapp' },
    email: { severity: 'info', label: 'email' },
    sms: { severity: 'warning', label: 'sms' },
  };
  const x = map[c] || { severity: 'secondary', label: c || 'unknown' };
  return <Tag severity={x.severity} value={x.label} />;
}
