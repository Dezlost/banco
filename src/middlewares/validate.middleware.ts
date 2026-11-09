import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware de validación de body con Zod.
 * Si los datos son válidos, reemplaza `req.body` por el resultado parseado
 * (con transformaciones y valores por defecto aplicados).
 */
export function validarBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      next(new ApiError(400, 'Datos inválidos', resultado.error.flatten()));
      return;
    }

    req.body = resultado.data;
    next();
  };
}
