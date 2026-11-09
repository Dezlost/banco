import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { routes } from './routes';
import { healthRouter } from './routes/health.route';

export const app = express();

app.disable('x-powered-by');

// helmet con CSP deshabilitado para no bloquear los recursos inline de Swagger UI.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'Banco API',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
  });
});

app.use('/health', healthRouter);
app.use('/api', routes);

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Banco API - Documentación' }),
);
app.get('/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use(notFoundHandler);
app.use(errorHandler);
