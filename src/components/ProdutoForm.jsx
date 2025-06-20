import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import apiEstoque from '../services/apiEstoque';
import OutletFormDialog from './OutletFormDialog';

const ProdutoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const backendUrl = process.env.REACT_APP_BASE_URL_ESTOQUE;
  const productImagesFolder = process.env.REACT_APP_PRODUCT_IMAGES_FOLDER || 'uploads/produtos';

  const [idCategoria, setIdCategoria] = useState(
    initialData.categoria ? initialData.categoria : initialData.id_categoria || null
  );
  const [nome, setNome] = useState(initialData.nome || '');
  const [descricao, setDescricao] = useState(initialData.descricao || '');
  const [fabricante, setFabricante] = useState(initialData.fabricante || '');
  const [ativo, setAtivo] = useState(
    initialData.ativo !== undefined
      ? (initialData.ativo === true || initialData.ativo === 1 || initialData.ativo === '1')
      : true
  );
  const [categorias, setCategorias] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData.imagens || []);
  const [loading, setLoading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [variacoes, setVariacoes] = useState(initialData.variacoes || [
    { nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }
  ]);
  const [showOutletDialog, setShowOutletDialog] = useState(false);
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);

  const toastRef = useRef(null);
  const fileUploadRef = useRef(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await apiEstoque.get('/categorias');
        setCategorias(response.data);
      } catch (error) {
        toastRef.current.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar categorias',
          life: 3000
        });
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (categorias.length > 0 && typeof idCategoria === 'number') {
      const catObj = categorias.find((c) => c.id === idCategoria);
      if (catObj) setIdCategoria(catObj);
    }
  }, [categorias, idCategoria]);

  const abrirDialogOutlet = (variacao) => {
    setVariacaoSelecionada(variacao);
    setShowOutletDialog(true);
  };

  const atualizarVariacoes = async () => {
    if (!variacaoSelecionada?.id) return;

    try {
      const response = await apiEstoque.get(`/variacoes/${variacaoSelecionada.id}`);
      const nova = response.data;

      const novas = [...variacoes];
      const index = novas.findIndex((v) => v.id === nova.id);
      if (index !== -1) {
        novas[index] = { ...novas[index], ...nova };
        setVariacoes(novas);
      }

      toastRef.current.show({
        severity: 'success',
        summary: 'Outlet atualizado',
        detail: 'Os dados da variação foram atualizados.',
        life: 3000
      });
    } catch (error) {
      toastRef.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível atualizar a variação.',
        life: 3000
      });
    }
  };


  const addVariacao = () => {
    setVariacoes([...variacoes, { nome: '', preco: '', custo: '', referencia: '', codigo_barras: '', atributos: [] }]);
  };

  const updateVariacao = (index, field, value) => {
    const novas = [...variacoes];
    novas[index][field] = value;
    setVariacoes(novas);
  };

  const updateAtributo = (varIndex, attrIndex, field, value) => {
    const novas = [...variacoes];
    novas[varIndex].atributos[attrIndex][field] = value;
    setVariacoes(novas);
  };

  const addAtributo = (varIndex) => {
    const novas = [...variacoes];
    novas[varIndex].atributos.push({ atributo: '', valor: '' });
    setVariacoes(novas);
  };

  const confirmDelete = (imageOrFile) => {
    const isExistingImage = imageOrFile && imageOrFile.id;
    confirmDialog({
      message: isExistingImage
        ? 'Tem certeza que deseja excluir esta imagem?'
        : 'Tem certeza que deseja remover este arquivo da seleção?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        if (isExistingImage) {
          handleDeleteImage(imageOrFile.id);
        }
      }
    });
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await apiEstoque.delete(`/produtos/${initialData.id}/imagens/${imageId}`);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
      toastRef.current.show({
        severity: 'success', summary: 'Sucesso', detail: 'Imagem removida', life: 3000
      });
    } catch (error) {
      toastRef.current.show({
        severity: 'error', summary: 'Erro', detail: 'Erro ao remover imagem', life: 3000
      });
    }
  };

  const uploadHandler = async (event) => {
    const validFiles = event.files.filter(file => file.type && file.type.startsWith('image/'));
    if (validFiles.length !== event.files.length) {
      if (fileUploadRef?.current) fileUploadRef.current.clear();
      return;
    }

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('principal', false);

      try {
        const response = await apiEstoque.post(
          `/produtos/${initialData.id}/imagens`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setExistingImages(prev => [...prev, response.data]);
        toastRef.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Imagem enviada', life: 3000 });
      } catch (error) {
        toastRef.current.show({ severity: 'error', summary: 'Erro', detail: 'Erro no upload', life: 3000 });
      }
    }
    if (fileUploadRef?.current) fileUploadRef.current.clear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        nome, descricao,
        id_categoria: idCategoria?.id || null,
        ativo, fabricante,
        variacoes
      };
      await onSubmit(productData);
    } catch (error) {
      toastRef.current.show({
        severity: 'error', summary: 'Erro', detail: 'Erro ao salvar produto', life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarMotivo = (motivo) => {
    const mapa = {
      tempo_estoque: 'Tempo em estoque',
      saiu_linha: 'Saiu de linha',
      avariado: 'Avariado',
      devolvido: 'Devolvido',
      exposicao: 'Exposição em loja',
      embalagem_danificada: 'Embalagem danificada',
      baixa_rotatividade: 'Baixa rotatividade',
      erro_cadastro: 'Erro de cadastro',
      excedente: 'Excedente',
      promocao_pontual: 'Promoção pontual',
    };
    return mapa[motivo] || motivo;
  };


  return (
    <>
      <Toast ref={toastRef} position="top-center" />
      <ConfirmDialog />
      <form onSubmit={handleSubmit} className="p-fluid">
        <div className="formgrid grid">
          <div className="field md:col-8">
            <label htmlFor="nome">Nome</label>
            <InputText id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="field md:col-4">
            <label htmlFor="categoria">Categoria</label>
            <Dropdown id="categoria" value={idCategoria} options={categorias} onChange={(e) => setIdCategoria(e.value)} optionLabel="nome" placeholder="Selecione a categoria" />
          </div>
          <div className="field col-12">
            <label htmlFor="descricao">Descrição</label>
            <InputTextarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
          </div>
          <div className="field col-12 md:col-8">
            <label htmlFor="fabricante">Fabricante</label>
            <InputText id="fabricante" value={fabricante} onChange={(e) => setFabricante(e.target.value)} />
          </div>
          <div className="field col-12 md:col-4">
            <label htmlFor="ativo">Ativo</label>
            <InputSwitch id="ativo" checked={ativo} onChange={(e) => setAtivo(e.value)} />
          </div>

          <div className="field col-12">
            <h4>Variações do Produto</h4>
            <p className="text-sm text-color-secondary mb-3">
              Um mesmo móvel pode ter diferentes variações, como <strong>cor</strong>, <strong>acabamento</strong> ou <strong>material</strong> (ex: "Mesa Retangular - Madeira Clara"). Cada variação pode ter um preço e código de barras distintos.
            </p>

            {variacoes.map((v, i) => (
              <div key={i} className="p-fluid p-3 mb-4 border-round surface-border border-1">
                <div className="formgrid grid align-items-start">
                  <div className="field col-12 mt-2">
                    <div className="flex flex-wrap align-items-center gap-2 mb-2">
                      {v.outlets?.map((o, index) => (
                        <Tag
                          key={index}
                          value={`${o.quantidade} unid • ${o.percentual_desconto}% • ${formatarMotivo(o.motivo)}`}
                          severity="warning"
                          className="text-sm px-3 py-2 border-round"
                        />
                      ))}
                    </div>

                    {v.estoque?.quantidade > (v.outlets?.reduce((s, o) => s + (o.quantidade || 0), 0)) && (
                      <Button
                        label="Adicionar Outlet"
                        icon="pi pi-plus"
                        className="p-button-sm p-button-warning w-full md:w-auto"
                        type="button"
                        onClick={() => abrirDialogOutlet(v)}
                        tooltip="Registrar mais unidades como outlet"
                      />
                    )}
                  </div>

                  <div className="field md:col-3">
                    <label>Preço</label>
                    <InputNumber
                      value={parseFloat(v.preco) || 0}
                      onValueChange={(e) => updateVariacao(i, 'preco', e.value)}
                      mode="currency"
                      currency="BRL"
                      locale="pt-BR"
                      minFractionDigits={2}
                      maxFractionDigits={2}
                    />
                  </div>
                  <div className="field md:col-3">
                    <label>Custo</label>
                    <InputNumber
                      value={parseFloat(v.custo) || 0}
                      onValueChange={(e) => updateVariacao(i, 'custo', e.value)}
                      mode="currency"
                      currency="BRL"
                      locale="pt-BR"
                      minFractionDigits={2}
                      maxFractionDigits={2}
                    />
                  </div>
                  <div className="field md:col-6">
                    <label>Referência</label>
                    <InputText value={v.referencia} onChange={(e) => updateVariacao(i, 'referencia', e.target.value)}/>
                  </div>
                  <div className="field md:col-5">
                    <label>Código de Barras</label>
                    <InputText value={v.codigo_barras}
                               onChange={(e) => updateVariacao(i, 'codigo_barras', e.target.value)}/>
                  </div>
                  <div className="field md:col-1 text-right">
                    <Button icon="pi pi-trash" className="p-button-rounded p-button-danger mt-4" type="button"
                            onClick={() => {
                              const novas = [...variacoes];
                              novas.splice(i, 1);
                              setVariacoes(novas);
                            }} tooltip="Remover Variação"/>
                  </div>

                </div>

                <h5 className="mt-3">Atributos</h5>
                <p className="text-sm text-color-secondary mb-2">
                  Use os atributos para detalhar esta variação. Exemplos: <strong>cor: nogueira</strong>, <strong>material:
                  MDF</strong>.
                </p>

                {v.atributos.map((attr, j) => (
                  <div key={j} className="formgrid grid align-items-center">
                    <div className="field md:col-5">
                      <InputText value={attr.atributo} placeholder="Atributo (ex: cor)"
                                 onChange={(e) => updateAtributo(i, j, 'atributo', e.target.value)}/>
                    </div>
                    <div className="field md:col-5">
                      <InputText value={attr.valor} placeholder="Valor (ex: nogueira)" onChange={(e) => updateAtributo(i, j, 'valor', e.target.value)} />
                    </div>
                    <div className="field md:col-2 text-right">
                      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" type="button" onClick={() => {
                        const novas = [...variacoes];
                        novas[i].atributos.splice(j, 1);
                        setVariacoes(novas);
                      }} tooltip="Remover Atributo" />
                    </div>
                  </div>
                ))}

                <Button type="button" label="Adicionar Atributo" icon="pi pi-plus" onClick={() => addAtributo(i)} className="p-button-sm mt-2" />
              </div>
            ))}
            <Button type="button" label="Adicionar Variação" icon="pi pi-plus" className="p-button-secondary mt-2" onClick={addVariacao} />
          </div>


          {initialData.id && (
            <div className="field col-12">
              <h4>Imagens do Produto</h4>

              <p className="text-sm text-color-secondary mb-2">
                As imagens são compartilhadas entre todas as variações do produto. Envie imagens que representem bem o
                item.
              </p>

              <div style={{display: 'flex', flexWrap: 'wrap'}} className="col-12">
                {existingImages.map((img) => (
                  <div key={img.id} style={{margin: '0.5rem', position: 'relative'}}>
                    <img src={`${backendUrl}/${productImagesFolder}/${img.url}`} alt="produto"
                         style={{width: '100px', height: '100px', objectFit: 'cover'}}/>
                    <Button type="button" icon="pi pi-times" className="p-button-rounded p-button-danger"
                            onClick={() => confirmDelete(img)}/>
                  </div>
                ))}
              </div>
              <FileUpload
                ref={fileUploadRef}
                name="files"
                customUpload
                auto
                uploadHandler={uploadHandler}
                multiple
                accept="image/*"
                maxFileSize={2097152}
              />

              <div className="mt-3">
                <span className="block mb-1">Espaço ocupado:</span>
                <ProgressBar value={(totalSize / 2097152) * 100} showValue={false} style={{height: '10px'}}/>
                <Tag value={`${(totalSize / 1024).toFixed(1)} KB`} severity="info" className="mt-2"/>
              </div>
            </div>
          )}

          <div className="field col-12 flex justify-content-end">
            <Button label="Salvar" type="submit" icon="pi pi-check" loading={loading} className="mr-2"/>
            <Button label="Cancelar" type="button" icon="pi pi-times" className="p-button-secondary"
                    onClick={onCancel}/>
          </div>
        </div>
      </form>

      <OutletFormDialog
        visible={showOutletDialog}
        onHide={() => setShowOutletDialog(false)}
        variacao={variacaoSelecionada}
        onSuccess={atualizarVariacoes}
      />

    </>
  );
};

export default ProdutoForm;
