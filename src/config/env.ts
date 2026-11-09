import 'dotenv/config';
import { z } from 'zod';

/**
 * Define y valida las variables de entorno al arrancar.
 * Si falta alguna variable obligatoria, el proceso termina con un mensaje claro.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().min(1).default('1h'),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error('❌ Variables de entorno inválidas:');
  console.error(resultado.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = resultado.data;
