import GIFEncoder from "gif-encoder-2";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import yazl from "yazl";
import type { Handler } from "./types";
import { makeAttpFrames, makeBrat, makeTtp, assertColor } from "../services/canvasFx";
import { toStickerWebp } from "../services/imageFx";
import { videoToWebpSticker } from "../services/audioFx";
import { badRequest } from "../lib/errors";
import { binary } from "../lib/respond";
import { fetchBuffer, assertHttpUrl } from "../lib/http";
import { effectiveMime } from "../lib/sniff";

export const stickerHandlers: Record<string, Handler> = {
  brat: ({ params, res }) => {
    const png = makeBrat(String(params.text), { bg: String(params.bg), size: Number(params.size) });
    binary(res, "image/png", png, "brat.png");
  },

  brathd: ({ params, res }) => {
    const png = makeBrat(String(params.text), { bg: String(params.bg), size: Number(params.size), hd: true });
    binary(res, "image/png", png, "brathd.png");
  },

  bratv: ({ params, res }) => {
    const png = makeBrat(String(params.text), { bg: String(params.bg), size: 900, vertical: true });
    binary(res, "image/png", png, "bratv.png");
  },

  attp: async ({ params, res }) => {
    const size = Math.min(512, Number(params.size) || 512);
    const frames = makeAttpFrames(String(params.text), size);
    const encoder = new GIFEncoder(size, size, "neuquant", false);
    encoder.setDelay(90);
    encoder.setRepeat(0);
    encoder.start();
    for (const f of frames) {
      const img = await loadImage(f);
      const canvas = createCanvas(size, size);
      canvas.getContext("2d").drawImage(img, 0, 0);
      encoder.addFrame(canvas.getContext("2d"));
    }
    encoder.finish();
    binary(res, "image/gif", encoder.out.getData(), "attp.gif");
  },

  ttp: ({ params, res }) => {
    const color = assertColor(String(params.color), "color");
    const png = makeTtp(String(params.text), { color, size: Number(params.size) });
    binary(res, "image/png", png, "ttp.png");
  },

  sticker: async ({ params, files, res }) => {
    const file = files["file"]?.[0];
    const url = typeof params["url"] === "string" ? params["url"] : "";
    if (!file && !url) throw badRequest("Sube un archivo en el campo «file» o indica una «url»");
    let buffer: Buffer;
    let contentType: string;
    if (file) {
      if (file.size > 25 * 1024 * 1024) throw badRequest("El archivo supera el límite de 25 MB");
      const allowed = ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm"];
      contentType = effectiveMime(file.mimetype, file.buffer);
      if (!allowed.includes(contentType)) throw badRequest(`Formato no compatible (${contentType}). Usa PNG, JPEG, WebP o MP4`);
      buffer = file.buffer;
    } else {
      assertHttpUrl(url);
      const fetched = await fetchBuffer(url, 25 * 1024 * 1024, 20000);
      buffer = fetched.buffer;
      contentType = fetched.contentType.split(";")[0].trim();
    }
    if (contentType.startsWith("video/")) {
      const webp = await videoToWebpSticker(buffer);
      binary(res, "image/webp", webp, "sticker.webp");
      return;
    }
    if (!contentType.startsWith("image/")) throw badRequest(`El recurso no es una imagen ni un video compatible (${contentType})`);
    const webp = await toStickerWebp(buffer, contentType);
    binary(res, "image/webp", webp, "sticker.webp");
  },

  spack: async ({ params, files, res }) => {
    const imgs = files["files"] || files["file"] || [];
    if (imgs.length < 2 || imgs.length > 10) throw badRequest(`Envía entre 2 y 10 imágenes (recibidas: ${imgs.length}) en el campo «files»`);
    for (const im of imgs) {
      if (im.size > 10 * 1024 * 1024) throw badRequest(`El archivo «${im.originalname}» supera el límite de 10 MB`);
      if (!["image/png", "image/jpeg", "image/webp"].includes(im.mimetype)) throw badRequest(`Formato no compatible en «${im.originalname}» (${im.mimetype}). Usa PNG, JPEG o WebP`);
    }
    const zip = new yazl.ZipFile();
    let index = 0;
    for (const im of imgs) {
      const webp = await toStickerWebp(im.buffer, im.mimetype);
      zip.addBuffer(webp, `${String(params.name || "pack")}/sticker_${String(index).padStart(2, "0")}.webp`);
      index++;
    }
    zip.end();
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      zip.outputStream.on("data", (c: Buffer) => chunks.push(c));
      zip.outputStream.on("end", resolve);
      zip.outputStream.on("error", reject);
    });
    binary(res, "application/zip", Buffer.concat(chunks), `${String(params.name || "pack")}.zip`);
  }
};
