import fs from "node:fs";
import path from "node:path";
import { loadImage, type Image } from "@napi-rs/canvas";

/**
 * Carga las plantillas de canvas (las del Drive del propietario, commiteadas
 * en server/assets/canvas). Devuelve null si no están, para que el compositor
 * use el diseño generado como alternativa.
 */
const CANDIDATES = [
  path.resolve(__dirname, "../../assets/canvas"), // dev: server/src/services
  path.resolve(__dirname, "../../../../assets/canvas"), // compilado: server/dist/server/src/services
  path.resolve(process.cwd(), "assets/canvas"), // cwd = server/
  path.resolve(process.cwd(), "server/assets/canvas") // cwd = raíz del repo
];

let baseDir: string | null = null;
function assetsDir(): string | null {
  if (baseDir !== null) return baseDir;
  baseDir = CANDIDATES.find((c) => fs.existsSync(path.join(c, "welcome.png"))) ?? null;
  return baseDir;
}

const cache = new Map<string, Image | null>();

export function templatePath(name: string): string | null {
  const dir = assetsDir();
  if (!dir) return null;
  const p = path.join(dir, `${name}.png`);
  return fs.existsSync(p) ? p : null;
}

export async function getTemplate(name: string): Promise<Image | null> {
  if (cache.has(name)) return cache.get(name) ?? null;
  const p = templatePath(name);
  if (!p) {
    cache.set(name, null);
    return null;
  }
  try {
    const img = await loadImage(fs.readFileSync(p));
    cache.set(name, img);
    return img;
  } catch {
    cache.set(name, null);
    return null;
  }
}

export function templatesAvailable(): boolean {
  return assetsDir() !== null;
}
