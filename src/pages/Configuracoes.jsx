import React, { useEffect, useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import SakaiLayout from '../layouts/SakaiLayout';
import apiEstoque from '../services/apiEstoque';

const Configuracoes = () => {
  const toast = useRef(null);
  const [configuracoes, setConfiguracoes] = useState([]);
  const [configOriginal, setConfigOriginal] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoChave, setSalvandoChave] = useState(null);
  const [salvandoTudo, setSalvandoTudo] = useState(false);

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
      setConfigOriginal(parsed);
      setCarregando(false);
    });
  }, []);

  const atualizarValor = (chave, valor) => {
    setConfiguracoes(prev =>
      prev.map(c => (c.chave === chave ? { ...c, valor } : c))
    );
  };

  const salvar = async (conf) => {
    setSalvandoChave(conf.chave);
    try {
      await apiEstoque.put(`/configuracoes/${conf.chave}`, {
        valor: conf.valor.toString(),
      });
      toast.current.show({
        severity: 'success',
        summary: 'Salvo',
        detail: `${conf.label || conf.chave} atualizado.`,
        life: 3000,
      });
      setConfigOriginal(prev =>
        prev.map(c => (c.chave === conf.chave ? { ...c, valor: conf.valor } : c))
      );
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.response?.data?.message || err.message,
        life: 5000,
      });
    }
    setSalvandoChave(null);
  };

  const salvarTodas = async () => {
    setSalvandoTudo(true);
    try {
      const alteradas = configuracoes.filter(conf => {
        const original = configOriginal.find(c => c.chave === conf.chave);
        return original?.valor !== conf.valor;
      });

      for (const conf of alteradas) {
        await apiEstoque.put(`/configuracoes/${conf.chave}`, {
          valor: conf.valor.toString(),
        });
      }

      toast.current.show({
        severity: 'success',
        summary: 'Configurações salvas',
        detail: `${alteradas.length} configuração(ões) atualizada(s).`,
      });
      setConfigOriginal([...configuracoes]);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Erro ao salvar',
        detail: err.message,
      });
    }
    setSalvandoTudo(false);
  };

  const grupos = {
    outlet: '🛍️ Configurações de Outlet',
    prazos: '⏱️ Prazos Padrão',
    estoque: '📦 Estoque e Logística',
    outros: '⚙️ Outras Configurações'
  };

  const identificarGrupo = (chave) => {
    if (chave.includes('outlet')) return 'outlet';
    if (chave.includes('prazo') || chave.includes('dias')) return 'prazos';
    if (chave.includes('estoque') || chave.includes('fabrica')) return 'estoque';
    return 'outros';
  };

  return (
    <SakaiLayout>
      <Toast ref={toast} position="top-right" />
      <div className="p-4 max-w-screen-md mx-auto">
        <h2 className="text-2xl font-semibold mb-2">Configurações do Sistema</h2>
        <p className="text-muted mb-4">Gerencie os parâmetros padrão utilizados na operação do sistema.</p>
        <Divider />
        {carregando ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <>
            {Object.entries(grupos).map(([grupoKey, grupoLabel]) => (
              <div key={grupoKey} className="mb-4">
                <h3 className="text-lg font-medium mb-3">{grupoLabel}</h3>
                <div className="flex flex-column gap-3">
                  {configuracoes
                    .filter((conf) => identificarGrupo(conf.chave) === grupoKey)
                    .map((conf) => {
                      const original = configOriginal.find(c => c.chave === conf.chave);
                      const alterado = original?.valor !== conf.valor;

                      return (
                        <div key={conf.chave} className={`flex flex-column md:flex-row md:align-items-center gap-2 flex-wrap p-2 border-1 border-round ${alterado ? 'border-yellow-400' : 'border-transparent'}`}>
                          <div className="w-full md:w-5">
                            <label htmlFor={conf.chave} title={conf.descricao || conf.chave} className="font-medium">
                              {conf.label || conf.chave}
                              {conf.descricao && (
                                <i className="pi pi-question-circle text-500 ml-2" title={conf.descricao}></i>
                              )}
                            </label>
                            {conf.descricao && (
                              <small className="text-gray-500 block">{conf.descricao}</small>
                            )}
                          </div>

                          <div className="w-full md:w-4">
                            {conf.tipo === 'number' || conf.tipo === 'integer' && (
                              <InputNumber
                                value={conf.valor}
                                onValueChange={(e) => atualizarValor(conf.chave, e.value)}
                                useGrouping={false}
                                placeholder="Digite um número"
                                inputStyle={{ width: '100%' }}
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
                                placeholder="Digite um valor"
                                style={{ width: '100%' }}
                              />
                            )}
                          </div>

                          <div>
                            <Button
                              icon={salvandoChave === conf.chave ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
                              label="Salvar"
                              className="p-button-sm"
                              disabled={salvandoChave === conf.chave || !alterado}
                              onClick={() => salvar(conf)}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <Divider className="my-3" />
              </div>
            ))}

            <div className="flex justify-content-end mt-4">
              <Button
                label="Salvar Tudo"
                icon={salvandoTudo ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                className="p-button-success"
                onClick={salvarTodas}
                disabled={salvandoTudo}
              />
            </div>
          </>
        )}
      </div>
    </SakaiLayout>
  );
};

export default Configuracoes;
