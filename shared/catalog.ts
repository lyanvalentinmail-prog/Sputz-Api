import type { Category, Endpoint, Param } from "./types";

/** Nombre por defecto de la API. Cámbialo aquí o con la variable de entorno API_NAME. */
export const DEFAULT_API_NAME = "SiputZX API";
export const API_VERSION = "1.0.0";

/** Ayuda para definir parámetros de forma compacta */
function p(name: string, extra: Partial<Param> & { description: string }): Param {
  return { name, in: "query", type: "string", ...extra } as Param;
}
function f(name: string, extra: Partial<Param> & { description: string }): Param {
  return { name, in: "file", type: "file", accept: "image/*", maxSizeMB: 10, maxCount: 1, ...extra } as Param;
}
function b(name: string, extra: Partial<Param> & { description: string }): Param {
  return { name, in: "body", type: "string", ...extra } as Param;
}

export const CATEGORIES: Category[] = [
  { id: "stickers", name: "Stickers", icon: "sticker", description: "Creación y búsqueda de stickers para WhatsApp" },
  { id: "imagenes", name: "Imágenes", icon: "image", description: "Efectos y manipulaciones de imágenes" },
  { id: "canvas", name: "Canvas", icon: "canvas", description: "Tarjetas generadas con canvas (bienvenida, ship, perfil…)" },
  { id: "audio", name: "Audio", icon: "audio", description: "Texto a voz y efectos de audio" },
  { id: "downloader", name: "Downloader", icon: "download", description: "Descarga de contenido desde redes sociales" },
  { id: "tools", name: "Tools", icon: "tools", description: "Utilidades: QR, enlaces cortos, cálculo, traducción" },
  { id: "ia", name: "IA", icon: "ai", description: "Inteligencia artificial: chat, código e imágenes" },
  { id: "musica", name: "Música", icon: "music", description: "Búsqueda de canciones, letras y efectos" },
  { id: "anime", name: "Anime", icon: "anime", description: "Información e imágenes de anime y manga" },
  { id: "buscador", name: "Buscador", icon: "search", description: "Búsquedas en Google, Wikipedia, Pinterest e imágenes" },
  { id: "games", name: "Games", icon: "games", description: "Juegos con estado de partida gestionado por la API" }
];

