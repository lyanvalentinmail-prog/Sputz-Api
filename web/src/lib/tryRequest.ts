import type { Endpoint, Param } from "@shared/types";
import { API_BASE } from "./apiBase";

export type FormValue = string | boolean | number | undefined;
export type FormValues = Record<string, FormValue>;
export type FormFiles = Record<string, File[]>;

export interface TryResult {
  ok: boolean;
  httpStatus: number;
  timeMs: number;
  contentType: string;
  /** Cuerpo JSON parseado (si la respuesta es JSON) */
  json?: unknown;
  /** Texto plano de error si JSON no aplica */
  text?: string;
  /** URL de objeto para respuestas binarias (imagen/audio/zip) */
  blobUrl?: string;
  blobSize?: number;
  /** Error de red (sin respuesta HTTP) */
  networkError?: string;
}

export function fileParams(ep: Endpoint): Param[] {
  return ep.params.filter((p) => p.type === "file");
}

export function valueParams(ep: Endpoint): Param[] {
  return ep.params.filter((p) => p.type !== "file");
}

/** Construye la URL con los parámetros de query rellenos (para ejemplos y peticiones GET). */
export function buildRequestUrl(ep: Endpoint, values: FormValues): string {
  const qs = new URLSearchParams();
  for (const param of ep.params) {
    if (param.type === "file") continue;
    const v = values[param.name];
    const include = ep.method === "GET" ? param.in === "query" : param.in === "query";
    if (include && v !== undefined && v !== "") qs.set(param.name, String(v));
  }
  const q = qs.toString();
  return q ? `${ep.path}?${q}` : ep.path;
}

/** Cuerpo JSON para POST con parámetros in:"body" (solo si no hay archivos). */
export function buildJsonBody(ep: Endpoint, values: FormValues): Record<string, unknown> | null {
  const body: Record<string, unknown> = {};
  for (const param of ep.params) {
    if (param.type === "file" || param.in !== "body") continue;
    const v = values[param.name];
    if (v !== undefined && v !== "") body[param.name] = v;
  }
  return Object.keys(body).length ? body : null;
}

/** Ejecuta la solicitud de prueba y mide el tiempo de respuesta. */
export async function tryEndpoint(ep: Endpoint, values: FormValues, files: FormFiles): Promise<TryResult> {
  const started = performance.now();
  const hasFiles = Object.values(files).some((list) => list.length > 0);

  let init: RequestInit;
  let url: string;

  if (ep.method === "GET") {
    url = buildRequestUrl(ep, values);
    init = { method: "GET" };
  } else if (hasFiles) {
    const form = new FormData();
    for (const param of fileParams(ep)) {
      for (const file of files[param.name] ?? []) form.append(param.name, file);
    }
    for (const param of valueParams(ep)) {
      const v = values[param.name];
      if (v !== undefined && v !== "") form.set(param.name, String(v));
    }
    url = ep.path;
    init = { method: "POST", body: form };
  } else {
    const body = buildJsonBody(ep, values);
    url = buildRequestUrl(ep, values);
    init = body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : { method: "POST" };
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, init);
    const timeMs = Math.round(performance.now() - started);
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    if (contentType.includes("application/json")) {
      const text = await res.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        return { ok: res.ok, httpStatus: res.status, timeMs, contentType, text };
      }
      return { ok: res.ok, httpStatus: res.status, timeMs, contentType, json };
    }
    const blob = await res.blob();
    return {
      ok: res.ok,
      httpStatus: res.status,
      timeMs,
      contentType,
      blobUrl: URL.createObjectURL(blob),
      blobSize: blob.size,
      text: blob.size === 0 ? "(respuesta vacía)" : undefined
    };
  } catch (err) {
    return {
      ok: false,
      httpStatus: 0,
      timeMs: Math.round(performance.now() - started),
      contentType: "",
      networkError: err instanceof Error ? err.message : "Error de red desconocido"
    };
  }
}
