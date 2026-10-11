import { Router } from "express";
import multer from "multer";
import { CATEGORIES, ENDPOINTS, API_VERSION } from "../../shared/catalog";
import type { Endpoint, Param, RuntimeEndpointInfo } from "../../shared/types";
import { config, envMissing } from "./config";
import { HANDLERS, type Ctx } from "./handlers";
import { ApiError, badRequest, credMissing, notImplemented, serviceMissing } from "./lib/errors";
import { fail, ok, toApiError } from "./lib/respond";
import { ffmpegAvailable } from "./lib/ffmpeg";
import { ytdlpAvailable } from "./lib/ytdlp";
import { effectiveMime } from "./lib/sniff";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadMB * 1024 * 1024, files: 10, fields: 30 }
});

/** Disponibilidad en tiempo real de un endpoint según entorno y servicios. */
export async function runtimeInfo(ep: Endpoint): Promise<RuntimeEndpointInfo> {
  if (ep.status === "unavailable" || !HANDLERS[ep.id]) {
    return { id: ep.id, status: "unavailable", reason: ep.unavailableReason || "Este endpoint todavía no está implementado en el servidor." };
  }
  const missing: string[] = [];
  if (ep.requiresEnv?.length) missing.push(...envMissing(ep.requiresEnv));
  if (ep.requiresService === "ffmpeg" && !ffmpegAvailable()) missing.push("ffmpeg");
  if (ep.requiresService === "yt-dlp" && !(await ytdlpAvailable())) missing.push("yt-dlp");
  if (missing.length) {
    return {
      id: ep.id,
      status: "credentials",
      missing,
      reason: `Falta configurar: ${missing.join(", ")}. Añádelo al .env del servidor o instala el servicio.`
    };
  }
  return { id: ep.id, status: "available" };
}

/** Valida y normaliza los parámetros de una solicitud según el catálogo. */
function validateParams(ep: Endpoint, req: Ctx["req"]): Record<string, string | number | boolean | undefined> {
  const out: Record<string, string | number | boolean | undefined> = {};
  const rawBody = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  for (const param of ep.params) {
    if (param.type === "file") continue;
    let raw: unknown;
    if (ep.method === "GET" || param.in === "query") {
      raw = req.query[param.name] ?? rawBody[param.name];
    } else {
      raw = rawBody[param.name] ?? req.query[param.name];
    }
    if (raw === undefined || raw === "") {
      if (param.default !== undefined) {
        out[param.name] = param.default;
        continue;
      }
      if (param.required) throw badRequest(`El parámetro «${param.name}» es obligatorio`);
      continue;
    }
    switch (param.type) {
      case "number": {
        const n = Number(raw);
        if (!Number.isFinite(n)) throw badRequest(`El parámetro «${param.name}» debe ser un número`);
        if (param.min !== undefined && n < param.min) throw badRequest(`«${param.name}» debe ser ≥ ${param.min}`);
        if (param.max !== undefined && n > param.max) throw badRequest(`«${param.name}» debe ser ≤ ${param.max}`);
        out[param.name] = n;
        break;
      }
      case "boolean": {
        const s = String(raw).toLowerCase();
        if (!["true", "false", "1", "0"].includes(s)) throw badRequest(`El parámetro «${param.name}» debe ser true o false`);
        out[param.name] = s === "true" || s === "1";
        break;
      }
      case "array": {
        const arr = Array.isArray(raw) ? raw.map(String) : String(raw).split(",").map((v) => v.trim()).filter(Boolean);
        out[param.name] = arr.join(",");
        break;
      }
      default: {
        const s = String(raw);
        if (param.maxLength && s.length > param.maxLength) throw badRequest(`«${param.name}» supera la longitud máxima de ${param.maxLength} caracteres`);
        if (param.enum && !param.enum.includes(s)) throw badRequest(`«${param.name}» debe ser uno de: ${param.enum.join(", ")}`);
        out[param.name] = s;
      }
    }
  }
  return out;
}

