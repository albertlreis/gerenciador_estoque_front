import React, { useEffect, useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';

const Configuracoes = () => {
  const toast = useRef(null);
  const [configuracoes, setConfiguracoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    apiEstoque.get('/configuracoes').then(({ data }) => {
      const parsed = data.map(c => ({
        ...c,
        valor:
          c.tipo === 'boolean' ? c.valor === 'true' :
            c.tipo === 'number' ? Number(c.valor) :
              c.valor
      }));
      setConfiguracoes(parsed);
      setCarregando(false);
    });
  }, []);

  const atualizarValor = (chave, valor) => {
    setConfiguracoes(prev =>
      prev.map(c => (c.chave === chave ? { ...c, valor } : c))
    );
  };

  const salvar = async (conf) => {
    try {
      await apiEstoque.put(`/configuracoes/${conf.chave}`, {
        valor: conf.valor.toString(),
      });
      toast.current.show({
        severity: 'success',
        summary: 'Salvo com sucesso',
        detail: `${conf.label || conf.chave} atualizado.`,
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} />
      <div className="p-4">
        <h2>Configurações do Sistema</h2>
        <Divider />
        <div className="flex flex-column gap-4">
          {carregando ? (
            <p>Carregando...</p>
          ) : configuracoes.map((conf) => (
            <div key={conf.chave} className="flex align-items-center gap-3">
              <label style={{ width: 400 }}>{conf.label || conf.chave}:</label>

              {conf.tipo === 'number' && (
                <InputNumber
                  value={conf.valor}
                  onValueChange={(e) => atualizarValor(conf.chave, e.value)}
                  inputStyle={{ width: '150px' }}
                />
              )}

              {conf.tipo === 'boolean' && (
                <InputSwitch
                  checked={conf.valor}
                  onChange={(e) => atualizarValor(conf.chave, e.value)}
                />
              )}

              {conf.tipo === 'string' && (
                <InputText
                  value={conf.valor}
                  onChange={(e) => atualizarValor(conf.chave, e.target.value)}
                  style={{ width: '250px' }}
                />
              )}

              <Button
                icon="pi pi-save"
                label="Salvar"
                onClick={() => salvar(conf)}
              />
            </div>
          ))}
        </div>
      </div>
    </SakaiLayout>
  );
};

export default Configuracoes;
