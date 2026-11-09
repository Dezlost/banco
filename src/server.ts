import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Banco API escuchando en http://localhost:${env.PORT}`);
  console.log(`📘 Documentación Swagger: http://localhost:${env.PORT}/docs`);
  console.log(`❤️  Healthcheck: http://localhost:${env.PORT}/health`);
  console.log(`🌎 Entorno: ${env.NODE_ENV}`);
});

let cerrando = false;

/** Cierre ordenado: deja de aceptar requests y desconecta Prisma. */
async function cerrar(signal: string): Promise<void> {
  if (cerrando) {
    return;
  }
  cerrando = true;

  console.log(`\n${signal} recibido. Cerrando servidor...`);

  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });

  // Fuerza la salida si alguna conexión queda colgada.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => void cerrar('SIGINT'));
process.on('SIGTERM', () => void cerrar('SIGTERM'));
