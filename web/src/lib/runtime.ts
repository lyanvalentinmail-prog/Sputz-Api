import type { EndpointStatus, RuntimeEndpointInfo } from "@shared/types";
import { API_BASE } from "./apiBase";

export interface ApiStatus {
  name: string;
  version: string;
  uptime: number;
  endpoints: number;
  categories: number;
}

export interface RuntimeMap {
  [endpointId: string]: RuntimeEndpointInfo;
}

/** Estado del servicio (barra superior). Devuelve null si el backend no responde. */
export async function fetchApiStatus(): Promise<ApiStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/api/meta/status`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: ApiStatus };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/** Disponibilidad real calculada por el servidor (credenciales y servicios). */
export async function fetchRuntimeInfo(): Promise<RuntimeMap> {
  try {
    const res = await fetch(`${API_BASE}/api/meta/endpoints`);
    if (!res.ok) return {};
    const json = (await res.json()) as { data?: { endpoints?: Array<{ id: string; runtime?: RuntimeEndpointInfo }> } };
    const map: RuntimeMap = {};
    for (const ep of json.data?.endpoints ?? []) {
      if (ep.runtime) map[ep.id] = ep.runtime;
    }
    return map;
  } catch {
    return {};
  }
}

/** Estado efectivo: el runtime del servidor manda si existe. */
export function effectiveStatus(epId: string, fallback: EndpointStatus, runtime: RuntimeMap): EndpointStatus {
  return runtime[epId]?.status ?? fallback;
}
