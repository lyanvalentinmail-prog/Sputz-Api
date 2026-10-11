import { createApp } from "./app";
import { config } from "./config";
import { ENDPOINTS } from "../../shared/catalog";
import { HANDLERS } from "./handlers";
import { ffmpegAvailable } from "./lib/ffmpeg";

const app = createApp();

app.listen(config.port, "0.0.0.0", () => {
  const implemented = ENDPOINTS.filter((e) => HANDLERS[e.id]).length;
  console.log(`┌──────────────────────────────────────────────`);
  console.log(`│ ${config.apiName} — backend activo`);
  console.log(`│ http://0.0.0.0:${config.port}`);
  console.log(`│ Endpoints en catálogo: ${ENDPOINTS.length} (con handler real: ${implemented})`);
  console.log(`│ ffmpeg: ${ffmpegAvailable() ? "disponible" : "NO disponible"} · rate limit: ${config.rateLimit.max} req / ${config.rateLimit.windowMs / 1000}s`);
  console.log(`└──────────────────────────────────────────────`);
});
