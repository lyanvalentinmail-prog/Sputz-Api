import type { Handler } from "./types";
import { lrclibSearch, spotifySearch, soundcloudSearch } from "../services/external";
import { ytdlpInfo, type YtdlpInfo } from "../lib/ytdlp";
import { ok } from "../lib/respond";

export const musicHandlers: Record<string, Handler> = {
  play: async ({ params, res }) => {
    const q = String(params.q);
    const limit = Math.min(10, Number(params.limit ?? 5));
    const raw = await ytdlpInfo(`ytsearch${limit}:${q}`);
    const entries: YtdlpInfo[] = Array.isArray(raw) ? raw : raw.entries ?? [raw];
    ok(res, {
      query: q,
      results: entries.slice(0, limit).map((e) => ({
        title: e.title,
        channel: e.uploader ?? e.channel ?? null,
        duration: e.duration ?? null,
        url: e.webpage_url
      }))
    });
  },

  lyrics: async ({ params, res }) => {
    const results = await lrclibSearch(String(params.q), Number(params.limit ?? 1));
    ok(res, { results });
  },

  spotify: async ({ params, res }) => {
    const results = await spotifySearch(String(params.q), Number(params.limit ?? 5));
    ok(res, { results });
  },

  soundcloud: async ({ params, res }) => {
    const results = await soundcloudSearch(String(params.q));
    ok(res, { results });
  }
};