export const ENDPOINTS: Endpoint[] = [
  // ═══════════════════════════ STICKERS ═══════════════════════════
  {
    id: "brat", name: "brat", category: "stickers", method: "GET", path: "/api/brat",
    description: "Crear stickers con estilo Brat.",
    params: [
      p("text", { required: true, maxLength: 100, description: "Texto del sticker (máx. 100 caracteres)" }),
      p("bg", { enum: ["lime", "black", "white"], default: "lime", description: "Color de fondo" }),
      p("size", { type: "number", default: 512, min: 128, max: 1024, description: "Tamaño de salida en píxeles" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "/api/brat?text=hola&bg=lime"
  },
  {
    id: "brathd", name: "brathd", category: "stickers", method: "GET", path: "/api/brathd",
    description: "Crear stickers Brat en alta definición.",
    params: [
      p("text", { required: true, maxLength: 100, description: "Texto del sticker" }),
      p("bg", { enum: ["lime", "black", "white"], default: "lime", description: "Color de fondo" }),
      p("size", { type: "number", default: 1024, min: 512, max: 2048, description: "Tamaño de salida en píxeles" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "/api/brathd?text=hd%20sticker"
  },
  {
    id: "bratv", name: "bratv", category: "stickers", method: "GET", path: "/api/bratv",
    description: "Crear stickers Brat verticales.",
    params: [
      p("text", { required: true, maxLength: 100, description: "Texto del sticker" }),
      p("bg", { enum: ["lime", "black", "white"], default: "lime", description: "Color de fondo" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "/api/bratv?text=vertical"
  },
  {
    id: "attp", name: "attp", category: "stickers", method: "GET", path: "/api/attp",
    description: "Convertir texto en stickers animados con efecto arcoíris (GIF).",
    params: [
      p("text", { required: true, maxLength: 60, description: "Texto del sticker animado" }),
      p("size", { type: "number", default: 512, min: 128, max: 512, description: "Tamaño del GIF en píxeles" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "/api/attp?text=arcoiris"
  },
  {
    id: "ttp", name: "ttp", category: "stickers", method: "GET", path: "/api/ttp",
    description: "Convertir texto en un sticker (PNG con borde).",
    params: [
      p("text", { required: true, maxLength: 100, description: "Texto del sticker" }),
      p("color", { default: "#22c55e", description: "Color del texto en hexadecimal" }),
      p("size", { type: "number", default: 512, min: 128, max: 1024, description: "Tamaño de salida en píxeles" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "/api/ttp?text=sticker&color=%2322c55e"
  },
  {
    id: "sticker", name: "sticker", category: "stickers", method: "POST", path: "/api/sticker",
    description: "Convertir imágenes o videos compatibles en stickers (WebP).",
    params: [
      f("file", { accept: "image/png,image/jpeg,image/webp,video/mp4", maxSizeMB: 25, description: "Imagen o video corto a convertir" }),
      p("url", { description: "URL pública de la imagen o video (alternativa a subir el archivo)" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/sticker  (multipart/form-data, campo \"file\")"
  },
  {
    id: "sticker-search", name: "search", category: "stickers", method: "GET", path: "/api/sticker/search",
    description: "Buscar stickers en Sticker.ly.",
    params: [p("q", { required: true, description: "Término de búsqueda" })],
    status: "unavailable", responseType: "json",
    unavailableReason: "Sticker.ly no ofrece una API pública ni términos de acceso compatibles; el endpoint no está implementado para no devolver datos inventados.",
    exampleRequest: "/api/sticker/search?q=cat",
    exampleResponse: { status: false, code: 501, error: "Endpoint no disponible: Sticker.ly no ofrece una API pública." }
  },
  {
    id: "spack", name: "spack", category: "stickers", method: "POST", path: "/api/spack",
    description: "Convertir varias fotos en un paquete de stickers (ZIP de WebP).",
    params: [
      f("files", { accept: "image/png,image/jpeg,image/webp", maxSizeMB: 10, maxCount: 10, description: "Entre 2 y 10 imágenes" }),
      p("name", { default: "pack", description: "Nombre del paquete" })
    ],
    status: "available", responseType: "zip",
    exampleRequest: "POST /api/spack  (multipart/form-data, campos \"files\")"
  },

  // ═══════════════════════════ IMÁGENES ═══════════════════════════
  {
    id: "blur", name: "blur", category: "imagenes", method: "POST", path: "/api/blur",
    description: "Aplicar desenfoque a una imagen.",
    params: [
      f("file", { description: "Imagen a procesar" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" }),
      p("amount", { type: "number", default: 5, min: 0.3, max: 50, description: "Intensidad del desenfoque (sigma)" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/blur?url=https://ejemplo.com/foto.jpg&amount=8"
  },
  {
    id: "darkness", name: "darkness", category: "imagenes", method: "POST", path: "/api/darkness",
    description: "Oscurecer una imagen.",
    params: [
      f("file", { description: "Imagen a procesar" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" }),
      p("level", { type: "number", default: 60, min: 1, max: 100, description: "Porcentaje de oscuridad" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/darkness?url=https://ejemplo.com/foto.jpg&level=70"
  },
  {
    id: "pixel", name: "pixel", category: "imagenes", method: "POST", path: "/api/pixel",
    description: "Aplicar un efecto pixelado.",
    params: [
      f("file", { description: "Imagen a procesar" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" }),
      p("scale", { type: "number", default: 8, min: 2, max: 64, description: "Tamaño del bloque de píxel" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/pixel?url=https://ejemplo.com/foto.jpg&scale=12"
  },
  {
    id: "wanted", name: "wanted", category: "imagenes", method: "POST", path: "/api/wanted",
    description: "Crear un póster de «Se busca».",
    params: [
      f("file", { description: "Imagen del rostro o persona" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" }),
      p("reward", { default: "1.000.000", maxLength: 30, description: "Texto de la recompensa" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/wanted?url=https://ejemplo.com/cara.jpg"
  },
  {
    id: "trigger", name: "trigger", category: "imagenes", method: "POST", path: "/api/trigger",
    description: "Aplicar un efecto visual de trigger (tinte rojo + «TRIGGERED»).",
    params: [
      f("file", { description: "Imagen a procesar" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/trigger?url=https://ejemplo.com/cara.jpg"
  },
  {
    id: "beautiful", name: "beautiful", category: "imagenes", method: "POST", path: "/api/beautiful",
    description: "Mejorar la apariencia de una imagen (luz, color y nitidez).",
    params: [
      f("file", { description: "Imagen a procesar" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/beautiful?url=https://ejemplo.com/foto.jpg"
  },

  // ═══════════════════════════ CANVAS ═══════════════════════════
  {
    id: "welcome", name: "welcome", category: "canvas", method: "POST", path: "/api/welcome",
    description: "Crear tarjetas de bienvenida para nuevos miembros.",
    params: [
      p("username", { required: true, maxLength: 40, description: "Nombre del usuario" }),
      p("avatar", { description: "URL pública del avatar" }),
      f("file", { description: "Archivo de avatar (alternativa a la URL)" }),
      p("group", { default: "Grupo", maxLength: 60, description: "Nombre del grupo" }),
      p("members", { type: "number", default: 1, min: 1, max: 10000000, description: "Número de miembros del grupo" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/welcome?username=Ana&avatar=https://ejemplo.com/avatar.jpg&group=Dev%20Team&members=42"
  },
  {
    id: "goodbye", name: "goodbye", category: "canvas", method: "POST", path: "/api/goodbye",
    description: "Crear tarjetas de despedida.",
    params: [
      p("username", { required: true, maxLength: 40, description: "Nombre del usuario" }),
      p("avatar", { description: "URL pública del avatar" }),
      f("file", { description: "Archivo de avatar (alternativa a la URL)" }),
      p("group", { default: "Grupo", maxLength: 60, description: "Nombre del grupo" }),
      p("members", { type: "number", default: 1, min: 1, max: 10000000, description: "Número de miembros del grupo" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/goodbye?username=Luis&group=Dev%20Team&members=41"
  },
  {
    id: "ship", name: "ship", category: "canvas", method: "POST", path: "/api/ship",
    description: "Crear tarjetas de compatibilidad entre dos personas.",
    params: [
      p("name1", { required: true, maxLength: 30, description: "Nombre de la primera persona" }),
      p("name2", { required: true, maxLength: 30, description: "Nombre de la segunda persona" }),
      p("avatar1", { description: "URL del avatar de la primera persona" }),
      p("avatar2", { description: "URL del avatar de la segunda persona" }),
      p("file", { in: "file", type: "file", accept: "image/*", maxSizeMB: 10, maxCount: 2, description: "Avatares subidos (alternativa a las URLs)" }),
      p("seed", { type: "number", description: "Semilla opcional para que el porcentaje sea estable" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/ship?name1=Ana&name2=Leo&seed=7"
  },
  {
    id: "gay", name: "gay", category: "canvas", method: "POST", path: "/api/gay",
    description: "Generar una tarjeta con un porcentaje y diseño arcoíris.",
    params: [
      p("name", { required: true, maxLength: 30, description: "Nombre a mostrar" }),
      p("avatar", { description: "URL pública del avatar" }),
      f("file", { description: "Archivo de avatar (alternativa a la URL)" }),
      p("seed", { type: "number", description: "Semilla opcional para que el porcentaje sea estable" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/gay?name=Carlos&seed=3"
  },
  {
    id: "iqc", name: "iqc", category: "canvas", method: "POST", path: "/api/iqc",
    description: "Crear tarjetas de perfil personalizadas con porcentaje de IQ.",
    params: [
      p("name", { required: true, maxLength: 30, description: "Nombre a mostrar" }),
      p("avatar", { description: "URL pública del avatar" }),
      f("file", { description: "Archivo de avatar (alternativa a la URL)" }),
      p("bio", { maxLength: 80, description: "Biografía corta opcional" }),
      p("seed", { type: "number", description: "Semilla opcional para que el porcentaje sea estable" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/iqc?name=Marta&bio=Desarrolladora"
  },

  // ═══════════════════════════ AUDIO ═══════════════════════════
  {
    id: "tts", name: "tts", category: "audio", method: "GET", path: "/api/tts",
    description: "Convertir texto en voz (MP3).",
    params: [
      p("text", { required: true, maxLength: 200, description: "Texto a convertir (máx. 200 caracteres)" }),
      p("lang", { default: "es", enum: ["es", "en", "pt", "fr", "de", "it", "ja", "ru", "ar", "zh-CN"], description: "Idioma de la voz" })
    ],
    status: "available", requiresService: "red", responseType: "audio",
    exampleRequest: "/api/tts?text=Hola%20mundo&lang=es"
  },
  {
    id: "audio-reverse", name: "reverse", category: "audio", method: "POST", path: "/api/audio/reverse",
    description: "Reproducir un audio al revés.",
    params: [f("file", { accept: "audio/*,video/mp4", maxSizeMB: 25, description: "Archivo de audio a invertir" })],
    status: "available", requiresService: "ffmpeg", responseType: "audio",
    exampleRequest: "POST /api/audio/reverse  (multipart/form-data, campo \"file\")"
  },
  {
    id: "audio-robot", name: "robot", category: "audio", method: "POST", path: "/api/audio/robot",
    description: "Aplicar un efecto de voz robótica.",
    params: [f("file", { accept: "audio/*,video/mp4", maxSizeMB: 25, description: "Archivo de audio a procesar" })],
    status: "available", requiresService: "ffmpeg", responseType: "audio",
    exampleRequest: "POST /api/audio/robot  (multipart/form-data, campo \"file\")"
  },
  {
    id: "audio-zueira", name: "zueira", category: "audio", method: "POST", path: "/api/audio/zueira",
    description: "Aplicar efectos humorísticos al audio (velocidad y tono).",
    params: [f("file", { accept: "audio/*,video/mp4", maxSizeMB: 25, description: "Archivo de audio a procesar" })],
    status: "available", requiresService: "ffmpeg", responseType: "audio",
    exampleRequest: "POST /api/audio/zueira  (multipart/form-data, campo \"file\")"
  },

  // ═══════════════════════════ DOWNLOADER ═══════════════════════════
  {
    id: "tiktok", name: "tiktok", category: "downloader", method: "GET", path: "/api/tiktok",
    description: "Procesar enlaces compatibles de TikTok.",
    params: [p("url", { required: true, description: "Enlace público del video de TikTok" })],
    status: "credentials", requiresService: "yt-dlp", responseType: "json",
    requiresEnv: [],
    exampleRequest: "/api/tiktok?url=https://www.tiktok.com/@usuario/video/123",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { platform: "tiktok", title: "Video de ejemplo", duration: 15, video: "https://…/video.mp4", audio: "https://…/audio.mp3" }
    }
  },
  {
    id: "instagram", name: "instagram", category: "downloader", method: "GET", path: "/api/instagram",
    description: "Procesar enlaces compatibles de Instagram.",
    params: [p("url", { required: true, description: "Enlace público del reel o video de Instagram" })],
    status: "credentials", requiresService: "yt-dlp", responseType: "json",
    exampleRequest: "/api/instagram?url=https://www.instagram.com/reel/ABC123/",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { platform: "instagram", title: "Reel de ejemplo", video: "https://…/video.mp4" }
    }
  },
  {
    id: "facebook", name: "facebook", category: "downloader", method: "GET", path: "/api/facebook",
    description: "Procesar enlaces compatibles de Facebook.",
    params: [p("url", { required: true, description: "Enlace público del video de Facebook" })],
    status: "credentials", requiresService: "yt-dlp", responseType: "json",
    exampleRequest: "/api/facebook?url=https://www.facebook.com/watch/?v=123",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { platform: "facebook", title: "Video de ejemplo", video: "https://…/video.mp4" }
    }
  },
  {
    id: "twitter", name: "twitter", category: "downloader", method: "GET", path: "/api/twitter",
    description: "Procesar enlaces compatibles de X.",
    params: [p("url", { required: true, description: "Enlace público del post con video de X" })],
    status: "credentials", requiresService: "yt-dlp", responseType: "json",
    exampleRequest: "/api/twitter?url=https://x.com/usuario/status/123",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { platform: "twitter", title: "Post de ejemplo", video: "https://…/video.mp4" }
    }
  },
  {
    id: "youtube", name: "youtube", category: "downloader", method: "GET", path: "/api/youtube",
    description: "Procesar enlaces compatibles de YouTube, respetando las restricciones aplicables.",
    params: [
      p("url", { required: true, description: "Enlace público del video de YouTube" }),
      p("quality", { enum: ["audio", "360", "720"], default: "360", description: "Formato de salida" })
    ],
    status: "credentials", requiresService: "yt-dlp", responseType: "json",
    exampleRequest: "/api/youtube?url=https://youtu.be/dQw4w9WgXcQ&quality=360",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { platform: "youtube", title: "Título del video", channel: "Canal", duration: 212, quality: "360", video: "https://…/video.mp4" }
    }
  },

  // ═══════════════════════════ TOOLS ═══════════════════════════
  {
    id: "qr", name: "qr", category: "tools", method: "GET", path: "/api/qr",
    description: "Generar códigos QR (PNG).",
    params: [
      p("text", { required: true, maxLength: 1000, description: "Texto o URL a codificar" }),
      p("size", { type: "number", default: 300, min: 64, max: 1024, description: "Tamaño en píxeles" }),
      p("dark", { default: "#000000", description: "Color del código (hexadecimal)" }),
      p("light", { default: "#ffffff", description: "Color de fondo (hexadecimal)" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "/api/qr?text=https://ejemplo.com&size=300"
  },
  {
    id: "shorturl", name: "shorturl", category: "tools", method: "GET", path: "/api/shorturl",
    description: "Acortar enlaces (mediante is.gd, sin necesidad de clave).",
    params: [p("url", { required: true, description: "URL válida a acortar (debe empezar por http/https)" })],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/shorturl?url=https://ejemplo.com/pagina-larga",
    exampleResponse: { status: true, creator: "SiputZX API", data: { original: "https://ejemplo.com/pagina-larga", short: "https://is.gd/AbCdEf", service: "is.gd" } }
  },
  {
    id: "tinyurl", name: "tinyurl", category: "tools", method: "GET", path: "/api/tinyurl",
    description: "Crear enlaces cortos mediante TinyURL (requiere API key).",
    params: [
      p("url", { required: true, description: "URL válida a acortar" }),
      p("alias", { maxLength: 30, description: "Alias personalizado opcional" })
    ],
    status: "credentials", requiresEnv: ["TINYURL_API_KEY"], responseType: "json",
    exampleRequest: "/api/tinyurl?url=https://ejemplo.com",
    exampleResponse: { status: true, creator: "SiputZX API", data: { original: "https://ejemplo.com", short: "https://tinyurl.com/mi-alias", service: "tinyurl" } }
  },
  {
    id: "calculate", name: "calculate", category: "tools", method: "GET", path: "/api/calculate",
    description: "Resolver operaciones matemáticas (+, -, *, /, %, ^, paréntesis).",
    params: [p("expression", { required: true, maxLength: 200, description: "Expresión matemática, p. ej. \"(2+3)*4^2\"" })],
    status: "available", responseType: "json",
    exampleRequest: "/api/calculate?expression=(2%2B3)*4%5E2",
    exampleResponse: { status: true, creator: "SiputZX API", data: { expression: "(2+3)*4^2", result: 80 } }
  },
  {
    id: "translate", name: "translate", category: "tools", method: "GET", path: "/api/translate",
    description: "Traducir textos entre idiomas.",
    params: [
      p("text", { required: true, maxLength: 2000, description: "Texto a traducir" }),
      p("to", { default: "en", description: "Idioma de destino (código ISO 639-1)" }),
      p("from", { default: "auto", description: "Idioma de origen (\"auto\" para detectarlo)" })
    ],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/translate?text=Hola%20mundo&to=en",
    exampleResponse: { status: true, creator: "SiputZX API", data: { from: "es", to: "en", text: "Hola mundo", translation: "Hello world" } }
  },

  // ═══════════════════════════ IA ═══════════════════════════
  {
    id: "chatgpt", name: "chatgpt", category: "ia", method: "POST", path: "/api/chatgpt",
    description: "Responder preguntas usando inteligencia artificial.",
    params: [
      b("prompt", { required: true, maxLength: 4000, description: "Pregunta o instrucción para el modelo" }),
      b("system", { maxLength: 1000, description: "Mensaje de sistema opcional" }),
      b("model", { default: "gpt-4o-mini", description: "Modelo de OpenAI a utilizar" })
    ],
    status: "credentials", requiresEnv: ["OPENAI_API_KEY"], responseType: "json",
    exampleRequest: "POST /api/chatgpt  {\"prompt\": \"¿Qué es una API REST?\"}",
    exampleResponse: { status: true, creator: "SiputZX API", data: { model: "gpt-4o-mini", answer: "Una API REST es…", usage: { prompt_tokens: 12, completion_tokens: 84, total_tokens: 96 } } }
  },
  {
    id: "blackbox", name: "blackbox", category: "ia", method: "POST", path: "/api/blackbox",
    description: "Ayudar con programación (proveedor compatible con OpenAI).",
    params: [
      b("prompt", { required: true, maxLength: 8000, description: "Consulta de programación" }),
      b("language", { maxLength: 40, description: "Lenguaje de programación de contexto" })
    ],
    status: "credentials", requiresEnv: ["BLACKBOX_API_KEY"], responseType: "json",
    exampleRequest: "POST /api/blackbox  {\"prompt\": \"Ordena un array en TypeScript\", \"language\": \"typescript\"}",
    exampleResponse: { status: true, creator: "SiputZX API", data: { answer: "Puedes usar arr.sort((a, b) => a - b)…", language: "typescript" } }
  },
  {
    id: "imagine", name: "imagine", category: "ia", method: "POST", path: "/api/imagine",
    description: "Generar imágenes desde texto.",
    params: [
      b("prompt", { required: true, maxLength: 1000, description: "Descripción de la imagen a generar" }),
      b("size", { default: "1024x1024", enum: ["1024x1024", "1792x1024", "1024x1792"], description: "Tamaño de la imagen" })
    ],
    status: "credentials", requiresEnv: ["OPENAI_API_KEY"], responseType: "json",
    exampleRequest: "POST /api/imagine  {\"prompt\": \"Un gato astronauta, estilo minimalista\"}",
    exampleResponse: { status: true, creator: "SiputZX API", data: { prompt: "Un gato astronauta…", revised_prompt: "…", image_url: "https://openai.com/…/image.png" } }
  },
  {
    id: "removebg", name: "removebg", category: "ia", method: "POST", path: "/api/removebg",
    description: "Eliminar fondos de imágenes (remove.bg).",
    params: [
      f("file", { description: "Imagen con fondo a eliminar" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" })
    ],
    status: "credentials", requiresEnv: ["REMOVEBG_API_KEY"], responseType: "image",
    exampleRequest: "POST /api/removebg?url=https://ejemplo.com/foto.jpg"
  },
  {
    id: "enhance", name: "enhance", category: "ia", method: "POST", path: "/api/enhance",
    description: "Mejorar la calidad de imágenes (reescalado y nitidez, procesado local).",
    params: [
      f("file", { description: "Imagen a mejorar" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" }),
      p("scale", { type: "number", default: 2, min: 2, max: 4, description: "Factor de reescalado" })
    ],
    status: "available", responseType: "image",
    exampleRequest: "POST /api/enhance?url=https://ejemplo.com/foto.jpg&scale=2"
  },

  // ═══════════════════════════ MÚSICA ═══════════════════════════
  {
    id: "play", name: "play", category: "musica", method: "GET", path: "/api/music/play",
    description: "Buscar canciones en YouTube y obtener enlaces de descarga.",
    params: [
      p("q", { required: true, maxLength: 120, description: "Nombre de la canción o artista" }),
      p("limit", { type: "number", default: 5, min: 1, max: 10, description: "Número de resultados" })
    ],
    status: "credentials", requiresService: "yt-dlp", responseType: "json",
    exampleRequest: "/api/music/play?q=never%20gonna%20give%20you%20up",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { query: "never gonna give you up", results: [{ title: "Rick Astley - Never Gonna Give You Up", channel: "Rick Astley", duration: 213, url: "https://youtu.be/dQw4w9WgXcQ" }] }
    }
  },
  {
    id: "lyrics", name: "lyrics", category: "musica", method: "GET", path: "/api/music/lyrics",
    description: "Buscar letras de canciones (LRCLIB, servicio gratuito).",
    params: [
      p("q", { required: true, maxLength: 120, description: "Canción y/o artista a buscar" }),
      p("limit", { type: "number", default: 1, min: 1, max: 10, description: "Número de resultados" })
    ],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/music/lyrics?q=bohemian%20rhapsody%20queen",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { results: [{ track: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: 354, lyrics: "Is this the real life?…" }] }
    }
  },
  {
    id: "spotify", name: "spotify", category: "musica", method: "GET", path: "/api/music/spotify",
    description: "Consultar información de canciones en Spotify.",
    params: [
      p("q", { required: true, maxLength: 120, description: "Canción o artista a buscar" }),
      p("limit", { type: "number", default: 5, min: 1, max: 10, description: "Número de resultados" })
    ],
    status: "credentials", requiresEnv: ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"], responseType: "json",
    exampleRequest: "/api/music/spotify?q=blinding%20lights",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { results: [{ track: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration_ms: 200040, popularity: 92, url: "https://open.spotify.com/track/…" }] }
    }
  },
  {
    id: "soundcloud", name: "soundcloud", category: "musica", method: "GET", path: "/api/music/soundcloud",
    description: "Buscar música en SoundCloud.",
    params: [p("q", { required: true, maxLength: 120, description: "Término de búsqueda" })],
    status: "credentials", requiresEnv: ["SOUNDCLOUD_CLIENT_ID"], responseType: "json",
    exampleRequest: "/api/music/soundcloud?q=lofi",
    exampleResponse: { status: true, creator: "SiputZX API", data: { results: [{ title: "lofi chill beat", artist: "producer1", duration_ms: 118000, url: "https://soundcloud.com/…" }] } }
  },
  {
    id: "bass", name: "bass", category: "musica", method: "POST", path: "/api/audio/bass",
    description: "Aplicar un efecto de bajos a un audio.",
    params: [
      f("file", { accept: "audio/*,video/mp4", maxSizeMB: 25, description: "Archivo de audio a procesar" }),
      p("gain", { type: "number", default: 15, min: 1, max: 30, description: "Ganancia de bajos en dB" })
    ],
    status: "available", requiresService: "ffmpeg", responseType: "audio",
    exampleRequest: "POST /api/audio/bass  (multipart/form-data, campo \"file\", gain=15)"
  },

  // ═══════════════════════════ ANIME ═══════════════════════════
  {
    id: "anime", name: "anime", category: "anime", method: "GET", path: "/api/anime",
    description: "Buscar información sobre animes (Jikan / MyAnimeList).",
    params: [
      p("q", { required: true, maxLength: 100, description: "Nombre del anime" }),
      p("limit", { type: "number", default: 5, min: 1, max: 10, description: "Número de resultados" })
    ],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/anime?q=one%20piece",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { results: [{ title: "One Piece", type: "TV", episodes: null, status: "Currently Airing", score: 8.7, year: 1999, url: "https://myanimelist.net/anime/21/One_Piece", synopsis: "Monkey D. Luffy…" }] }
    }
  },
  {
    id: "manga", name: "manga", category: "anime", method: "GET", path: "/api/manga",
    description: "Buscar información sobre mangas (Jikan / MyAnimeList).",
    params: [
      p("q", { required: true, maxLength: 100, description: "Nombre del manga" }),
      p("limit", { type: "number", default: 5, min: 1, max: 10, description: "Número de resultados" })
    ],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/manga?q=berserk",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { results: [{ title: "Berserk", type: "Manga", chapters: 364, status: "Publishing", score: 9.46, url: "https://myanimelist.net/manga/2/Berserk", synopsis: "Guts, un mercenario…" }] }
    }
  },
  {
    id: "waifu", name: "waifu", category: "anime", method: "GET", path: "/api/waifu",
    description: "Obtener imágenes de personajes de anime (waifu.pics).",
    params: [p("nsfw", { type: "boolean", default: false, description: "Incluir contenido NSFW (solo si el proveedor lo permite)" })],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/waifu",
    exampleResponse: { status: true, creator: "SiputZX API", data: { image: "https://i.waifu.pics/abc123.png" } }
  },
  {
    id: "neko", name: "neko", category: "anime", method: "GET", path: "/api/neko",
    description: "Obtener imágenes de temática anime y gatos (waifu.pics).",
    params: [p("nsfw", { type: "boolean", default: false, description: "Incluir contenido NSFW" })],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/neko",
    exampleResponse: { status: true, creator: "SiputZX API", data: { image: "https://i.waifu.pics/xyz789.jpg" } }
  },
  {
    id: "quoteanime", name: "quoteanime", category: "anime", method: "GET", path: "/api/quoteanime",
    description: "Mostrar frases de anime (Jikan Quotes).",
    params: [p("limit", { type: "number", default: 1, min: 1, max: 10, description: "Número de frases" })],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/quoteanime?limit=2",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { quotes: [{ quote: "People who can't throw something important away can never hope to change anything.", character: "Armin Arlert", anime: "Attack on Titan" }] }
    }
  },

  // ═══════════════════════════ BUSCADOR ═══════════════════════════
  {
    id: "google", name: "google", category: "buscador", method: "GET", path: "/api/search/google",
    description: "Buscar información mediante la API oficial de Google Custom Search.",
    params: [
      p("q", { required: true, maxLength: 200, description: "Término de búsqueda" }),
      p("limit", { type: "number", default: 5, min: 1, max: 10, description: "Número de resultados" })
    ],
    status: "credentials", requiresEnv: ["GOOGLE_API_KEY", "GOOGLE_CSE_ID"], responseType: "json",
    exampleRequest: "/api/search/google?q=documentaci%C3%B3n%20express",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { query: "documentación express", results: [{ title: "Express - Node.js web framework", snippet: "Express es un framework…", url: "https://expressjs.com/" }] }
    }
  },
  {
    id: "pinterest", name: "pinterest", category: "buscador", method: "GET", path: "/api/search/pinterest",
    description: "Buscar ideas e imágenes en Pinterest.",
    params: [p("q", { required: true, maxLength: 120, description: "Término de búsqueda" })],
    status: "unavailable", responseType: "json",
    unavailableReason: "La API oficial de Pinterest exige permisos de socio y no permite la búsqueda pública de pines; no hay un acceso compatible sin credenciales de socio.",
    exampleRequest: "/api/search/pinterest?q=decoraci%C3%B3n",
    exampleResponse: { status: false, code: 501, error: "Endpoint no disponible: la API de Pinterest requiere permisos de socio." }
  },
  {
    id: "wikipedia", name: "wikipedia", category: "buscador", method: "GET", path: "/api/search/wikipedia",
    description: "Consultar información de Wikipedia.",
    params: [
      p("q", { required: true, maxLength: 150, description: "Término a buscar" }),
      p("lang", { default: "es", enum: ["es", "en", "pt", "fr", "de", "it"], description: "Idioma de Wikipedia" })
    ],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/search/wikipedia?q=typescript",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { title: "TypeScript", summary: "TypeScript es un lenguaje de programación…", url: "https://es.wikipedia.org/wiki/TypeScript", thumbnail: "https://upload.wikimedia.org/…" }
    }
  },
  {
    id: "images", name: "images", category: "buscador", method: "GET", path: "/api/search/images",
    description: "Buscar imágenes en internet (Openverse, imágenes con licencia abierta).",
    params: [
      p("q", { required: true, maxLength: 150, description: "Término de búsqueda" }),
      p("limit", { type: "number", default: 10, min: 1, max: 20, description: "Número de resultados" })
    ],
    status: "available", requiresService: "red", responseType: "json",
    exampleRequest: "/api/search/images?q=gatos",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { query: "gatos", results: [{ title: "Gato doméstico", url: "https://…/foto.jpg", source: "Flickr", license: "by", creator: "Autor" }] }
    }
  },
  {
    id: "reverseimage", name: "reverseimage", category: "buscador", method: "POST", path: "/api/search/reverseimage",
    description: "Buscar imágenes visualmente similares (Google Cloud Vision).",
    params: [
      f("file", { description: "Imagen de referencia" }),
      p("url", { description: "URL pública de la imagen (alternativa a subir el archivo)" })
    ],
    status: "credentials", requiresEnv: ["GOOGLE_VISION_API_KEY"], responseType: "json",
    exampleRequest: "POST /api/search/reverseimage?url=https://ejemplo.com/foto.jpg",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { similar: [{ url: "https://…/similar1.jpg", score: 0.87 }], entities: ["Cat", "Whiskers"] }
    }
  },

  // ═══════════════════════════ GAMES ═══════════════════════════
  {
    id: "tictactoe", name: "tictactoe", category: "games", method: "POST", path: "/api/tictactoe",
    description: "Jugar al tres en raya contra la IA (minimax en dificultad difícil).",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una partida nueva" }),
      b("cell", { type: "number", min: 0, max: 8, description: "Casilla a jugar (0-8, fila por fila)" }),
      b("difficulty", { enum: ["easy", "hard"], default: "hard", description: "Dificultad de la IA" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/tictactoe  {\"cell\": 4}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { session: "ttt_9f2a1c", board: [null, null, null, null, "X", "O", null, null, null], turn: "X", winner: null, finished: false }
    }
  },
  {
    id: "trivia", name: "trivia", category: "games", method: "GET", path: "/api/trivia",
    description: "Responder preguntas de cultura general (banco local en español).",
    params: [
      p("amount", { type: "number", default: 1, min: 1, max: 10, description: "Número de preguntas" }),
      p("difficulty", { enum: ["facil", "medio", "dificil"], description: "Filtrar por dificultad" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "/api/trivia?amount=2",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { questions: [{ category: "Ciencia", difficulty: "facil", question: "¿Cuál es el símbolo químico del oro?", options: ["Au", "Ag", "Fe", "Or"], answer: "Au" }] }
    }
  },
  {
    id: "ptt", name: "ptt", category: "games", method: "POST", path: "/api/ptt",
    description: "Jugar piedra, papel o tijera contra la IA con marcador por sesión.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("move", { enum: ["piedra", "papel", "tijera"], required: true, description: "Tu jugada" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/ptt  {\"move\": \"piedra\"}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { session: "ptt_4b7e2d", you: "piedra", ai: "tijera", round: "ganaste", score: { you: 1, ai: 0, draws: 0, rounds: 1 } }
    }
  },
  {
    id: "guessnumber", name: "guessnumber", category: "games", method: "POST", path: "/api/guessnumber",
    description: "Adivinar un número secreto entre los límites indicados.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("guess", { type: "number", description: "Número que intentas adivinar" }),
      b("min", { type: "number", default: 1, description: "Límite inferior" }),
      b("max", { type: "number", default: 100, description: "Límite superior" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/guessnumber  {\"guess\": 42}",
    exampleResponse: { status: true, creator: "SiputZX API", data: { session: "gn_a91f3c", result: "mayor", attempts: 3, range: { min: 1, max: 100 }, finished: false } }
  },
  {
    id: "hangman", name: "hangman", category: "games", method: "POST", path: "/api/hangman",
    description: "Jugar al ahorcado con palabras en español.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("letter", { maxLength: 1, description: "Letra a intentar (a-z)" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/hangman  {\"letter\": \"a\"}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { session: "hm_7c1d90", word: "A _ _ A _ _", attemptsLeft: 5, wrongLetters: ["z"], hit: true, finished: false }
    }
  },
  {
    id: "wordle", name: "wordle", category: "games", method: "POST", path: "/api/wordle",
    description: "Adivinar una palabra de 5 letras en 6 intentos.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("word", { maxLength: 5, description: "Palabra de 5 letras a intentar" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/wordle  {\"word\": \"gatos\"}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: {
        session: "wd_2e8a44", attempt: 1, attemptsLeft: 5, finished: false,
        feedback: [{ letter: "g", state: "absent" }, { letter: "a", state: "misplaced" }, { letter: "t", state: "correct" }, { letter: "o", state: "correct" }, { letter: "s", state: "absent" }]
      }
    }
  },
  {
    id: "mathquiz", name: "mathquiz", category: "games", method: "POST", path: "/api/mathquiz",
    description: "Resolver operaciones matemáticas contra el reloj.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("answer", { type: "number", description: "Respuesta a la operación actual" }),
      b("timeLimit", { type: "number", default: 30, min: 5, max: 120, description: "Segundos por operación" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/mathquiz  {\"answer\": 24}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { session: "mq_f10b77", current: { expression: "7 * 3", expiresAt: "2026-10-11T12:00:30.000Z" }, score: 3, streak: 2, correct: true }
    }
  },
  {
    id: "slot", name: "slot", category: "games", method: "GET", path: "/api/slot",
    description: "Jugar a una tragamonedas virtual sin dinero real.",
    params: [p("bet", { type: "number", default: 10, min: 1, max: 1000, description: "Apuesta ficticia en créditos" })],
    status: "available", responseType: "json",
    exampleRequest: "/api/slot?bet=50",
    exampleResponse: { status: true, creator: "SiputZX API", data: { reels: ["🍒", "🍋", "🍒"], result: "pareja", bet: 50, won: 100, credits: 100 } }
  },
  {
    id: "dice", name: "dice", category: "games", method: "GET", path: "/api/dice",
    description: "Lanzar dados virtuales.",
    params: [
      p("count", { type: "number", default: 2, min: 1, max: 10, description: "Número de dados" }),
      p("sides", { type: "number", default: 6, min: 2, max: 100, description: "Caras por dado" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "/api/dice?count=3&sides=6",
    exampleResponse: { status: true, creator: "SiputZX API", data: { rolls: [4, 1, 6], total: 11, dice: 3, sides: 6 } }
  },
  {
    id: "coinflip", name: "coinflip", category: "games", method: "GET", path: "/api/coinflip",
    description: "Lanzar una moneda virtual.",
    params: [p("count", { type: "number", default: 1, min: 1, max: 100, description: "Número de lanzamientos" })],
    status: "available", responseType: "json",
    exampleRequest: "/api/coinflip?count=5",
    exampleResponse: { status: true, creator: "SiputZX API", data: { flips: ["cara", "cruz", "cara", "cara", "cruz"], caras: 3, cruces: 2 } }
  },
  {
    id: "quiz", name: "quiz", category: "games", method: "GET", path: "/api/quiz",
    description: "Contestar preguntas por categorías.",
    params: [
      p("category", { enum: ["ciencia", "historia", "geografia", "tecnologia", "cine", "deportes"], description: "Categoría de las preguntas (todas si se omite)" }),
      p("amount", { type: "number", default: 3, min: 1, max: 10, description: "Número de preguntas" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "/api/quiz?category=ciencia&amount=2",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { questions: [{ category: "ciencia", difficulty: "medio", question: "¿Qué planeta tiene más lunas?", options: ["Júpiter", "Saturno", "Urano", "Neptuno"], answer: "Saturno" }] }
    }
  },
  {
    id: "riddle", name: "riddle", category: "games", method: "GET", path: "/api/riddle",
    description: "Resolver acertijos en español.",
    params: [
      p("amount", { type: "number", default: 1, min: 1, max: 5, description: "Número de acertijos" }),
      p("reveal", { type: "boolean", default: false, description: "Incluir la respuesta" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "/api/riddle?amount=1",
    exampleResponse: { status: true, creator: "SiputZX API", data: { riddles: [{ riddle: "Cuanto más le quitas, más grande se hace. ¿Qué es?", answer: null }] } }
  },
  {
    id: "memory", name: "memory", category: "games", method: "POST", path: "/api/memory",
    description: "Encontrar parejas de cartas en un tablero 4×4.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("card", { type: "number", min: 0, max: 15, description: "Índice de la carta a voltear (0-15)" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/memory  {\"card\": 3}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { session: "mm_c4e211", board: ["🍎", "❓", "❓", "🍋"], matched: 2, moves: 4, finished: false }
    }
  },
  {
    id: "snake", name: "snake", category: "games", method: "POST", path: "/api/snake",
    description: "Jugar al clásico juego de la serpiente, paso a paso.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("direction", { enum: ["up", "down", "left", "right"], description: "Nueva dirección antes de avanzar" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/snake  {\"direction\": \"right\"}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { session: "sn_8a2f10", grid: 12, snake: [{ x: 5, y: 6 }, { x: 4, y: 6 }], food: { x: 9, y: 3 }, score: 1, alive: true }
    }
  },
  {
    id: "g2048", name: "2048", category: "games", method: "POST", path: "/api/2048",
    description: "Combinar números hasta conseguir 2048.",
    params: [
      b("session", { description: "ID de partida; si se omite, se crea una nueva" }),
      b("move", { enum: ["up", "down", "left", "right"], description: "Movimiento a realizar" })
    ],
    status: "available", responseType: "json",
    exampleRequest: "POST /api/2048  {\"move\": \"left\"}",
    exampleResponse: {
      status: true, creator: "SiputZX API",
      data: { session: "g2048_5d90cc", board: [[2, 4, 0, 0], [0, 2, 0, 0], [0, 0, 0, 0], [0, 0, 4, 2]], score: 12, finished: false, won: false }
    }
  }
];

export function getEndpoint(id: string): Endpoint | undefined {
  return ENDPOINTS.find((e) => e.id === id);
}

export function endpointsByCategory(categoryId: string): Endpoint[] {
  return ENDPOINTS.filter((e) => e.category === categoryId);
}
