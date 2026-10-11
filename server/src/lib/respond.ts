import type { Response } from "express";
import { config } from "../config";
import { ApiError } from "./errors";

/** Respuesta JSON de éxito con envolvente común. */
export function ok(res: Response, data: unknown, status = 200): void {
  res.status(status).json({ status: true, creator: config.apiName, data });
}

/** Respuesta JSON de error con envolvente común. */
export function fail(res: Response, code: number, message: string): void {
  res.status(code).json({ status: false, creator: config.apiName, code, error: message });
}

/** Respuesta binaria (imagen, audio, zip…). */
export function binary(res: Response, contentType: string, body: Buffer, filename?: string): void {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=3600");
  if (filename) res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.send(body);
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) return new ApiError(500, err.message || "Error interno del servidor");
  return new ApiError(500, "Error interno del servidor");
}
