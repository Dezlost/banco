import { Cliente } from '@prisma/client';
import { DbClient, prisma } from '../lib/prisma';

export interface NuevoCliente {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  passwordHash: string;
}

/**
 * MODEL: acceso a datos de clientes.
 * Todas las funciones aceptan un cliente de BD opcional para poder
 * participar de una transacción de Prisma.
 */
export const clienteModel = {
  crear: (data: NuevoCliente, db: DbClient = prisma): Promise<Cliente> =>
    db.cliente.create({ data }),

  buscarPorId: (id: string, db: DbClient = prisma) => db.cliente.findUnique({ where: { id } }),

  buscarPorEmail: (email: string, db: DbClient = prisma) =>
    db.cliente.findUnique({ where: { email } }),

  buscarPorDni: (dni: string, db: DbClient = prisma) => db.cliente.findUnique({ where: { dni } }),
};
