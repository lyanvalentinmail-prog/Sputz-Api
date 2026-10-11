/**
 * Integraciones con servicios externos.
 * Cada función llama a la API real del proveedor; si el proveedor falla
 * o falta una credencial, se lanza un ApiError con la explicación.
 */
import { config } from "../config";
import { assertHttpUrl, fetchJson, fetchWithTimeout } from "../lib/http";
import { badRequest, credMissing, serviceMissing, upstream } from "../lib/errors";

// ─── Anime: Jikan (MyAnimeList) ───────────────────────────────────
export async function jikanSearch(kind: "anime" | "manga", q: string, limit: number) {
  const url = `https://api.jikan.moe/v4/${kind}?q=${encodeURIComponent(q)}&limit=${limit}&sfw=true`;
  const data = await fetchJson<{ data: Array<Record<string, unknown>> }>(url, {}, 15000);
  return data.data.map((a) => ({
    id: a.mal_id,
    title: a.title ?? (a as { title_english?: string }).title_english,
    type: a.type,
    episodes: kind === "anime" ? a.episodes : undefined,
    chapters: kind === "manga" ? a.chapters : undefined,
    status: a.status,
    score: a.score,
    year: (a as { year?: number }).year ?? (((a as { aired?: { from?: string } }).aired?.from || "").slice(0, 4) || null),
    url: a.url,
    image: (a.images as Record<string, { image_url?: string }> | undefined)?.jpg?.image_url ?? null,
    synopsis: typeof a.synopsis === "string" ? a.synopsis.slice(0, 300) : null
  }));
}

export async function jikanQuotes(limit: number) {
  const data = await fetchJson<{ data: Array<{ quote: string; author: string; anime: { mal_id: number; title: string } }> }>(
    `https://api.jikan.moe/v4/quotes?page=1&limit=${limit}`, {}, 15000
  );
  return data.data.map((q) => ({ quote: q.quote, character: q.author, anime: q.anime?.title }));
}

// ─── Imágenes anime: waifu.pics ───────────────────────────────────
export async function waifuPics(kind: "waifu" | "neko", nsfw: boolean) {
  const url = `https://api.waifu.pics/${nsfw ? "nsfw" : "sfw"}/${kind}`;
  const data = await fetchJson<{ url: string }>(url, {}, 12000);
  if (!data.url) throw upstream("waifu.pics no devolvió una imagen");
  return data.url;
}

// ─── Letras: LRCLIB ───────────────────────────────────────────────
export async function lrclibSearch(q: string, limit: number) {
  const data = await fetchJson<Array<{ trackName: string; artistName: string; albumName?: string; duration?: number; plainLyrics?: string; syncedLyrics?: string }>>(
    `https://lrclib.net/api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { headers: { "User-Agent": "SiputZX-API/1.0 (playground)" } },
    15000
  );
  return data.map((r) => ({
    track: r.trackName,
    artist: r.artistName,
    album: r.albumName ?? null,
    duration: r.duration ?? null,
    lyrics: (r.plainLyrics || r.syncedLyrics || "").slice(0, 3000) || null,
    synced: Boolean(r.syncedLyrics)
  }));
}

// ─── Wikipedia ────────────────────────────────────────────────────
export async function wikipediaSearch(q: string, lang: string) {
  const base = `https://${encodeURIComponent(lang)}.wikipedia.org`;
  const search = await fetchJson<{ query?: { search?: Array<{ title: string }> } }>(
    `${base}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=1&format=json`, {}, 15000
  );
  const title = search.query?.search?.[0]?.title;
  if (!title) throw badRequest(`No se encontró ningún artículo de Wikipedia para «${q}»`);
  const summary = await fetchJson<{ title: string; extract: string; content_urls?: { desktop?: { page?: string } }; thumbnail?: { source?: string } }>(
    `${base}/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {}, 15000
  );
  return {
    title: summary.title,
    summary: summary.extract,
    url: summary.content_urls?.desktop?.page ?? `${base}/wiki/${encodeURIComponent(title)}`,
    thumbnail: summary.thumbnail?.source ?? null
  };
}

// ─── Openverse (búsqueda de imágenes abiertas) ────────────────────
export async function openverseImages(q: string, limit: number) {
  const data = await fetchJson<{ results: Array<{ title: string; url: string; source: string; license: string; creator?: string; foreign_landing_url?: string }> }>(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=${limit}`,
    { headers: { "User-Agent": "SiputZX-API/1.0" } },
    15000
  );
  return data.results.map((r) => ({
    title: r.title || "(sin título)",
    url: r.url,
    source: r.source,
    license: r.license,
    creator: r.creator ?? null,
    page: r.foreign_landing_url ?? null
  }));
}

// ─── Acortadores de URL ───────────────────────────────────────────
export async function isgdShorten(url: string): Promise<string> {
  assertHttpUrl(url);
  const data = await fetchJson<{ shorturl?: string; message?: string; errorcode?: number } | string>(
    `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`, {}, 12000
  );
  if (typeof data === "string") throw upstream("is.gd devolvió una respuesta inesperada");
  if (!data.shorturl) throw upstream(`is.gd rechazó la URL: ${data.message ?? "motivo desconocido"}`);
  return data.shorturl;
}

export async function tinyurlShorten(url: string, alias?: string): Promise<string> {
  if (!config.env.TINYURL_API_KEY) throw credMissing(["TINYURL_API_KEY"]);
  assertHttpUrl(url);
  const res = await fetchWithTimeout("https://api.tinyurl.com/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.env.TINYURL_API_KEY}` },
    body: JSON.stringify({ url, alias: alias || undefined, domain: "tinyurl.com" })
  }, 12000);
  const data = (await res.json()) as { code: number; data?: { tiny_url?: string }; errors?: Array<{ message: string }> };
  if (data.code !== 0 || !data.data?.tiny_url) throw upstream(`TinyURL: ${data.errors?.[0]?.message ?? `error ${data.code}`}`);
  return data.data.tiny_url;
}

