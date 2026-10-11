/** Error de API con código HTTP y mensaje en español. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (msg: string) => new ApiError(400, msg);
export const notFound = (msg = "Recurso no encontrado") => new ApiError(404, msg);
export const tooLarge = (msg: string) => new ApiError(413, msg);
export const timeout = (msg = "Tiempo de espera agotado al contactar con el servicio externo") => new ApiError(504, msg);
export const upstream = (msg: string) => new ApiError(502, msg);
export const serviceMissing = (service: string) =>
  new ApiError(503, `Este endpoint requiere el servicio «${service}», que no está disponible en el servidor. Configúralo e inténtalo de nuevo.`);
export const credMissing = (vars: string[]) =>
  new ApiError(503, `Faltan credenciales para usar este endpoint: ${vars.join(", ")}. Añádelas al archivo .env del servidor.`);
export const notImplemented = (reason: string) => new ApiError(501, `Endpoint no disponible: ${reason}`);
