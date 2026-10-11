# SiputZX API — Playground

Playground y documentación interactiva de una API para bots de WhatsApp: **68 endpoints reales en 11 categorías**, buscador global, formularios de prueba por endpoint, subida de archivos con validación y un diseño minimalista de esquinas rectas que se adapta a móvil, tablet y PC.

> El nombre de la API se cambia en un solo sitio: la variable de entorno `API_NAME` (o `DEFAULT_API_NAME` en `shared/catalog.ts`). Toda la interfaz, las respuestas JSON y los ejemplos lo usan automáticamente.

---

## Tecnologías

| Capa      | Stack |
|-----------|-------|
| Frontend  | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend   | Node.js + Express + TypeScript |
| Imagen    | `sharp`, `@napi-rs/canvas`, `qrcode`, `gif-encoder-2`, `yazl` (ZIP) |
| Audio     | `@ffmpeg-installer/ffmpeg` (binario incluido vía npm) |
| Compartido| `shared/` — catálogo único de endpoints consumido por frontend y backend |

Arquitectura modular:

```
├── shared/            # Catálogo de endpoints (fuente única de verdad) y tipos
│   ├── catalog.ts     # 68 endpoints: rutas, métodos, parámetros, ejemplos
│   └── types.ts
├── server/
│   ├── src/
│   │   ├── app.ts / index.ts / router.ts / config.ts
│   │   ├── handlers/    # Un módulo por categoría (lógica de cada endpoint)
│   │   ├── services/    # canvasFx, imageFx, audioFx, external (proveedores)
│   │   ├── games/       # Motor de juegos con sesiones + banco de datos
│   │   └── lib/         # errores, HTTP, ffmpeg, yt-dlp, media, sniff, rate…
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── components/  # TopBar, Sidebar, Overview, EndpointList,
│   │   │                # EndpointDetails, ParamForm, ResponsePanel, CodeBlock…
│   │   ├── lib/         # runtime, tryRequest, codegen, format
│   │   └── App.tsx
│   └── vite.config.ts
└── .env.example
```

## Requisitos

- Node.js ≥ 18 (recomendado 20+)
- Sin bases de datos ni claves obligatorias: el servidor arranca sin `.env` y marca como «Falta credencial» o «No disponible» lo que no pueda servir.

## Instalación

```bash
npm install          # instala frontend y backend (workspaces)
cp .env.example .env # opcional: completa solo lo que vayas a usar
```

## Ejecución en desarrollo

```bash
npm run dev
# backend → http://localhost:3001  (API + /api/meta/status)
# frontend → http://localhost:5173 (proxy de /api hacia el backend)
```

O por separado: `npm run dev -w server` y `npm run dev -w web`.

## Compilar y arrancar en producción

```bash
npm run build        # compila backend (dist/) y frontend (web/dist/)
npm start            # Express sirve la API y el frontend compilado
```

Con `web/dist` presente, Express sirve la SPA en `/` y la API en `/api/*`: un único proceso para todo el despliegue.

## Verificación rápida

```bash
curl "http://localhost:3001/api/meta/status"
curl "http://localhost:3001/api/brat?text=hola" -o brat.png
curl "http://localhost:3001/api/calculate?expression=(2%2B3)*4%5E2"
curl -X POST http://localhost:3001/api/tictactoe -H 'Content-Type: application/json' -d '{}'
```

## Configuración (`.env`)

Ninguna variable es obligatoria. Copia `.env.example`. Resumen:

| Variable | Efecto |
|----------|--------|
| `API_NAME` | Nombre público mostrado en toda la web y respuestas |
| `PORT` | Puerto del backend (por defecto 3001) |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | Límite de solicitudes por IP |
| `MAX_UPLOAD_MB` | Tamaño máximo de subida |
| `FFMPEG_PATH` / `YTDLP_PATH` | Binarios externos opcionales |
| `OPENAI_API_KEY` | `/api/chatgpt`, `/api/imagine` |
| `BLACKBOX_API_KEY` / `BLACKBOX_BASE_URL` | `/api/blackbox` (proveedor compatible con OpenAI) |
| `REMOVEBG_API_KEY` | `/api/removebg` |
| `GOOGLE_API_KEY` / `GOOGLE_CSE_ID` | `/api/search/google` |
| `GOOGLE_VISION_API_KEY` | `/api/search/reverseimage` |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | `/api/music/spotify` |
| `SOUNDCLOUD_CLIENT_ID` | `/api/music/soundcloud` |
| `TINYURL_API_KEY` | `/api/tinyurl` |

Los endpoints que dependen de una credencial o servicio ausente devuelven `503` indicando exactamente qué falta, y la interfaz los marca con la etiqueta «Falta credencial». Los no implementados (Sticker.ly y Pinterest, que no ofrecen acceso público compatible) devuelven `501` y se muestran como «No disponible». **Nunca se inventan resultados ni se exponen claves en el frontend.**

Servicios gratuitos que funcionan sin clave: Jikan (anime/manga/frases), waifu.pics, LRCLIB (letras), Wikipedia, Openverse (imágenes), is.gd (acortar), Google Translate TTS y traducción, ffmpeg y todos los juegos/efectos locales.

`yt-dlp` (downloaders y búsqueda musical) se usa si está instalado en el sistema o si defines `YTDLP_PATH`; sin él, esos endpoints informan de que falta el servicio.

## Convención de la API

- Éxito JSON: `{ "status": true, "creator": "<API_NAME>", "data": … }`
- Error JSON: `{ "status": false, "creator": "<API_NAME>", "code": 400, "error": "mensaje en español" }`
- Binarios (imágenes, audio, ZIP) se devuelven con su `Content-Type`; los errores, siempre en JSON.
- Rutas coherentes por categoría: `/api/brat`, `/api/sticker`, `/api/welcome`, `/api/audio/reverse`, `/api/music/lyrics`, `/api/search/wikipedia`, `/api/2048`…
- Validación completa de parámetros (tipos, rangos, enums, longitudes) y de archivos (MIME real por bytes mágicos, tamaño, cantidad) en cliente **y** servidor.
- Rate limiting por IP configurable; tiempos de espera con `AbortController` en todas las llamadas externas.

## Despliegue

**Opción A — un solo servicio (recomendada):** compila con `npm run build` y ejecuta `npm start` en cualquier VPS/contenedor con Node ≥ 18 (Railway, Render, Fly.io…). Expón el puerto `PORT`.

**Opción B — separados:**
- Backend: desplega la carpeta `server` (comando de build `npm run build -w server`, arranque `npm start -w server`). Añade las variables de entorno que uses.
- Frontend: Vercel/Netlify con root en `web`; añade un rewrite de `/api/*` hacia la URL del backend (el frontend solo usa rutas relativas, así que no hay CORS ni claves expuestas).

## Licencia y uso

Proyecto de ejemplo para integrar en bots de WhatsApp. Usa únicamente APIs públicas o con credenciales propias; respeta los términos de cada proveedor y las restricciones de las plataformas de descarga.
