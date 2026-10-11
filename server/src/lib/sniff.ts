/** Detección de tipo MIME real a partir de los bytes mágicos del archivo. */
export function sniffMime(buf: Buffer): string | null {
  if (!buf || buf.length < 12) return null;
  const b = buf;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WAVE") return "audio/wav";
  if (b.subarray(0, 4).toString("ascii") === "fLaC") return "audio/flac";
  if (b.subarray(0, 4).toString("ascii") === "OggS") return "audio/ogg";
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) return "audio/mpeg"; // ID3
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return "audio/mpeg"; // marco MP3
  if (b.subarray(4, 8).toString("ascii") === "ftyp") return "video/mp4";
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video/webm";
  if (b.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  return null;
}

/** MIME declarado o, si es genérico/incorrecto, el detectado por bytes. */
export function effectiveMime(declared: string, buf: Buffer): string {
  if (declared && declared !== "application/octet-stream" && declared !== "binary/octet-stream") return declared;
  return sniffMime(buf) ?? declared;
}
