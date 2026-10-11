/**
 * Tipos compartidos del catálogo de endpoints.
 * Este archivo lo consumen tanto el frontend (web) como el backend (server).
 */

export type ParamType = "string" | "number" | "boolean" | "array" | "file";

export interface Param {
  name: string;
  /** Dónde viaja el parámetro */
  in: "query" | "body" | "file";
  type: ParamType;
  required?: boolean;
  default?: string | number | boolean;
  enum?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  /** Para parámetros de tipo file */
  accept?: string;
  maxSizeMB?: number;
  maxCount?: number;
  description: string;
}

export type EndpointStatus = "available" | "credentials" | "unavailable";

export type ResponseType = "json" | "image" | "audio" | "video" | "zip";

export interface Endpoint {
  id: string;
  /** Nombre corto mostrado en la lista (p. ej. "brat") */
  name: string;
  category: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  params: Param[];
  /** Estado esperado según la configuración por defecto */
  status: EndpointStatus;
  /** Variables de entorno necesarias (si faltan → status "credentials") */
  requiresEnv?: string[];
  /** Servicio externo necesario (si falta → no disponible con explicación) */
  requiresService?: "ffmpeg" | "yt-dlp" | "red";
  /** Motivo por el que no está implementado (status "unavailable") */
  unavailableReason?: string;
  responseType: ResponseType;
  /** Ejemplo de solicitud (ruta + query) */
  exampleRequest: string;
  /** Ejemplo de respuesta JSON (solo cuando responseType === "json") */
  exampleResponse?: unknown;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface RuntimeEndpointInfo {
  id: string;
  status: EndpointStatus;
  missing?: string[];
  reason?: string;
}
