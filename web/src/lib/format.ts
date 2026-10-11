/** Utilidades de formato y explicación de errores. */

export function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Explicación en español claro de los códigos HTTP habituales de esta API. */
export function explainStatus(status: number): string | null {
  if (status === 0) return "No se pudo conectar con el servidor. Comprueba que el backend esté activo (npm run dev -w server).";
  if (status >= 200 && status < 300) return null;
  const map: Record<number, string> = {
    400: "Solicitud incorrecta: falta un parámetro obligatorio o un valor no es válido. Revisa el mensaje de error y el formulario.",
    401: "No autorizado: esta ruta requiere autenticación.",
    404: "Ruta o recurso no encontrado.",
    413: "El archivo enviado es demasiado grande para el límite del servidor.",
    415: "El tipo de archivo enviado no es compatible con este endpoint.",
    429: "Has superado el límite de solicitudes por minuto. Espera unos segundos antes de reintentar.",
    501: "Este endpoint no está implementado todavía (marcado como «No disponible»).",
    502: "El servicio externo del que depende este endpoint falló o devolvió una respuesta inesperada.",
    503: "Falta una credencial o un servicio externo en el servidor (consulta el mensaje de error para saber cuál).",
    504: "El servicio externo tardó demasiado en responder (tiempo de espera agotado)."
  };
  return map[status] ?? (status >= 500 ? "Error interno del servidor. Revisa los logs del backend." : "La solicitud no se completó correctamente.");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const done = document.execCommand("copy");
      document.body.removeChild(ta);
      return done;
    } catch {
      return false;
    }
  }
}
