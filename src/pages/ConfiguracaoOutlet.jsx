import React, { useState, useEffect, useRef } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';

const camposConfiguracoes = [
  {
    chave: 'dias_para_outlet',
    label: 'Dias sem movimentação para considerar Outlet',
    tipo: 'number',
    min: 1
  },
  {
    chave: 'desconto_maximo_outlet',
    label: 'Percentual máximo de desconto no Outlet (%)',
    tipo: 'number',
    min: 1,
    max: 100
  }
];

const Configuracoes = () => {
  const toast = useRef(null);
  const [valores, setValores] = useState({});
  const [carregando, setCarregando] = useState(true);

  const buscarConfiguracoes = async () => {
    try {
      const response = await apiEstoque.get('/configuracoes');
      setValores(response.data);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro ao buscar configurações',
        detail: err.response?.data?.message || err.message,
        life: 4000
      });
    } finally {
      setCarregando(false);
    }
  };

  const salvar = async (chave) => {
    try {
      await apiEstoque.put(`/configuracoes/${chave}`, {
        valor: valores[chave]
      });

      toast.current.show({
        severity: 'success',
        summary: 'Configuração atualizada!',
        detail: `Chave ${chave}`,
        life: 3000
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro ao salvar configuração',
        detail: err.response?.data?.message || err.message,
        life: 4000
      });
    }
  };

  useEffect(() => {
    buscarConfiguracoes();
  }, []);

  const atualizarValor = (chave, novoValor) => {
    setValores((prev) => ({ ...prev, [chave]: novoValor }));
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4">
        <h2>Configurações do Sistema</h2>
        <Divider />
        {carregando ? (
          <div className="flex flex-column gap-3">
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
          </div>
        ) : (
          <div className="flex flex-column gap-4">
            {camposConfiguracoes.map((campo) => (
              <div key={campo.chave} className="flex align-items-center gap-3">
                <label htmlFor={campo.chave} style={{ width: '400px' }}>
                  {campo.label}:
                </label>
                <InputNumber
                  id={campo.chave}
                  value={Number(valores[campo.chave])}
                  onValueChange={(e) => atualizarValor(campo.chave, e.value)}
                  min={campo.min}
                  max={campo.max}
                  inputStyle={{ width: '150px' }}
                />
                <Button
                  icon="pi pi-save"
                  label="Salvar"
                  onClick={() => salvar(campo.chave)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </SakaiLayout>
  );
};

export default Configuracoes;
