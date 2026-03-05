import React, { useMemo, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

export default function SelectOrCreate({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione',
  loading = false,
  disabled = false,
  filter = true,
  createLabel = 'Cadastrar',
  dialogTitle = 'Cadastrar item',
  onCreate,
}) {
  const inputRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);

  const canCreate = typeof onCreate === 'function';
  const trimmedName = useMemo(() => nome.trim(), [nome]);

  const openDialog = () => {
    if (!canCreate || disabled) return;
    setNome('');
    setShowDialog(true);
    setTimeout(() => inputRef.current?.focus?.(), 50);
  };

  const closeDialog = () => {
    if (saving) return;
    setShowDialog(false);
  };

  const handleSave = async () => {
    if (!trimmedName || !canCreate) return;
    setSaving(true);
    try {
      const created = await onCreate(trimmedName);
      if (created !== undefined && created !== null) {
        onChange?.(created);
      }
      setShowDialog(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Dropdown
          value={value}
          options={options}
          onChange={(e) => onChange?.(e.value)}
          placeholder={placeholder}
          className="w-full"
          showClear
          filter={filter}
          loading={loading}
          disabled={disabled}
        />
        {canCreate && (
          <Button
            type="button"
            icon="pi pi-plus"
            label={createLabel}
            outlined
            onClick={openDialog}
            disabled={disabled || loading}
          />
        )}
      </div>

      <Dialog
        header={dialogTitle}
        visible={showDialog}
        style={{ width: '420px', maxWidth: '95vw' }}
        onHide={closeDialog}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={closeDialog} disabled={saving} />
            <Button label="Salvar" icon="pi pi-check" onClick={handleSave} disabled={!trimmedName} loading={saving} />
          </div>
        }
      >
        <label className="block mb-2">Nome</label>
        <InputText
          ref={inputRef}
          className="w-full"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
          disabled={saving}
        />
      </Dialog>
    </>
  );
}