// ─── Traducción (endpoint público de Google) ──────────────────────
export async function googleTranslate(text: string, to: string, from = "auto") {
  const sl = from === "auto" ? "auto" : from;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;
  const data = await fetchJson<unknown[][]>(url, { headers: { "User-Agent": "Mozilla/5.0" } }, 12000);
  const parts = Array.isArray(data?.[0]) ? (data[0] as unknown[][]) : [];
  const translation = parts.map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
  const detected = typeof data?.[2] === "string" ? data[2] : sl;
  if (!translation) throw serviceMissing("Google Translate no devolvió traducción (posible bloqueo regional)");
  return { from: detected, translation };
}

// ─── Google Custom Search ─────────────────────────────────────────
export async function googleCse(q: string, limit: number) {
  if (!config.env.GOOGLE_API_KEY || !config.env.GOOGLE_CSE_ID) throw credMissing(["GOOGLE_API_KEY", "GOOGLE_CSE_ID"]);
  const data = await fetchJson<{ items?: Array<{ title: string; link: string; snippet?: string; pagemap?: { cse_thumbnail?: Array<{ src?: string }> } }> }>(
    `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(config.env.GOOGLE_API_KEY)}&cx=${encodeURIComponent(config.env.GOOGLE_CSE_ID)}&q=${encodeURIComponent(q)}&num=${limit}`,
    {}, 15000
  );
  return (data.items ?? []).map((it) => ({
    title: it.title,
    url: it.link,
    snippet: it.snippet ?? null,
    thumbnail: it.pagemap?.cse_thumbnail?.[0]?.src ?? null
  }));
}

// ─── Google Cloud Vision (búsqueda inversa) ───────────────────────
export async function googleVisionWebDetect(imageBase64: string, imageUrl?: string) {
  if (!config.env.GOOGLE_VISION_API_KEY) throw credMissing(["GOOGLE_VISION_API_KEY"]);
  const body = imageUrl
    ? { requests: [{ image: { source: { imageUri: imageUrl } }, features: [{ type: "WEB_DETECTION" }, { type: "LABEL_DETECTION" }] }] }
    : { requests: [{ image: { content: imageBase64 }, features: [{ type: "WEB_DETECTION" }, { type: "LABEL_DETECTION" }] }] };
  const res = await fetchWithTimeout(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(config.env.GOOGLE_VISION_API_KEY)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  }, 20000);
  const data = (await res.json()) as { responses?: Array<{ webDetection?: { visuallySimilarImages?: Array<{ url: string; score?: number }>; webEntities?: Array<{ description?: string; score?: number }> }; labelAnnotations?: Array<{ description: string; score: number }>; error?: { message: string } }> };
  if (!res.ok || data.responses?.[0]?.error) throw upstream(`Google Vision: ${data.responses?.[0]?.error?.message ?? `HTTP ${res.status}`}`);
  const r = data.responses?.[0];
  return {
    similar: (r?.webDetection?.visuallySimilarImages ?? []).slice(0, 10).map((s) => ({ url: s.url, score: s.score ?? null })),
    entities: (r?.labelAnnotations ?? []).map((l) => l.description)
  };
}

