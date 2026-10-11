import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import type { Canvas, SKRSContext2D } from "@napi-rs/canvas";
import { fetchBuffer, assertHttpUrl } from "../lib/http";
import { badRequest } from "../lib/errors";

/** Registra fuentes del sistema si existen (silencioso si no). */
try {
  for (const f of [
    { path: "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", family: "Sans" },
    { path: "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", family: "Sans" },
    { path: "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", family: "SansBold" },
    { path: "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", family: "Serif" },
    { path: "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", family: "SerifBold" }
  ]) {
    try {
      GlobalFonts.registerFromPath(f.path, f.family);
    } catch {
      /* fuente no presente */
    }
  }
} catch {
  /* sin fuentes del sistema */
}

const BRAT_COLORS: Record<string, { bg: string; fg: string }> = {
  lime: { bg: "#8ace00", fg: "#0e1200" },
  black: { bg: "#111111", fg: "#f2f2f2" },
  white: { bg: "#f7f7f7", fg: "#1a1a1a" }
};

/** Texto con aspecto desenfocado (estilo brat): varias pasadas con desplazamiento. */
function drawBlurryText(ctx: SKRSContext2D, text: string, cx: number, cy: number, fontSize: number, color: string, blurPx: number) {
  ctx.font = `${fontSize}px Sans, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  const passes = 14;
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < passes; i++) {
    const angle = (i / passes) * Math.PI * 2;
    for (const r of [blurPx * 0.4, blurPx * 0.8, blurPx]) {
      ctx.fillText(text, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.6);
    }
  }
  ctx.globalAlpha = 0.55;
  ctx.fillText(text, cx, cy);
  ctx.globalAlpha = 1;
}

/** Ajusta el tamaño de fuente para que el texto quepa en un ancho máximo. */
function fitFont(ctx: SKRSContext2D, text: string, maxWidth: number, startSize: number, minSize = 18): number {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${size}px Sans, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

export function makeBrat(text: string, opts: { bg?: string; size?: number; hd?: boolean; vertical?: boolean } = {}): Buffer {
  const colors = BRAT_COLORS[opts.bg || "lime"] || BRAT_COLORS.lime;
  const size = opts.size || (opts.hd ? 1024 : 512);
  const w = opts.vertical ? Math.round(size * 0.62) : size;
  const h = size;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const lower = text.toLowerCase();
  const base = opts.vertical ? h * 0.16 : w * 0.22;
  const fontSize = fitFont(ctx, lower, w * 0.82, Math.round(opts.hd ? base * 1.1 : base));
  drawBlurryText(ctx, lower, w / 2, h / 2, fontSize, colors.fg, opts.hd ? w * 0.02 : w * 0.014);
  return canvas.toBuffer("image/png");
}

export function makeTtp(text: string, opts: { color?: string; size?: number } = {}): Buffer {
  const size = opts.size || 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const lines = wrapLines(ctx, text.toUpperCase(), size * 0.8, Math.round(size * 0.24));
  const fontSize = fitFontMulti(ctx, lines, size * 0.8, Math.round(size * 0.24));
  ctx.font = `bold ${fontSize}px Sans, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lineHeight = fontSize * 1.15;
  const startY = size / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    ctx.lineWidth = Math.max(4, fontSize * 0.16);
    ctx.strokeStyle = "#111111";
    ctx.lineJoin = "round";
    ctx.strokeText(line, size / 2, y);
    ctx.fillStyle = opts.color || "#22c55e";
    ctx.fillText(line, size / 2, y);
  });
  return canvas.toBuffer("image/png");
}

