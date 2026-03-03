import apiEstoque from './apiEstoque';
import { ESTOQUE_ENDPOINTS } from '../constants/endpointsEstoque';

const ensureFormData = (payload) => {
    if (payload instanceof FormData) return payload;

    if (payload instanceof File) {
        const fd = new FormData();
        fd.append('imagem', payload);
        return fd;
    }

    if (payload && payload.imagem instanceof File) {
        const fd = new FormData();
        fd.append('imagem', payload.imagem);
        return fd;
    }

    const fd = new FormData();
    if (payload && typeof payload === 'object') {
        Object.entries(payload).forEach(([k, v]) => {
            if (v !== undefined && v !== null) fd.append(k, v);
        });
    }
    return fd;
};

const multipartConfig = {
    headers: { 'Content-Type': 'multipart/form-data' },
};

export const obterImagemVariacao = (variacaoId) =>
    apiEstoque.get(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId));

export const salvarImagemVariacao = (variacaoId, payload) =>
    apiEstoque.post(
        ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId),
        ensureFormData(payload),
        multipartConfig
    );

export const atualizarImagemVariacao = (variacaoId, payload) =>
    apiEstoque.put(
        ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId),
        ensureFormData(payload),
        multipartConfig
    );

export const removerImagemVariacao = (variacaoId) =>
    apiEstoque.delete(ESTOQUE_ENDPOINTS.variacoes.imagem(variacaoId));