/** Valida los archivos subidos contra los parámetros de tipo file del catálogo. */
function validateFiles(ep: Endpoint, files: Express.Multer.File[]): Record<string, Express.Multer.File[]> {
  const grouped: Record<string, Express.Multer.File[]> = {};
  for (const f of files) (grouped[f.fieldname] ||= []).push(f);
  const fileParams: Param[] = ep.params.filter((p) => p.type === "file");
  if (files.length && !fileParams.length) throw badRequest("Este endpoint no admite archivos");
  for (const fp of fileParams) {
    const list = grouped[fp.name] || [];
    if (fp.required && !list.length) throw badRequest(`Debes subir un archivo en el campo «${fp.name}»`);
    if (fp.maxCount && list.length > fp.maxCount) throw badRequest(`El campo «${fp.name}» admite como máximo ${fp.maxCount} archivo(s)`);
    for (const f of list) {
      if (fp.maxSizeMB && f.size > fp.maxSizeMB * 1024 * 1024) throw new ApiError(413, `El archivo «${f.originalname}» supera el límite de ${fp.maxSizeMB} MB`);
      if (fp.accept && fp.accept !== "*/*") {
        const accepts = fp.accept.split(",").map((a) => a.trim());
        // Si el cliente envía un MIME genérico, se detecta el formato real por bytes mágicos
        const mime = effectiveMime(f.mimetype, f.buffer);
        const allowed = accepts.some((a) => (a.endsWith("/*") ? mime.startsWith(a.slice(0, -1)) : a === mime));
        if (!allowed) throw badRequest(`Formato no compatible en «${fp.name}» (${mime}). Formatos admitidos: ${fp.accept}`);
      }
    }
  }
  return grouped;
}

export function buildRouter(): Router {
  const router = Router();

  // ─── Metadatos de la API ───
  router.get("/api/meta/status", (_req, res) => {
    ok(res, {
      name: config.apiName,
      version: API_VERSION,
      uptime: Math.floor(process.uptime()),
      endpoints: ENDPOINTS.length,
      categories: CATEGORIES.length
    });
  });

  router.get("/api/meta/endpoints", async (_req, res) => {
    const infos = await Promise.all(ENDPOINTS.map(runtimeInfo));
    ok(res, {
      name: config.apiName,
      version: API_VERSION,
      categories: CATEGORIES,
      endpoints: ENDPOINTS.map((ep) => ({ ...ep, runtime: infos.find((i) => i.id === ep.id) }))
    });
  });

  // ─── Rutas de endpoints generadas desde el catálogo ───
  for (const ep of ENDPOINTS) {
    const method = ep.method === "GET" ? "get" : "post";
    router[method](ep.path, upload.any(), async (req, res) => {
      try {
        const info = await runtimeInfo(ep);
        if (info.status === "unavailable") throw notImplemented(info.reason || "no está implementado");
        if (info.status === "credentials" && info.missing?.length) {
          const envVars = info.missing.filter((m) => /^[A-Z0-9_]+$/.test(m));
          const services = info.missing.filter((m) => !/^[A-Z0-9_]+$/.test(m));
          if (services.length) throw serviceMissing(services.join(", "));
          throw credMissing(envVars);
        }
        const files = validateFiles(ep, (req.files as Express.Multer.File[]) || []);
        const params = validateParams(ep, req);
        const handler = HANDLERS[ep.id];
        if (!handler) throw notImplemented("el handler no está registrado en el servidor");
        await handler({ req, res, params, files } as Ctx);
      } catch (err) {
        const apiErr = toApiError(err);
        fail(res, apiErr.status, apiErr.message);
      }
    });
  }

  // 404 para rutas /api desconocidas
  router.use("/api", (req, res) => fail(res, 404, `La ruta ${req.method} ${req.path} no existe. Consulta /api/meta/endpoints.`));

  return router;
}
