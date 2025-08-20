import React from 'react';
import { Tag } from 'primereact/tag';

const SlaTag = ({ dateStr }) => {
  if (!dateStr) return <Tag value="SLA N/D" severity="secondary" />;
  const today = new Date();
  const d = new Date(`${dateStr}T00:00:00`);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  let sev = 'success';
  if (diff <= 1) sev = 'danger';
  else if (diff <= 5) sev = 'warning';
  const label = diff >= 0 ? `${diff}d` : `${Math.abs(diff)}d atrasado`;
  return <Tag value={`SLA ${label}`} severity={sev} />;
};

export default SlaTag;
