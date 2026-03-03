/**
 * Retorna a URL completa da imagem.
 * Suporta URLs absolutas, paths do /storage, /uploads e casos legados.
 *
 * Regras principais:
 * - Se for http/https, data:, blob: -> retorna como está
 * - Se for path relativo -> assume /storage/produtos/...
 * - Se REACT_APP_BASE_URL_ESTOQUE tiver /api..., usa apenas o origin
 *
 * @param {string} url
 * @returns {string}
 */
const getImageSrc = (url) => {
    if (!url) return '';

    const cleaned = String(url).trim();
    if (!cleaned) return '';

    // previews do upload (frontend)
    if (cleaned.startsWith('blob:') || cleaned.startsWith('data:')) {
        return cleaned;
    }

    // URL absoluta
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
        return cleaned;
    }

    // URL protocol-relative //cdn...
    if (cleaned.startsWith('//')) {
        const proto = typeof window !== 'undefined' ? window.location.protocol : 'https:';
        return `${proto}${cleaned}`;
    }

    const baseEnv = (process.env.REACT_APP_BASE_URL_ESTOQUE || '').trim();
    const base = resolveBaseOrigin(baseEnv); // origin-only, sem /api/...

    // Normaliza barras e tenta extrair a parte "/storage/..." se estiver no meio do caminho
    let path = normalizePath(cleaned);

    // Se vier algo como "public/storage/..." ou "app/storage/...", corta a partir de "/storage/"
    const storageIdx = path.toLowerCase().indexOf('/storage/');
    if (storageIdx > 0) {
        path = path.slice(storageIdx);
    }

    // 1) storage explícito
    if (startsWithOneOf(path, ['/storage', 'storage/'])) {
        path = ensureLeadingSlash(path);

        // Corrige duplicações: /storage/produtos/produtos/... -> /storage/produtos/...
        path = path.replace(/^\/storage\/(produtos\/)+/i, '/storage/produtos/');

        // Corrige /storage/storage/... -> /storage/...
        path = path.replace(/^\/storage\/storage\//i, '/storage/');

        return base ? joinUrl(base, path) : path;
    }

    // 2) uploads legado (se existir no sistema)
    if (
        startsWithOneOf(path, ['/uploads', 'uploads/']) ||
        path.toLowerCase().includes('/uploads/')
    ) {
        path = ensureLeadingSlash(path);
        return base ? joinUrl(base, path) : path;
    }

    // 3) Casos legados/relativos:
    // - "produtos/variacoes/x.jpg"
    // - "variacoes/x.jpg"
    // - "x.jpg"
    //
    // Normaliza pra sempre cair em /storage/produtos/<...>
    const normalized = normalizePath(path)
        .replace(/^\/+/, '')
        .replace(/^(produtos\/)+/i, ''); // remove prefixos repetidos "produtos/"

    let legacy = `/storage/produtos/${normalized}`;
    legacy = legacy.replace(/^\/storage\/(produtos\/)+/i, '/storage/produtos/'); // garante sem duplicação

    return base ? joinUrl(base, legacy) : legacy;
};

/** Retorna apenas o origin (sem /api/...), quando possível. */
function resolveBaseOrigin(baseEnv) {
    if (!baseEnv) return '';

    const trimmed = baseEnv.replace(/\/+$/, '');

    // Se base for absoluta, pega origin (evita /api/v1 no meio)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
            return new URL(trimmed).origin;
        } catch {
            return trimmed;
        }
    }

    // Se base for relativa (ex: "/api" ou ""), não dá pra extrair origin.
    // Nesse caso, retorna como está (sem barra final).
    return trimmed;
}

function normalizePath(p) {
    return String(p || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/\/{2,}/g, '/');
}

function ensureLeadingSlash(p) {
    return p.startsWith('/') ? p : `/${p}`;
}

function startsWithOneOf(value, prefixes) {
    const v = String(value || '');
    return prefixes.some((pref) => v.startsWith(pref));
}

function joinUrl(base, path) {
    const b = String(base || '').replace(/\/+$/, '');
    const p = String(path || '').startsWith('/') ? path : `/${path}`;
    return `${b}${p}`;
}

export default getImageSrc;
