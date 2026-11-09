import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

interface RespuestaError {
  error: {
    message: string;
    details?: unknown;
  };
}

function responder(res: Response, statusCode: number, message: string, details?: unknown): void {
  const cuerpo: RespuestaError = { error: { message } };
  if (details !== undefined) {
    cuerpo.error.details = details;
  }
  res.status(statusCode).json(cuerpo);
}

/** Middleware para rutas inexistentes. */
export function notFoundHandler(req: Request, res: Response): void {
  responder(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
}

/**
 * Middleware central de errores.
 * Traduce errores de dominio, validación y Prisma a respuestas JSON uniformes.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    responder(res, error.statusCode, error.message, error.details);
    return;
  }

  if (error instanceof ZodError) {
    responder(res, 400, 'Datos inválidos', error.flatten());
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      responder(res, 409, 'Ya existe un registro con esos datos', error.meta);
      return;
    }

    if (error.code === 'P2025') {
      responder(res, 404, 'El registro solicitado no existe');
      return;
    }
  }

  console.error('❌ Error no controlado:', error);
  responder(res, 500, 'Error interno del servidor');
}
