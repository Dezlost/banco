import { NextFunction, Request, RequestHandler, Response } from 'express';

type ManejadorAsync = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Envuelve un controlador asíncrono para que cualquier excepción
 * sea derivada al middleware de errores de Express.
 */
export const asyncHandler = (fn: ManejadorAsync): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
