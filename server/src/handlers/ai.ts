import type { Handler } from "./types";
import { openaiChat, openaiImage, openaiCompatibleChat, removeBg } from "../services/external";
import { fxEnhance } from "../services/imageFx";
import { ensureImage } from "../lib/media";
import { binary, ok } from "../lib/respond";

export const aiHandlers: Record<string, Handler> = {
  chatgpt: async ({ params, res }) => {
    const r = await openaiChat(String(params.prompt), {
      system: params.system ? String(params.system) : undefined,
      model: params.model ? String(params.model) : undefined
    });
    ok(res, r);
  },

  blackbox: async ({ params, res }) => {
    const language = params.language ? String(params.language) : undefined;
    const system = "Eres un asistente experto en programación. Responde en español con ejemplos de código cuando ayude." + (language ? ` El contexto del usuario es ${language}.` : "");
    const answer = await openaiCompatibleChat("BLACKBOX_API_KEY", "BLACKBOX_BASE_URL", String(params.prompt), system);
    ok(res, { answer, language: language ?? null });
  },

  imagine: async ({ params, res }) => {
    const size = String(params.size ?? "1024x1024");
    const r = await openaiImage(String(params.prompt), size);
    ok(res, { prompt: String(params.prompt), ...r });
  },

  removebg: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    const png = await removeBg(img.buffer, img.filename || "image.png");
    binary(res, "image/png", png, "sin-fondo.png");
  },

  enhance: async ({ params, files, res }) => {
    const img = await ensureImage(params, files);
    binary(res, "image/png", await fxEnhance(img.buffer, Number(params.scale ?? 2)), "enhanced.png");
  }
};
