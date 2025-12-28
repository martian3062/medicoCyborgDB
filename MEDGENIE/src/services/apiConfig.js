// src/services/apiConfig.js
// Central API helper for MedGenie frontend
// ✅ Works with Vite proxy by default (/api -> http://127.0.0.1:8000)
// ✅ Supports optional VITE_API_BASE_URL for direct backend URL

const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim()
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : "/";

export const API_BASE_URL = RAW_BASE === "/" ? "/" : RAW_BASE.replace(/\/$/, "");

// Normalize common wrong path(s)
function normalizePath(path) {
  let p = path.startsWith("/") ? path : `/${path}`;

  // ✅ Auto-fix old route mistakes
  if (p === "/api/chat/" || p === "/api/chat") p = "/api/ai/chat/";
  if (p.startsWith("/api/chat/")) p = p.replace("/api/chat/", "/api/ai/chat/");

  return p;
}

// Build full URL safely
export function buildUrl(path) {
  const p = normalizePath(path);

  // If base is "/", keep it relative (good for Vite proxy)
  if (API_BASE_URL === "/") return p;

  return `${API_BASE_URL}${p}`;
}

async function parseResponse(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  return await res.text();
}

// Generic fetch wrapper with timeout + clean error messages
export async function apiFetch(path, opts = {}) {
  const { method = "GET", headers = {}, body, timeoutMs = 30000, signal } = opts;

  const url = buildUrl(path);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    const res = await fetch(url, {
      method,
      headers: {
        // ✅ Only set JSON content-type when body is NOT FormData
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isFormData
          ? body
          : JSON.stringify(body),
      signal: signal || controller.signal,
      credentials: "same-origin",
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      const msg =
        (data &&
          typeof data === "object" &&
          (data.error || data.detail || data.message)) ||
        (typeof data === "string" ? data : null) ||
        `HTTP ${res.status}`;

      const err = new Error(`${msg} (status ${res.status})`);
      err.status = res.status;
      err.data = data;
      err.url = url;
      throw err;
    }

    return data;
  } catch (e) {
    // Improve abort error message
    if (e?.name === "AbortError") {
      const err = new Error(`Request timed out after ${timeoutMs}ms`);
      err.status = 408;
      err.url = url;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ✅ Endpoints (match your Django urls.py)
export const endpoints = {
  aiChat: "/api/ai/chat/",
  climateForecast: "/api/climate/forecast/",

  cyborgIndex: "/api/cyborg/index/",
  cyborgSearch: "/api/cyborg/search/",
  cyborgAsk: "/api/cyborg/ask/",
  cyborgSeedOpen: "/api/cyborg/seed/",

  getRecords: "/api/records/",
  uploadRecord: "/api/records/upload/",
};

// ✅ High-level API your components can call
export const api = {
  aiChat: (message, model = "qwen/qwen3-32b") =>
    apiFetch(endpoints.aiChat, {
      method: "POST",
      body: { message, model },
    }),

  climateForecast: (location, weather = {}) =>
    apiFetch(endpoints.climateForecast, {
      method: "POST",
      body: { location, weather },
    }),

  cyborgIndex: (text, metadata = {}) =>
    apiFetch(endpoints.cyborgIndex, {
      method: "POST",
      body: { text, metadata },
    }),

  cyborgSeedOpen: () =>
    apiFetch(endpoints.cyborgSeedOpen, {
      method: "POST",
      body: {},
    }),

  cyborgSearch: (query, top_k = 5, filters = undefined) =>
    apiFetch(endpoints.cyborgSearch, {
      method: "POST",
      body: { query, top_k, ...(filters ? { filters } : {}) },
    }),

  cyborgAsk: (question, top_k = 5, model = "qwen/qwen3-32b") =>
    apiFetch(endpoints.cyborgAsk, {
      method: "POST",
      body: { question, top_k, model },
    }),

  getRecords: () => apiFetch(endpoints.getRecords),

  uploadRecord: (payload = {}) =>
    apiFetch(endpoints.uploadRecord, {
      method: "POST",
      body: payload,
    }),
};
