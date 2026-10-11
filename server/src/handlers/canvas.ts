import { randomInt } from "node:crypto";
import type { Handler } from "./types";
import {
  loadAvatar, makeWelcomeCard, makeShipCard, makeGayCard, makeIqcCard, seededPercent,
  templateWelcome, templateShip, templateGay, templateIqc
} from "../services/canvasFx";
import { binary } from "../lib/respond";

function avatarOpts(params: Record<string, unknown>, files: Record<string, Express.Multer.File[]>, field = "file") {
  const url = typeof params["avatar"] === "string" && params["avatar"] ? params["avatar"] : undefined;
  const file = files[field]?.[0]?.buffer;
  return { url, file };
}

export const canvasHandlers: Record<string, Handler> = {
  welcome: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files));
    const opts = {
      username: String(params.username),
      group: String(params.group ?? "Grupo"),
      members: Number(params.members ?? 1),
      avatar,
      kind: "welcome" as const
    };
    const png = (await templateWelcome(opts)) ?? makeWelcomeCard(opts);
    binary(res, "image/png", png, "welcome.png");
  },

  goodbye: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files));
    const opts = {
      username: String(params.username),
      group: String(params.group ?? "Grupo"),
      members: Number(params.members ?? 1),
      avatar,
      kind: "goodbye" as const
    };
    const png = (await templateWelcome(opts)) ?? makeWelcomeCard(opts);
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
    const shipOpts = { name1, name2, percent, avatar1, avatar2 };
    const png = (await templateShip(shipOpts)) ?? makeShipCard(shipOpts);
    binary(res, "image/png", png, "ship.png");
  },

  gay: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files), 300);
    const name = String(params.name);
    const percent = params.seed !== undefined ? seededPercent(`${name}|${params.seed}`) : randomInt(0, 101);
    const gayOpts = { name, percent, avatar };
    const png = (await templateGay(gayOpts)) ?? makeGayCard(gayOpts);
    binary(res, "image/png", png, "gay.png");
  },

  iqc: async ({ params, files, res }) => {
    const avatar = await loadAvatar(avatarOpts(params, files), 200);
    const name = String(params.name);
    const percent = params.seed !== undefined ? seededPercent(`${name}|iq|${params.seed}`) : randomInt(0, 101);
    const iqcOpts = { name, bio: params.bio ? String(params.bio) : undefined, percent, avatar };
    const png = (await templateIqc(iqcOpts)) ?? makeIqcCard(iqcOpts);
    binary(res, "image/png", png, "iqc.png");
  }
};