function wrapLines(ctx: SKRSContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `bold ${fontSize}px Sans, sans-serif`;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function fitFontMulti(ctx: SKRSContext2D, lines: string[], maxWidth: number, startSize: number): number {
  let size = startSize;
  while (size > 14) {
    ctx.font = `bold ${size}px Sans, sans-serif`;
    if (lines.every((l) => ctx.measureText(l).width <= maxWidth)) break;
    size -= 2;
  }
  return size;
}

/** Frames para el sticker animado arcoíris (ATTP). */
export function makeAttpFrames(text: string, size: number, frames = 14): Buffer[] {
  const out: Buffer[] = [];
  const lower = text.toLowerCase();
  for (let i = 0; i < frames; i++) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    const lines = wrapLines(ctx, lower, size * 0.86, Math.round(size * 0.2));
    const fontSize = fitFontMulti(ctx, lines, size * 0.86, Math.round(size * 0.2));
    ctx.font = `bold ${fontSize}px Sans, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lineHeight = fontSize * 1.15;
    const startY = size / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, li) => {
      // Pintar carácter a carácter con rotación de tono (arcoíris animado)
      const totalWidth = ctx.measureText(line).width;
      let x = size / 2 - totalWidth / 2;
      for (const ch of line) {
        const idx = i;
        const hue = ((li * 40) + idx * (360 / frames) + x) % 360;
        ctx.fillStyle = `hsl(${hue}, 95%, 55%)`;
        ctx.strokeStyle = "#111";
        ctx.lineWidth = Math.max(3, fontSize * 0.12);
        ctx.textAlign = "left";
        ctx.strokeText(ch, x, startY + li * lineHeight);
        ctx.fillText(ch, x, startY + li * lineHeight);
        x += ctx.measureText(ch).width;
      }
    });
    out.push(canvas.toBuffer("image/png"));
  }
  return out;
}

// ─────────────────────────── Avatares ───────────────────────────

export async function loadAvatar(opts: { url?: string; file?: Buffer }, fallbackHue = 150): Promise<Canvas> {
  const size = 256;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  let loaded = false;
  try {
    let buf: Buffer | null = null;
    if (opts.file) buf = opts.file;
    else if (opts.url) {
      assertHttpUrl(opts.url, "avatar");
      const res = await fetchBuffer(opts.url, 8 * 1024 * 1024, 10000);
      if (res.contentType.startsWith("image/")) buf = res.buffer;
    }
    if (buf) {
      const img = await loadImage(buf);
      // Recorte cuadrado centrado
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      loaded = true;
    }
  } catch {
    loaded = false;
  }
  if (!loaded) {
    // Placeholder neutro (no se inventa una imagen: se indica en la respuesta)
    ctx.fillStyle = `hsl(${fallbackHue}, 25%, 82%)`;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = `hsl(${fallbackHue}, 25%, 45%)`;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.38, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size / 2, size * 0.95, size * 0.32, size * 0.34, 0, Math.PI, 0);
    ctx.fill();
  }
  return canvas;
}

function avatarCircle(ctx: SKRSContext2D, avatar: Canvas, x: number, y: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, x, y, r * 2, r * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#22c55e";
  ctx.stroke();
}

// ─────────────────────────── Tarjetas Canvas ───────────────────────────

export function makeWelcomeCard(opts: {
  username: string; group: string; members: number; avatar: Canvas; kind: "welcome" | "goodbye";
}): Buffer {
  const W = 900, H = 320;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#171a21";
  ctx.fillRect(0, H - 90, W, 90);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, H - 94, W, 4);
  avatarCircle(ctx, opts.avatar, 40, (H - 200) / 2, 100);
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "bold 44px Sans, sans-serif";
  ctx.textBaseline = "alphabetic";
  const title = opts.kind === "welcome" ? "¡Bienvenido/a!" : "¡Hasta pronto!";
  ctx.fillText(title, 280, 120);
  ctx.fillStyle = "#22c55e";
  ctx.font = "bold 34px Sans, sans-serif";
  ctx.fillText(truncate(opts.username, 26), 280, 168);
  ctx.fillStyle = "#9aa0aa";
  ctx.font = "24px Sans, sans-serif";
  ctx.fillText(truncate(opts.group, 40), 280, 208);
  ctx.fillStyle = "#6f757f";
  ctx.font = "22px Sans, sans-serif";
  ctx.fillText(`Miembro nº ${opts.members}`, 280, 278);
  return canvas.toBuffer("image/png");
}

export function makeShipCard(opts: {
  name1: string; name2: string; percent: number; avatar1: Canvas; avatar2: Canvas;
}): Buffer {
  const W = 900, H = 420;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(0, 0, W, H);
  avatarCircle(ctx, opts.avatar1, 70, 60, 110);
  avatarCircle(ctx, opts.avatar2, W - 290, 60, 110);
  // Corazón central
  ctx.save();
  ctx.translate(W / 2, 165);
  ctx.scale(3.2, 3.2);
  ctx.fillStyle = opts.percent >= 50 ? "#e11d48" : "#52525b";
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-14, -6, -8, -18, 0, -10);
  ctx.bezierCurveTo(8, -18, 14, -6, 0, 8);
  ctx.fill();
  ctx.restore();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "bold 30px Sans, sans-serif";
  ctx.fillText(truncate(opts.name1, 18), 180, 330);
  ctx.fillText(truncate(opts.name2, 18), W - 180, 330);
  ctx.fillStyle = "#22c55e";
  ctx.font = "bold 64px Sans, sans-serif";
  ctx.fillText(`${opts.percent}%`, W / 2, 330);
  // Barra de compatibilidad
  ctx.fillStyle = "#26262b";
  ctx.fillRect(150, 360, W - 300, 18);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(150, 360, ((W - 300) * opts.percent) / 100, 18);
  return canvas.toBuffer("image/png");
}

export function makeGayCard(opts: { name: string; percent: number; avatar: Canvas }): Buffer {
  const W = 800, H = 400;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(0, 0, W, H);
  const rainbow = ["#e40303", "#ff8c00", "#ffed00", "#008026", "#004dff", "#750787"];
  const stripeH = 14;
  rainbow.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, H - (rainbow.length - i) * stripeH, W, stripeH);
  });
  avatarCircle(ctx, opts.avatar, 40, 60, 120);
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "bold 30px Sans, sans-serif";
  ctx.fillText(truncate(opts.name, 24), 320, 110);
  ctx.textAlign = "left";
  ctx.fillStyle = "#9aa0aa";
  ctx.font = "22px Sans, sans-serif";
  ctx.fillText("Nivel de arcoíris", 320, 148);
  ctx.fillStyle = "#ffed00";
  ctx.font = "bold 76px Sans, sans-serif";
  ctx.fillText(`${opts.percent}%`, 320, 240);
  ctx.fillStyle = "#26262b";
  ctx.fillRect(320, 270, W - 380, 16);
  ctx.fillStyle = "#e40303";
  ctx.fillRect(320, 270, ((W - 380) * opts.percent) / 100, 16);
  return canvas.toBuffer("image/png");
}

export function makeIqcCard(opts: { name: string; bio?: string; percent: number; avatar: Canvas }): Buffer {
  const W = 800, H = 360;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#171a21";
  ctx.fillRect(0, 0, W, 96);
  ctx.fillStyle = "#22c55e";
  ctx.font = "bold 30px Sans, sans-serif";
  ctx.fillText("Tarjeta de perfil", 32, 58);
  avatarCircle(ctx, opts.avatar, 40, 130, 95);
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "bold 36px Sans, sans-serif";
  ctx.fillText(truncate(opts.name, 24), 260, 175);
  ctx.fillStyle = "#9aa0aa";
  ctx.font = "22px Sans, sans-serif";
  ctx.fillText(truncate(opts.bio || "", 46), 260, 212);
  ctx.fillStyle = "#9aa0aa";
  ctx.font = "22px Sans, sans-serif";
  ctx.fillText("Coeficiente intelectual", 260, 262);
  ctx.fillStyle = "#22c55e";
  ctx.font = "bold 56px Sans, sans-serif";
  ctx.fillText(`${opts.percent}%`, 260, 322);
  ctx.fillStyle = "#26262b";
  ctx.fillRect(470, 292, 280, 14);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(470, 292, (280 * opts.percent) / 100, 14);
  return canvas.toBuffer("image/png");
}

// ─────────────────────────── Efectos de meme ───────────────────────────

export async function makeWantedPoster(imagePng: Buffer, reward: string): Promise<Buffer> {
  const W = 720, H = 920;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e8d9b5";
  ctx.fillRect(0, 0, W, H);
  // Bordes envejecidos
  ctx.strokeStyle = "#6b5a37";
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  ctx.fillStyle = "#2b2113";
  ctx.textAlign = "center";
  ctx.font = "bold 88px Sans, sans-serif";
  ctx.fillText("WANTED", W / 2, 120);
  ctx.font = "bold 30px Sans, sans-serif";
  ctx.fillText("DEAD OR ALIVE", W / 2, 170);
  const img = await loadImage(imagePng);
  {
    const box = { x: 70, y: 200, w: W - 140, h: 520 };
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();
    const scale = Math.max(box.w / img.width, box.h / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, box.x + (box.w - dw) / 2, box.y + (box.h - dh) / 2, dw, dh);
    ctx.restore();
    ctx.strokeStyle = "#2b2113";
    ctx.lineWidth = 8;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
  }
  ctx.fillStyle = "#2b2113";
  ctx.font = "bold 34px Sans, sans-serif";
  ctx.fillText("REWARD", W / 2, 790);
  ctx.font = "bold 52px Sans, sans-serif";
  ctx.fillText(`$${truncate(reward, 16)}`, W / 2, 855);
  return canvas.toBuffer("image/png");
}

export async function makeTriggeredImage(tintedPng: Buffer, imgW: number, imgH: number): Promise<Buffer> {
  const textH = 90;
  const canvas = createCanvas(imgW, imgH + textH);
  const ctx = canvas.getContext("2d");
  const img = await loadImage(tintedPng);
  ctx.drawImage(img, 0, 0, imgW, imgH);
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(0, imgH, imgW, textH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fs = fitFont(ctx, "TRIGGERED", imgW * 0.9, Math.round(textH * 0.7));
  ctx.font = `bold ${fs}px Sans, sans-serif`;
  ctx.fillText("TRIGGERED", imgW / 2, imgH + textH / 2);
  return canvas.toBuffer("image/png");
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/** Porcentaje pseudoaleatorio estable a partir de una semilla de texto/número. */
export function seededPercent(seed: string | number): number {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 101;
}

/** Validación simple de color hexadecimal. */
export function assertColor(value: string, field: string): string {
  if (!/^#?[0-9a-fA-F]{6}$/.test(value)) throw badRequest(`El parámetro «${field}» debe ser un color hexadecimal, p. ej. #22c55e`);
  return value.startsWith("#") ? value : `#${value}`;
}

// ─────────────────── Composición sobre plantillas propias ───────────────────
// Las plantillas (server/assets/canvas) son el lienzo; encima se dibujan los
// datos dinámicos en las zonas definidas en canvasLayout.ts. Si una plantilla
// no existe, estas funciones devuelven null y el handler usa el diseño generado.

import { getTemplate } from "./canvasTemplates";
import { LAYOUTS, type TemplateLayout, type TextSpot } from "./canvasLayout";

function serifText(ctx: SKRSContext2D, text: string, spot: TextSpot, W: number, H: number): void {
  if (!text) return;
  let content = spot.caps ? text.toUpperCase() : text;
  let size = Math.round(spot.size * H);
  const family = spot.bold ? "SerifBold" : "Serif";
  ctx.font = `${size}px ${family}, serif`;
  if (spot.maxW) {
    const max = spot.maxW * W;
    while (size > 12 && ctx.measureText(content).width > max) {
      size -= 2;
      ctx.font = `${size}px ${family}, serif`;
    }
  }
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = spot.color ?? "#f5f5f6";
  if (spot.glow) {
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = spot.glow;
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 4;
  }
  const x = spot.x * W;
  const y = spot.y * H;
  if (spot.italic) {
    ctx.translate(x, y);
    ctx.transform(1, 0, -0.22, 1, 0, 0);
    ctx.fillText(content, 0, 0);
  } else {
    ctx.fillText(content, x, y);
  }
  ctx.restore();
}

function drawZones(ctx: SKRSContext2D, W: number, H: number, layout: TemplateLayout, avatars: Canvas[], texts: string[]): void {
  // Placas sólidas para sobrescribir texto impreso de la plantilla
  for (const p of layout.plates ?? []) {
    ctx.fillStyle = "#0b0b0e";
    ctx.fillRect(p.x * W, p.y * H, p.w * W, p.h * H);
  }
  // Placas suaves (degradado en dos pasadas) para texto sobre el arte
  for (const p of layout.softPlates ?? []) {
    const cx = (p.x + p.w / 2) * W;
    const cy = (p.y + p.h / 2) * H;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(p.w * W, p.h * H) * 0.72);
    grad.addColorStop(0, "rgba(6,6,9,0.96)");
    grad.addColorStop(0.72, "rgba(6,6,9,0.82)");
    grad.addColorStop(1, "rgba(6,6,9,0)");
    ctx.fillStyle = grad;
    const rx = p.x * W - p.w * W * 0.2;
    const ry = p.y * H - p.h * H * 0.2;
    const rw = p.w * W * 1.4;
    const rh = p.h * H * 1.4;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillRect(rx, ry, rw, rh); // segunda pasada: opacidad compuesta
  }
  // Avatares recortados en círculo
  (layout.avatars ?? []).forEach((zone, i) => {
    const avatar = avatars[i];
    if (!avatar) return;
    const cx = zone.cx * W;
    const cy = zone.cy * H;
    const r = zone.r * W;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  });
  // Barra de progreso
  if (layout.bar) {
    const pctText = texts[0];
    const pct = Math.max(0, Math.min(100, Number.parseInt(pctText, 10) || 0));
    const z = layout.bar.zone;
    ctx.fillStyle = layout.bar.empty;
    ctx.fillRect(z.x * W, z.y * H, z.w * W, z.h * H);
    ctx.fillStyle = layout.bar.fill;
    ctx.fillRect(z.x * W, z.y * H, (z.w * W * pct) / 100, z.h * H);
  }
  // Textos dinámicos
  (layout.texts ?? []).forEach((spot, i) => serifText(ctx, texts[i] ?? "", spot, W, H));
}

