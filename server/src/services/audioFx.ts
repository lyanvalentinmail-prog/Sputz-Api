import { processAudio } from "../lib/ffmpeg";
import { fetchWithTimeout, assertHttpUrl } from "../lib/http";
import { badRequest, serviceMissing } from "../lib/errors";

/** Texto a voz mediante el endpoint público de Google Translate TTS. */
export async function googleTts(text: string, lang: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;
  const res = await fetchWithTimeout(url, { headers: { "User-Agent": "Mozilla/5.0" } }, 12000);
  if (!res.ok) throw serviceMissing(`Google TTS (HTTP ${res.status})`);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("audio")) throw serviceMissing("Google TTS no devolvió audio (posible bloqueo regional o texto no admitido)");
  return Buffer.from(await res.arrayBuffer());
}

export async function audioReverse(input: Buffer): Promise<Buffer> {
  return processAudio(input, ["areverse"], "mp3");
}

/**
 * Efecto de voz robótica. La cadena principal usa afftfilt (vocoder de fase);
 * según la versión de ffmpeg «win_size» se expresa en muestras o como exponente,
 * por lo que se prueban variantes con degradación elegante a un efecto de radio.
 */
export async function audioRobot(input: Buffer): Promise<Buffer> {
  const variants: string[][] = [
    ["afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75"],
    ["afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=9:overlap=0.75"],
    ["highpass=f=180", "lowpass=f=3200", "tremolo=f=24:d=0.85", "vibrato=f=6:d=0.6"]
  ];
  let lastErr: unknown;
  for (const filters of variants) {
    try {
      return await processAudio(input, filters, "mp3");
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("No se pudo aplicar el efecto robot");
}

export async function audioZueira(input: Buffer): Promise<Buffer> {
  return processAudio(input, ["asetrate=44100*1.45", "atempo=0.85", "vibrato=f=7:d=0.7", "treble=g=4"], "mp3");
}

export async function audioBass(input: Buffer, gain: number): Promise<Buffer> {
  return processAudio(input, [`bass=g=${gain}:f=80:w=60:width_type=h`, "alimiter=limit=0.95"], "mp3");
}

/** Convierte un video corto en sticker WebP animado con ffmpeg. */
export async function videoToWebpSticker(input: Buffer, maxSeconds = 8): Promise<Buffer> {
  const { runFFmpeg, withTempFile } = await import("../lib/ffmpeg");
  return withTempFile(input, "mp4", async (file) => {
    const args = [
      "-hide_banner", "-loglevel", "error",
      "-i", file,
      "-t", String(maxSeconds),
      "-vf", "scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,fps=12",
      "-loop", "0", "-preset", "default", "-an", "-vsync", "0",
      "-c:v", "libwebp_anim",
      "-f", "webp", "-y", "pipe:1"
    ];
    return runFFmpeg(args, 90000);
  });
}

/** Descarga audio/video desde URL para los efectos que lo admitan. */
export async function audioFromUrl(url: string, maxMB = 25): Promise<Buffer> {
  assertHttpUrl(url);
  const res = await fetchWithTimeout(url, {}, 20000);
  if (!res.ok) throw badRequest(`No se pudo descargar el audio de la URL (HTTP ${res.status})`);
  const ab = await res.arrayBuffer();
  if (ab.byteLength > maxMB * 1024 * 1024) throw badRequest(`El audio supera el límite de ${maxMB} MB`);
  return Buffer.from(ab);
}
