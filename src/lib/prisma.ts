import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Instancia única de Prisma Client para toda la aplicación.
 * Se reutiliza para evitar abrir múltiples pools de conexiones.
 */
export const prisma = new PrismaClient();

/**
 * Cliente de base de datos que puede ser el cliente global o el cliente
 * transaccional que Prisma entrega dentro de `prisma.$transaction`.
 * PrismaClient es asignable a este tipo, por lo que los modelos funcionan
 * tanto dentro como fuera de una transacción.
 */
export type DbClient = Prisma.TransactionClient;
