import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { config, webDistExists } from "./config";
import { buildRouter } from "./router";
import { fail, toApiError } from "./lib/respond";
import { ENDPOINTS } from "../../shared/catalog";

export function createApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Cabeceras básicas de seguridad
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  // Límite de solicitudes por IP (protección contra abusos)
  app.use("/api", rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) => fail(res, 429, "Demasiadas solicitudes desde tu IP. Espera unos segundos e inténtalo de nuevo.")
  }));

  app.use(buildRouter());

  // Frontend compilado (despliegue conjunto)
  if (webDistExists()) {
    app.use(express.static(config.webDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(config.webDist, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.type("html").send(
        `<html lang="es"><body style="font-family:sans-serif;padding:40px"><h1>${config.apiName}</h1>` +
        `<p>El backend está activo con ${ENDPOINTS.length} endpoints. Arranca el frontend con <code>npm run dev -w web</code> o compílalo con <code>npm run build</code>.</p>` +
        `<p>Estado: <a href="/api/meta/status">/api/meta/status</a> · Catálogo: <a href="/api/meta/endpoints">/api/meta/endpoints</a></p>` +
        `<p>El frontend no está compilado en esta instancia (falta ${fs.realpathSync(config.webDist)}/index.html).</p></body></html>`
      );
    });
  }

  // Manejo centralizado de errores
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        fail(res, 413, `El archivo supera el límite de ${config.maxUploadMB} MB del servidor`);
        return;
      }
      fail(res, 400, `Error en la subida del archivo: ${err.message}`);
      return;
    }
    const apiErr = toApiError(err);
    fail(res, apiErr.status, apiErr.message);
  });

  return app;
}
