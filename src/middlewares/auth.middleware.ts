import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verificarToken } from '../utils/jwt';

/**
 * Middleware de autenticación: exige un JWT válido en el header
 * `Authorization: Bearer <token>` y guarda el id del cliente en `req.clienteId`.
 */
export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new ApiError(401, 'Token de autenticación requerido'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verificarToken(token);
    req.clienteId = payload.sub;
    next();
  } catch {
    next(new ApiError(401, 'Token inválido o expirado'));
  }
}
