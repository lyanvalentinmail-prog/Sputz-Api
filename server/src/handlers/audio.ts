import type { Handler } from "./types";
import { googleTts, audioReverse, audioRobot, audioZueira, audioBass } from "../services/audioFx";
import { ensureAudio } from "../lib/media";
import { binary } from "../lib/respond";

export const audioHandlers: Record<string, Handler> = {
  tts: async ({ params, res }) => {
    const mp3 = await googleTts(String(params.text), String(params.lang ?? "es"));
    binary(res, "audio/mpeg", mp3, "tts.mp3");
  },

  "audio-reverse": async ({ params, files, res }) => {
    const audio = await ensureAudio(params, files);
    binary(res, "audio/mpeg", await audioReverse(audio.buffer), "reverse.mp3");
  },

  "audio-robot": async ({ params, files, res }) => {
    const audio = await ensureAudio(params, files);
    binary(res, "audio/mpeg", await audioRobot(audio.buffer), "robot.mp3");
  },

  "audio-zueira": async ({ params, files, res }) => {
    const audio = await ensureAudio(params, files);
    binary(res, "audio/mpeg", await audioZueira(audio.buffer), "zueira.mp3");
  },

  bass: async ({ params, files, res }) => {
    const audio = await ensureAudio(params, files);
    binary(res, "audio/mpeg", await audioBass(audio.buffer, Number(params.gain ?? 15)), "bass.mp3");
  }
};
