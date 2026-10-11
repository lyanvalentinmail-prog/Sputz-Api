import type { Handler } from "./types";
import { jikanSearch, jikanQuotes, waifuPics } from "../services/external";
import { ok } from "../lib/respond";

export const animeHandlers: Record<string, Handler> = {
  anime: async ({ params, res }) => {
    ok(res, { results: await jikanSearch("anime", String(params.q), Number(params.limit ?? 5)) });
  },

  manga: async ({ params, res }) => {
    ok(res, { results: await jikanSearch("manga", String(params.q), Number(params.limit ?? 5)) });
  },

  waifu: async ({ params, res }) => {
    ok(res, { image: await waifuPics("waifu", params.nsfw === true) });
  },

  neko: async ({ params, res }) => {
    ok(res, { image: await waifuPics("neko", params.nsfw === true) });
  },

  quoteanime: async ({ params, res }) => {
    ok(res, { quotes: await jikanQuotes(Number(params.limit ?? 1)) });
  }
};
