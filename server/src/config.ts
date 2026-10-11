import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

// Carga .env desde la raíz del repositorio y desde server/
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

function intEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  apiName: process.env.API_NAME?.trim() || "SiputZX API",
  port: intEnv("PORT", 3001),
  rateLimit: {
    max: intEnv("RATE_LIMIT_MAX", 120),
    windowMs: intEnv("RATE_LIMIT_WINDOW_MS", 60_000)
  },
  maxUploadMB: intEnv("MAX_UPLOAD_MB", 25),
  ffmpegPath: process.env.FFMPEG_PATH?.trim() || "",
  ytdlpPath: process.env.YTDLP_PATH?.trim() || "",
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    BLACKBOX_API_KEY: process.env.BLACKBOX_API_KEY || "",
    BLACKBOX_BASE_URL: process.env.BLACKBOX_BASE_URL || "",
    REMOVEBG_API_KEY: process.env.REMOVEBG_API_KEY || "",
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
    GOOGLE_CSE_ID: process.env.GOOGLE_CSE_ID || "",
    GOOGLE_VISION_API_KEY: process.env.GOOGLE_VISION_API_KEY || "",
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || "",
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || "",
    SOUNDCLOUD_CLIENT_ID: process.env.SOUNDCLOUD_CLIENT_ID || "",
    TINYURL_API_KEY: process.env.TINYURL_API_KEY || ""
  },
  webDist: path.resolve(__dirname, "../../web/dist")
};

export function envMissing(names: string[]): string[] {
  return names.filter((n) => !(config.env as Record<string, string>)[n]);
}

export function webDistExists(): boolean {
  return fs.existsSync(path.join(config.webDist, "index.html"));
}
