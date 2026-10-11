import { ApiError, timeout, upstream } from "./errors";

/** fetch con tiempo de espera y manejo uniforme de errores. */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw timeout();
    throw new ApiError(502, `No se pudo contactar con el servicio externo (${describeNetError(err)}). Comprueba la conexión de red del servidor.`);
  } finally {
    clearTimeout(t);
  }
}

function describeNetError(err: unknown): string {
  if (err instanceof Error) {
    const cause = (err as NodeJS.ErrnoException).cause;
    if (cause && typeof cause === "object" && "code" in cause) return String((cause as { code: unknown }).code);
  }
  return "error de red";
}

/** fetch JSON con validación de estado. */
export async function fetchJson<T = unknown>(url: string, init: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const res = await fetchWithTimeout(url, init, timeoutMs);
  if (!res.ok) throw upstream(`El servicio externo respondió con HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Descarga un recurso binario con límite de tamaño. */
export async function fetchBuffer(url: string, maxBytes: number, timeoutMs = 15000): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetchWithTimeout(url, {}, timeoutMs);
  if (!res.ok) throw upstream(`No se pudo descargar el recurso (HTTP ${res.status})`);
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const lenHeader = res.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > maxBytes) throw new ApiError(413, `El recurso remoto supera el límite de ${Math.floor(maxBytes / 1024 / 1024)} MB`);
  const ab = await res.arrayBuffer();
  if (ab.byteLength > maxBytes) throw new ApiError(413, `El recurso remoto supera el límite de ${Math.floor(maxBytes / 1024 / 1024)} MB`);
  return { buffer: Buffer.from(ab), contentType };
}

/** Valida que una cadena sea una URL http(s) segura de usar. */
export function assertHttpUrl(value: string, field = "url"): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ApiError(400, `El parámetro «${field}» no es una URL válida`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiError(400, `El parámetro «${field}» debe ser una URL http o https`);
  }
  return parsed;
}
