import sharp from "sharp";
import { badRequest } from "../lib/errors";

/** Redimensiona limitando el lado mayor, sin ampliar. */
function fit(img: sharp.Sharp, max = 1280): sharp.Sharp {
  return img.rotate().resize({ width: max, height: max, fit: "inside", withoutEnlargement: true });
}

export async function fxBlur(buffer: Buffer, amount: number): Promise<Buffer> {
  return fit(sharp(buffer)).blur(amount).png().toBuffer();
}

export async function fxDarkness(buffer: Buffer, level: number): Promise<Buffer> {
  const brightness = Math.max(0.05, 1 - level / 100);
  return fit(sharp(buffer)).modulate({ brightness }).png().toBuffer();
}

export async function fxPixel(buffer: Buffer, scale: number): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const w = meta.width || 512;
  const h = meta.height || 512;
  const smallW = Math.max(2, Math.floor(w / scale));
  const smallH = Math.max(2, Math.floor(h / scale));
  const small = await fit(sharp(buffer)).resize(smallW, smallH, { fit: "fill" }).raw().toBuffer();
  return sharp(small, { raw: { width: smallW, height: smallH, channels: (small.length / (smallW * smallH)) as 3 | 4 } })
    .resize(w, h, { fit: "fill", kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
}

export async function fxBeautiful(buffer: Buffer): Promise<Buffer> {
  return fit(sharp(buffer))
    .modulate({ brightness: 1.06, saturation: 1.18 })
    .sharpen(1.2, 1.5, 8)
    .png()
    .toBuffer();
}

export async function fxEnhance(buffer: Buffer, scale: number): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const w = Math.min(4096, (meta.width || 512) * scale);
  return sharp(buffer)
    .rotate()
    .resize({ width: w, kernel: sharp.kernel.lanczos3 })
    .normalise()
    .sharpen(1.5, 2, 10)
    .png()
    .toBuffer();
}

/** Conversión a sticker WebP 512×512 (formato WhatsApp). */
export async function toStickerWebp(buffer: Buffer, contentType: string): Promise<Buffer> {
  if (contentType.startsWith("video/")) {
    // Los videos requieren ffmpeg; se delega en el handler.
    throw badRequest("internal-video");
  }
  return sharp(buffer)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toBuffer();
}

/** Tinte rojo para el efecto trigger. */
export async function fxRedTint(buffer: Buffer): Promise<{ png: Buffer; width: number; height: number }> {
  const base = fit(sharp(buffer), 720);
  const meta = await base.toBuffer().then((b) => sharp(b).metadata());
  const width = meta.width || 720;
  const height = meta.height || 720;
  const red = Buffer.from([220, 38, 38]);
  const png = await base
    .composite([{ input: red, blend: "tint", gravity: "centre", tile: true } as never])
    .png()
    .toBuffer();
  return { png, width, height };
}

/** Sepia para el póster wanted. */
export async function fxSepia(buffer: Buffer): Promise<Buffer> {
  return fit(sharp(buffer), 720).tint({ r: 112, g: 66, b: 20 }).png().toBuffer();
}
