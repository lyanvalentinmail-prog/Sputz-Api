import type { Handler } from "./types";
import { googleCse, wikipediaSearch, openverseImages, googleVisionWebDetect } from "../services/external";
import { ensureImage } from "../lib/media";
import { ok } from "../lib/respond";

export const searchHandlers: Record<string, Handler> = {
  google: async ({ params, res }) => {
    const q = String(params.q);
    const results = await googleCse(q, Number(params.limit ?? 5));
    ok(res, { query: q, results });
  },

  wikipedia: async ({ params, res }) => {
    ok(res, await wikipediaSearch(String(params.q), String(params.lang ?? "es")));
  },

  images: async ({ params, res }) => {
    const q = String(params.q);
    const results = await openverseImages(q, Number(params.limit ?? 10));
    ok(res, { query: q, results });
  },

  reverseimage: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    const url = typeof params["url"] === "string" && params["url"] ? params["url"] : undefined;
    const result = await googleVisionWebDetect(img.buffer.toString("base64"), url);
    ok(res, result);
  }
};
