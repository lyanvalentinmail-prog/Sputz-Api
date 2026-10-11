import type { ApiError as ApiErrorType } from "./errors";
import { badRequest } from "./errors";
import { assertHttpUrl, fetchBuffer } from "./http";
import { effectiveMime } from "./sniff";

export interface MediaSource {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];
const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/ogg", "audio/wav", "audio/x-wav", "audio/webm", "audio/mp4", "audio/aac", "audio/opus", "audio/flac", "video/mp4", "video/webm"];

/**
 * Obtiene la imagen desde el archivo subido o desde una URL.
 * Valida tipo y tamaño en el servidor (además de la validación del cliente).
 */
export async function ensureImage(params: Record<string, unknown>, files: Record<string, Express.Multer.File[]>, maxMB = 10): Promise<MediaSource> {
  const file = files["file"]?.[0];
  const url = typeof params["url"] === "string" ? params["url"] : "";
  if (!file && !url) throw badRequest("Debes subir un archivo en el campo «file» o indicar una «url» de imagen");
  const maxBytes = maxMB * 1024 * 1024;
  if (file) {
    if (file.size > maxBytes) throw badRequest(`El archivo supera el límite de ${maxMB} MB`);
    const mime = effectiveMime(file.mimetype, file.buffer);
    if (!IMAGE_TYPES.includes(mime)) throw badRequest(`Formato de imagen no compatible (${mime}). Formatos admitidos: PNG, JPEG, WebP, GIF, AVIF`);
    return { buffer: file.buffer, contentType: mime, filename: file.originalname };
  }
  assertHttpUrl(url);
  const { buffer, contentType } = await fetchBuffer(url, maxBytes);
  if (!IMAGE_TYPES.includes(contentType.split(";")[0].trim())) {
    throw badRequest(`La URL no apunta a una imagen compatible (content-type: ${contentType})`);
  }
  return { buffer, contentType, filename: "imagen" };
}

/** Obtiene un audio desde archivo subido o URL. */
export async function ensureAudio(params: Record<string, unknown>, files: Record<string, Express.Multer.File[]>, maxMB = 25): Promise<MediaSource> {
  const file = files["file"]?.[0];
  const url = typeof params["url"] === "string" ? params["url"] : "";
  if (!file && !url) throw badRequest("Debes subir un archivo de audio en el campo «file» o indicar una «url»");
  const maxBytes = maxMB * 1024 * 1024;
  if (file) {
    if (file.size > maxBytes) throw badRequest(`El archivo supera el límite de ${maxMB} MB`);
    const mime = effectiveMime(file.mimetype, file.buffer);
    if (!AUDIO_TYPES.includes(mime)) throw badRequest(`Formato de audio no compatible (${mime}). Usa MP3, OGG, WAV, AAC, FLAC, OPUS o MP4`);
    return { buffer: file.buffer, contentType: mime, filename: file.originalname };
  }
  assertHttpUrl(url);
  const { buffer, contentType } = await fetchBuffer(url, maxBytes, 20000);
  return { buffer, contentType, filename: "audio" };
}

export type { ApiErrorType };
