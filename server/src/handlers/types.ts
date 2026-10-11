import type { Request, Response } from "express";

export interface Ctx {
  req: Request;
  res: Response;
  /** Parámetros ya validados y con valores por defecto aplicados */
  params: Record<string, string | number | boolean | undefined>;
  /** Archivos subidos agrupados por nombre de campo */
  files: Record<string, Express.Multer.File[]>;
}

export type Handler = (ctx: Ctx) => Promise<void> | void;
