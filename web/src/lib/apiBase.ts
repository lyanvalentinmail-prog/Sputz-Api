/**
 * Base URL de la API para las peticiones del frontend.
 * - Por defecto es "" (rutas relativas /api/...): sirve cuando el frontend y el
 *   backend comparten origen (misma instancia de Express o proxy del dev server).
 * - Para desplegar el frontend aparte (p. ej. sitio estático en Render/Vercel),
 *   define VITE_API_BASE en el build con la URL pública del backend,
 *   por ejemplo: VITE_API_BASE=https://siputzx-api.onrender.com
 */
export const API_BASE: string =
  ((import.meta.env.VITE_API_BASE as string | undefined) ?? "").replace(/\/+$/, "");
