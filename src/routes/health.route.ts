import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const healthRouter = Router();

/**
 * GET /health
 * Verifica que la API esté viva y que la base de datos responda.
 */
healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'up',
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      database: 'down',
      timestamp: new Date().toISOString(),
    });
  }
});
