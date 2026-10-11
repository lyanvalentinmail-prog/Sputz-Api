import { randomInt } from "node:crypto";
import type { Handler } from "./types";
import { loadAvatar, makeWelcomeCard, makeShipCard, makeGayCard, makeIqcCard, seededPercent } from "../services/canvasFx";
import { binary } from "../lib/respond";

function avatarOpts(params: Record<string, unknown>, files: Record<string, Express.Multer.File[]>, field = "file") {
  const url = typeof params["avatar"] === "string" && params["avatar"] ? params["avatar"] : undefined;
  const file = files[field]?.[0]?.buffer;
  return { url, file };
}

export const canvasHandlers: Record<string, Handler> = {
  welcome: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files));
    const png = makeWelcomeCard({
      username: String(params.username),
      group: String(params.group ?? "Grupo"),
      members: Number(params.members ?? 1),
      avatar,
      kind: "welcome"
    });
    binary(res, "image/png", png, "welcome.png");
  },

  goodbye: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files));
    const png = makeWelcomeCard({
      username: String(params.username),
      group: String(params.group ?? "Grupo"),
      members: Number(params.members ?? 1),
      avatar,
      kind: "goodbye"
    });
    binary(res, "image/png", png, "goodbye.png");
  },

  ship: async ({ params, files, res }) => {
    const uploads = files["file"] || [];
    const avatar1 = await loadAvatar({
      url: typeof params["avatar1"] === "string" && params["avatar1"] ? params["avatar1"] : undefined,
      file: uploads[0]?.buffer
    }, 140);
    const avatar2 = await loadAvatar({
      url: typeof params["avatar2"] === "string" && params["avatar2"] ? params["avatar2"] : undefined,
      file: uploads[1]?.buffer
    }, 320);
    const name1 = String(params.name1);
    const name2 = String(params.name2);
    const percent = params.seed !== undefined
      ? seededPercent(`${name1}|${name2}|${params.seed}`)
      : randomInt(0, 101);
    binary(res, "image/png", makeShipCard({ name1, name2, percent, avatar1, avatar2 }), "ship.png");
  },

  gay: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files), 300);
    const name = String(params.name);
    const percent = params.seed !== undefined ? seededPercent(`${name}|${params.seed}`) : randomInt(0, 101);
    binary(res, "image/png", makeGayCard({ name, percent, avatar }), "gay.png");
  },

  iqc: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files), 200);
    const name = String(params.name);
    const percent = params.seed !== undefined ? seededPercent(`${name}|iq|${params.seed}`) : randomInt(0, 101);
    binary(res, "image/png", makeIqcCard({ name, bio: params.bio ? String(params.bio) : undefined, percent, avatar }), "iqc.png");
  }
};
