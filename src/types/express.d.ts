/**
 * Extiende el tipo Request de Express para incluir el cliente autenticado.
 * El middleware `autenticar` completa esta propiedad después de validar el JWT.
 */
declare global {
  namespace Express {
    interface Request {
      clienteId?: string;
    }
  }
}

export {};
