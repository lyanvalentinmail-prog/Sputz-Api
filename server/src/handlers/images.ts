import type { Handler } from "./types";
import { ensureImage } from "../lib/media";
import { fxBlur, fxDarkness, fxPixel, fxBeautiful, fxRedTint, fxSepia } from "../services/imageFx";
import { makeWantedPoster, makeTriggeredImage } from "../services/canvasFx";
import { binary } from "../lib/respond";

export const imageHandlers: Record<string, Handler> = {
  blur: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    binary(res, "image/png", await fxBlur(img.buffer, Number(params.amount)), "blur.png");
  },

  darkness: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    binary(res, "image/png", await fxDarkness(img.buffer, Number(params.level)), "darkness.png");
  },

  pixel: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    binary(res, "image/png", await fxPixel(img.buffer, Number(params.scale)), "pixel.png");
  },

  wanted: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    const sepia = await fxSepia(img.buffer);
    binary(res, "image/png", await makeWantedPoster(sepia, String(params.reward ?? "1.000.000")), "wanted.png");
  },

  trigger: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    const tinted = await fxRedTint(img.buffer);
    binary(res, "image/png", await makeTriggeredImage(tinted.png, tinted.width, tinted.height), "trigger.png");
  },

  beautiful: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    binary(res, "image/png", await fxBeautiful(img.buffer), "beautiful.png");
  }
};
