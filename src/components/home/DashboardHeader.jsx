import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useAuth } from '../../context/AuthContext';
import { getGravatarUrl, getInitials } from '../../utils/gravatar';

/**
 * Cabeçalho reutilizável com saudação, e-mail e botão de atualização.
 * O toast de sucesso pode ser chamado via ref.
 */
const DashboardHeader = forwardRef(({ onAtualizar }, ref) => {
  const { user } = useAuth();
  const toastRef = useRef(null);

  useImperativeHandle(ref, () => ({
    showToast: (mensagem) => {
      toastRef.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: mensagem || 'Dados atualizados com sucesso.',
        life: 3000
      });
    }
  }));

  return (
    <>
      <Toast ref={toastRef} />
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <div className="flex align-items-center gap-3">
          <Avatar image={getGravatarUrl(user?.email)} label={getInitials(user?.nome)} />
          <div>
            <h2 className="m-0">Bem-vindo, {user?.nome}</h2>
            <Tag value={user?.email} severity="info" />
          </div>
        </div>

        <Button
          label="Atualizar dados"
          icon="pi pi-refresh"
          className="p-button-sm p-button-secondary"
          onClick={onAtualizar}
          aria-label="Atualizar dados do painel"
          outlined
        />
      </div>
    </>
  );
});

export default DashboardHeader;
