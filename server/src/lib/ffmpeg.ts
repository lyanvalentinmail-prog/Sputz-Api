import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { config } from "../config";
import { serviceMissing } from "./errors";

let cachedPath: string | null | undefined; // undefined = sin comprobar

/** Resuelve la ruta de ffmpeg: FFMPEG_PATH > ffmpeg-static > PATH del sistema. */
export function ffmpegPath(): string | null {
  if (cachedPath !== undefined) return cachedPath;
  cachedPath = null;
  if (config.ffmpegPath && fs.existsSync(config.ffmpegPath)) {
    cachedPath = config.ffmpegPath;
    return cachedPath;
  }
  try {
    // Binario empaquetado vía npm (@ffmpeg-installer/ffmpeg)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const installer = require("@ffmpeg-installer/ffmpeg") as { path?: string };
    if (installer.path && fs.existsSync(installer.path)) {
      cachedPath = installer.path;
      return cachedPath;
    }
  } catch {
    /* paquete no instalado */
  }
  // Intento final: ffmpeg en el PATH del sistema
  try {
    const { execFileSync } = require("node:child_process") as typeof import("node:child_process");
    const which = process.platform === "win32" ? "where" : "which";
    const found = execFileSync(which, ["ffmpeg"], { encoding: "utf8", timeout: 3000 }).trim().split("\n")[0];
    if (found && fs.existsSync(found)) {
      cachedPath = found;
      return cachedPath;
    }
  } catch {
    /* ffmpeg no encontrado en el sistema */
  }
  cachedPath = null;
  return cachedPath;
}

export function ffmpegAvailable(): boolean {
  return ffmpegPath() !== null;
}

/** Ejecuta ffmpeg con argumentos y devuelve stdout en un Buffer. */
export function runFFmpeg(args: string[], timeoutMs = 60000): Promise<Buffer> {
  const bin = ffmpegPath();
  if (!bin) throw serviceMissing("ffmpeg");
  return new Promise((resolve, reject) => {
    const proc = execFile(bin, args, { encoding: "buffer", maxBuffer: 64 * 1024 * 1024, timeout: timeoutMs }, (err, stdout, stderr) => {
      if (err) {
        const detail = stderr ? stderr.toString().slice(-400) : err.message;
        reject(serviceMissing(`ffmpeg falló al procesar el archivo: ${detail}`));
        return;
      }
      resolve(stdout);
    });
    // Asegurar que el proceso hijo no herede stdio bloqueante
    proc.stdout?.resume();
    proc.stderr?.resume();
  });
}

/** Escribe un buffer en un archivo temporal y lo elimina al terminar. */
export async function withTempFile<T>(buf: Buffer, ext: string, fn: (path: string) => Promise<T>): Promise<T> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "siputzx-"));
  const file = path.join(dir, `input.${ext}`);
  fs.writeFileSync(file, buf);
  try {
    return await fn(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Procesamiento de audio: entrada en archivo temporal, salida por stdout. */
export async function processAudio(input: Buffer, filters: string[], outputFormat = "mp3"): Promise<Buffer> {
  return withTempFile(input, "media", async (file) => {
    const args = ["-hide_banner", "-loglevel", "error", "-i", file];
    if (filters.length) args.push("-af", filters.join(","));
    args.push("-vn", "-f", outputFormat, "-y", "pipe:1");
    return runFFmpeg(args);
  });
}
