/**
 * Error de aplicación con código HTTP y detalles opcionales.
 * El middleware de errores lo transforma en una respuesta JSON uniforme.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
