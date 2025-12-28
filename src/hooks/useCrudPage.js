import { useCallback, useMemo, useRef, useState } from 'react';
import { confirmPopup } from 'primereact/confirmpopup';

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.dados?.results)) return payload.dados.results;
  return [];
}

function normalizeItem(payload) {
  if (!payload) return null;
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) return payload.data;
  return payload;
}

const resolveUrl = (value, ...args) => (typeof value === 'function' ? value(...args) : value);

export function useCrudPage({ api, resourceSingular, endpoints }) {
  const toastRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const dialogTitle = useMemo(
    () => (editing ? `Editar ${resourceSingular}` : `Cadastrar ${resourceSingular}`),
    [editing, resourceSingular]
  );

  const toast = useMemo(() => {
    const show = (severity, summary, detail) =>
      toastRef.current?.show?.({ severity, summary, detail, life: 3000 });

    return {
      success: (detail, summary = 'Sucesso') => show('success', summary, detail),
      error: (detail, summary = 'Erro') => show('error', summary, detail),
      warn: (detail, summary = 'Atenção') => show('warn', summary, detail),
    };
  }, []);

  const reload = useCallback(async () => {
    setLoadingList(true);
    try {
      const url = resolveUrl(endpoints.list);
      const res = await api.get(url);
      setItems(normalizeList(res.data));
    } catch (err) {
      console.error(err);
      toast.error(`Erro ao carregar ${resourceSingular.toLowerCase()}s`);
    } finally {
      setLoadingList(false);
    }
  }, [api, endpoints.list, resourceSingular, toast]);

  const openNew = useCallback(() => {
    setEditing(null);
    setVisible(true);
  }, []);

  const openEdit = useCallback((row) => {
    setEditing(row);
    setVisible(true);
  }, []);

  const closeDialog = useCallback(() => {
    setVisible(false);
    setEditing(null);
  }, []);

  const save = useCallback(
    async (data) => {
      setSaving(true);
      try {
        if (editing?.id) {
          const url = resolveUrl(endpoints.update, editing.id);
          const res = await api.put(url, data);
          const updated = normalizeItem(res.data);

          if (updated?.id) {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          } else {
            await reload();
          }

          toast.success(`${resourceSingular} atualizado`);
        } else {
          const url = resolveUrl(endpoints.create);
          const res = await api.post(url, data);
          const created = normalizeItem(res.data);

          if (created?.id) {
            setItems((prev) => [...prev, created]);
          } else {
            await reload();
          }

          toast.success(`${resourceSingular} criado`);
        }

        closeDialog();
      } catch (err) {
        console.error(err);
        toast.error(`Erro ao salvar ${resourceSingular.toLowerCase()}`);
      } finally {
        setSaving(false);
      }
    },
    [api, closeDialog, editing, endpoints.create, endpoints.update, reload, resourceSingular, toast]
  );

  const confirmDelete = useCallback(
    (event, id) => {
      if (!id) return;

      confirmPopup({
        target: event.currentTarget,
        message: `Tem certeza que deseja excluir este ${resourceSingular.toLowerCase()}?`,
        icon: 'pi pi-exclamation-triangle',
        defaultFocus: 'accept',
        accept: async () => {
          try {
            const url = resolveUrl(endpoints.remove, id);
            await api.delete(url);
            setItems((prev) => prev.filter((i) => i.id !== id));
            toast.success(`${resourceSingular} excluído`);
          } catch (err) {
            console.error(err);
            toast.error(`Erro ao excluir ${resourceSingular.toLowerCase()}`);
          }
        },
        reject: () => toast.warn('Operação cancelada'),
      });
    },
    [api, endpoints.remove, resourceSingular, toast]
  );

  return {
    toastRef,
    items,
    loadingList,
    saving,
    visible,
    editing,
    dialogTitle,
    reload,
    openNew,
    openEdit,
    closeDialog,
    save,
    confirmDelete,
  };
}