// ─── OpenAI ───────────────────────────────────────────────────────
export async function openaiChat(prompt: string, opts: { system?: string; model?: string } = {}) {
  if (!config.env.OPENAI_API_KEY) throw credMissing(["OPENAI_API_KEY"]);
  const model = opts.model || "gpt-4o-mini";
  const messages = [
    ...(opts.system ? [{ role: "system", content: opts.system }] : []),
    { role: "user", content: prompt }
  ];
  const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model, messages, max_tokens: 700 })
  }, 60000);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; usage?: Record<string, number>; error?: { message: string } };
  if (!res.ok || data.error) throw upstream(`OpenAI: ${data.error?.message ?? `HTTP ${res.status}`}`);
  return { model, answer: data.choices?.[0]?.message?.content ?? "", usage: data.usage ?? null };
}

export async function openaiImage(prompt: string, size: string) {
  if (!config.env.OPENAI_API_KEY) throw credMissing(["OPENAI_API_KEY"]);
  const res = await fetchWithTimeout("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size, response_format: "url" })
  }, 120000);
  const data = (await res.json()) as { data?: Array<{ url?: string; revised_prompt?: string }>; error?: { message: string } };
  if (!res.ok || data.error) throw upstream(`OpenAI Images: ${data.error?.message ?? `HTTP ${res.status}`}`);
  return { image_url: data.data?.[0]?.url ?? null, revised_prompt: data.data?.[0]?.revised_prompt ?? null };
}

/** Proveedor de chat compatible con OpenAI (Blackbox u otros). */
export async function openaiCompatibleChat(envKey: string, envBase: string, prompt: string, system?: string) {
  const key = (config.env as Record<string, string>)[envKey];
  const base = (config.env as Record<string, string>)[envBase];
  if (!key) throw credMissing([envKey]);
  const endpoint = `${(base || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`;
  const messages = [
    ...(system ? [{ role: "system", content: system }] : []),
    { role: "user", content: prompt }
  ];
  const res = await fetchWithTimeout(endpoint, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "blackboxai", messages, max_tokens: 1200 })
  }, 60000);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message: string } };
  if (!res.ok || data.error) throw upstream(`Proveedor IA: ${data.error?.message ?? `HTTP ${res.status}`}`);
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── remove.bg ────────────────────────────────────────────────────
export async function removeBg(imageBuffer: Buffer, filename: string): Promise<Buffer> {
  if (!config.env.REMOVEBG_API_KEY) throw credMissing(["REMOVEBG_API_KEY"]);
  const form = new FormData();
  form.append("image_file", new Blob([imageBuffer]), filename);
  form.append("size", "auto");
  form.append("format", "png");
  const res = await fetchWithTimeout("https://api.remove.bg/v1.0/removebg", {
    method: "POST", headers: { "X-Api-Key": config.env.REMOVEBG_API_KEY }, body: form
  }, 60000);
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { errors?: Array<{ title?: string }> } | null;
    throw upstream(`remove.bg: ${err?.errors?.[0]?.title ?? `HTTP ${res.status}`}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ─── Spotify ──────────────────────────────────────────────────────
let spotifyTokenCache: { token: string; expiresAt: number } | null = null;
async function spotifyToken(): Promise<string> {
  if (!config.env.SPOTIFY_CLIENT_ID || !config.env.SPOTIFY_CLIENT_SECRET) throw credMissing(["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"]);
  if (spotifyTokenCache && spotifyTokenCache.expiresAt > Date.now() + 30000) return spotifyTokenCache.token;
  const basic = Buffer.from(`${config.env.SPOTIFY_CLIENT_ID}:${config.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetchWithTimeout("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  }, 12000);
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!data.access_token) throw upstream(`Spotify no otorgó token: ${data.error_description ?? "desconocido"}`);
  spotifyTokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return spotifyTokenCache.token;
}

export async function spotifySearch(q: string, limit: number) {
  const token = await spotifyToken();
  const data = await fetchJson<{ tracks?: { items: Array<{ name: string; external_urls: { spotify: string }; artists: Array<{ name: string }>; album: { name: string }; duration_ms: number; popularity: number }> } }>(
    `https://api.spotify.com/v1/search?type=track&limit=${limit}&q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${token}` } }, 15000
  );
  return (data.tracks?.items ?? []).map((t) => ({
    track: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    duration_ms: t.duration_ms,
    popularity: t.popularity,
    url: t.external_urls.spotify,
    preview: null
  }));
}

// ─── SoundCloud ───────────────────────────────────────────────────
export async function soundcloudSearch(q: string) {
  if (!config.env.SOUNDCLOUD_CLIENT_ID) throw credMissing(["SOUNDCLOUD_CLIENT_ID"]);
  const data = await fetchJson<{ collection: Array<{ title: string; user: { username: string }; duration: number; permalink_url: string }> }>(
    `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&client_id=${encodeURIComponent(config.env.SOUNDCLOUD_CLIENT_ID)}&limit=10`,
    {}, 15000
  );
  return data.collection.map((t) => ({
    title: t.title,
    artist: t.user.username,
    duration_ms: t.duration,
    url: t.permalink_url
  }));
}
