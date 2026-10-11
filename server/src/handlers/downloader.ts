import type { Handler } from "./types";
import { pickFormatUrl, ytdlpInfo, type YtdlpInfo } from "../lib/ytdlp";
import { assertHttpUrl } from "../lib/http";
import { badRequest } from "../lib/errors";
import { ok } from "../lib/respond";

const PLATFORM_HOSTS: Record<string, string[]> = {
  tiktok: ["tiktok.com"],
  instagram: ["instagram.com", "instagr.am"],
  facebook: ["facebook.com", "fb.watch", "fb.com"],
  twitter: ["twitter.com", "x.com"],
  youtube: ["youtube.com", "youtu.be"]
};

function checkPlatform(platform: string, url: string) {
  assertHttpUrl(url);
  const hosts = PLATFORM_HOSTS[platform] || [];
  if (hosts.length && !hosts.some((h) => url.includes(h))) {
    throw badRequest(`La URL no pertenece a ${platform}. Dominios admitidos: ${hosts.join(", ")}`);
  }
}

function commonData(platform: string, info: YtdlpInfo) {
  return {
    platform,
    title: info.title ?? null,
    channel: info.uploader ?? info.channel ?? null,
    duration: info.duration ?? null,
    webpage_url: info.webpage_url
  };
}

function downloadHandler(platform: string, maxHeight?: number): Handler {
  return async ({ params, res }) => {
    const url = String(params.url);
    checkPlatform(platform, url);
    const raw = await ytdlpInfo(url, ["-f", "bv*+ba/b"]);
    const info = Array.isArray(raw) ? raw[0] : raw;
    const video = pickFormatUrl(info, "video", maxHeight);
    const audio = pickFormatUrl(info, "audio");
    ok(res, { ...commonData(platform, info), video, audio });
  };
}

export const downloaderHandlers: Record<string, Handler> = {
  tiktok: downloadHandler("tiktok"),
  instagram: downloadHandler("instagram"),
  facebook: downloadHandler("facebook"),
  twitter: downloadHandler("twitter"),
  youtube: async ({ params, res }) => {
    const url = String(params.url);
    checkPlatform("youtube", url);
    const quality = String(params.quality ?? "360");
    const raw = await ytdlpInfo(url);
    const info = Array.isArray(raw) ? raw[0] : raw;
    if (quality === "audio") {
      const audio = pickFormatUrl(info, "audio");
      ok(res, { ...commonData("youtube", info), quality, video: null, audio });
      return;
    }
    const maxHeight = quality === "720" ? 720 : 360;
    const video = pickFormatUrl(info, "video", maxHeight) || pickFormatUrl(info, "video");
    ok(res, { ...commonData("youtube", info), quality, video, audio: pickFormatUrl(info, "audio") });
  }
};
