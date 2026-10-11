import type { Handler } from "./types";
import { stickerHandlers } from "./stickers";
import { imageHandlers } from "./images";
import { canvasHandlers } from "./canvas";
import { audioHandlers } from "./audio";
import { downloaderHandlers } from "./downloader";
import { toolsHandlers } from "./tools";
import { aiHandlers } from "./ai";
import { musicHandlers } from "./music";
import { animeHandlers } from "./anime";
import { searchHandlers } from "./search";
import { gameHandlers } from "./games";

/** Mapa único id de endpoint → handler real. */
export const HANDLERS: Record<string, Handler> = {
  ...stickerHandlers,
  ...imageHandlers,
  ...canvasHandlers,
  ...audioHandlers,
  ...downloaderHandlers,
  ...toolsHandlers,
  ...aiHandlers,
  ...musicHandlers,
  ...animeHandlers,
  ...searchHandlers,
  ...gameHandlers
};

export type { Handler, Ctx } from "./types";
