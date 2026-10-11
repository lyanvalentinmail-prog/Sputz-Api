import { execFile } from "node:child_process";
import { config } from "../config";
import { serviceMissing } from "./errors";

let availabilityChecked = false;
let available = false;

function bin(): string {
  return config.ytdlpPath || "yt-dlp";
}

/** Comprueba una sola vez si yt-dlp está instalado en el servidor. */
export async function ytdlpAvailable(): Promise<boolean> {
  if (availabilityChecked) return available;
  availabilityChecked = true;
  available = await new Promise((resolve) => {
    execFile(bin(), ["--version"], { timeout: 5000 }, (err) => resolve(!err));
  });
  return available;
}

export interface YtdlpInfo {
  id: string;
  title: string;
  uploader?: string;
  channel?: string;
  duration?: number;
  webpage_url: string;
  url?: string;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  height?: number;
  formats?: Array<{ format_id: string; ext: string; height?: number; vcodec?: string; acodec?: string; url: string }>;
  entries?: YtdlpInfo[];
}

/** Ejecuta yt-dlp -j (metadatos JSON) sobre una URL o consulta de búsqueda. */
export async function ytdlpInfo(target: string, extraArgs: string[] = [], timeoutMs = 30000): Promise<YtdlpInfo | YtdlpInfo[]> {
  if (!(await ytdlpAvailable())) {
    throw serviceMissing("yt-dlp (instálalo en el servidor o define YTDLP_PATH)");
  }
  const args = ["--no-playlist", "--no-warnings", "-j", ...extraArgs, target];
  const out = await new Promise<string>((resolve, reject) => {
    execFile(bin(), args, { timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(serviceMissing(`yt-dlp no pudo procesar la solicitud: ${(stderr || err.message).toString().slice(0, 300)}`));
      else resolve(stdout);
    });
  });
  const lines = out.split("\n").filter((l) => l.trim().length > 0);
  const parsed = lines.map((l) => JSON.parse(l) as YtdlpInfo);
  return parsed.length === 1 ? parsed[0] : parsed;
}

/** Elige la mejor URL directa de video/según calidad solicitada. */
export function pickFormatUrl(info: YtdlpInfo, kind: "video" | "audio", maxHeight?: number): string | null {
  const formats = info.formats || [];
  const candidates = formats.filter((f) => {
    if (!f.url) return false;
    if (kind === "audio") return f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none");
    return f.vcodec && f.vcodec !== "none" && (!maxHeight || (f.height ?? 0) <= maxHeight);
  });
  if (!candidates.length) return info.url || null;
  candidates.sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
  return candidates[0].url;
}
