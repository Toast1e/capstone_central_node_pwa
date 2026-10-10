// Small fetch helper so every page talks to the backend the same way.
// Set NEXT_PUBLIC_API_URL in .env.local for local development. In production,
// leave it unset so NGINX serves the app and /api from the same origin.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request(path, params, options = {}) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const response = await fetch(`${BASE}${path}${query}`, options);
    if (!response.ok) {
        // FastAPI errors look like {"detail": "..."}
        let detail = response.statusText;
        try { detail = (await response.json()).detail ?? detail; } catch {}
        throw new Error(detail);
    }
    return response;
}

export async function apiGet(path, params) {
    return (await request(path, params)).json();
}

export async function apiPatch(path, body) {
    return (await request(path, null, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })).json();
}

// returns { blob, filename } so the caller can save it
export async function apiDownload(path, params) {
    const response = await request(path, params);
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? "download";
    return { blob: await response.blob(), filename };
}

export function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}