async function compose(templateName: string, avatars: Canvas[], texts: string[]): Promise<Buffer | null> {
  const img = await getTemplate(templateName);
  if (!img) return null;
  const layout = LAYOUTS[templateName];
  if (!layout) return null;
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  drawZones(ctx, img.width, img.height, layout, avatars, texts);
  return canvas.toBuffer("image/png");
}

export async function templateWelcome(opts: {
  username: string; group: string; members: number; avatar: Canvas; kind: "welcome" | "goodbye";
}): Promise<Buffer | null> {
  const texts =
    opts.kind === "welcome"
      ? [`Miembro # ${opts.members}`, opts.username, opts.group]
      : [opts.username, opts.group];
  return compose(opts.kind === "welcome" ? "welcome" : "despedida", [opts.avatar], texts);
}

export async function templateShip(opts: {
  name1: string; name2: string; percent: number; avatar1: Canvas; avatar2: Canvas;
}): Promise<Buffer | null> {
  return compose("ship", [opts.avatar1, opts.avatar2], [
    `${opts.percent}%`,
    opts.name1,
    opts.name2
  ]);
}

export async function templateGay(opts: { name: string; percent: number; avatar: Canvas }): Promise<Buffer | null> {
  return compose("gay", [opts.avatar], [`${opts.percent}%`, opts.name]);
}

export async function templateIqc(opts: { name: string; bio?: string; percent: number; avatar: Canvas }): Promise<Buffer | null> {
  return compose("levelup", [opts.avatar], [
    "IQ",
    `${opts.percent}`,
    "Perfil",
    opts.name,
    opts.bio ?? ""
  ]);
}
