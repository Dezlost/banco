import { Prisma } from '@prisma/client';
import { DbClient, prisma } from '../lib/prisma';
import { FiltrosTransaccion } from '../types/filtros';

const cuentaResumenInclude = {
  cuentaOrigen: { select: { id: true, numeroCuenta: true } },
  cuentaDestino: { select: { id: true, numeroCuenta: true } },
} satisfies Prisma.TransaccionInclude;

/**
 * MODEL: acceso a datos de cuentas.
 */
export const cuentaModel = {
  crear: (data: Prisma.CuentaUncheckedCreateInput, db: DbClient = prisma) =>
    db.cuenta.create({ data }),

  buscarPorId: (id: string, db: DbClient = prisma) => db.cuenta.findUnique({ where: { id } }),

  buscarPorNumero: (numeroCuenta: string, db: DbClient = prisma) =>
    db.cuenta.findUnique({ where: { numeroCuenta } }),

  listarPorCliente: (clienteId: string, db: DbClient = prisma) =>
    db.cuenta.findMany({ where: { clienteId }, orderBy: { createdAt: 'asc' } }),

  /** Incremento atómico del saldo. Devuelve la cuenta actualizada. */
  incrementarSaldo: (id: string, monto: Prisma.Decimal, db: DbClient = prisma) =>
    db.cuenta.update({ where: { id }, data: { saldo: { increment: monto } } }),

  /**
   * Decremento atómico y condicional: solo actualiza si la cuenta está activa
   * y tiene saldo suficiente. Devuelve la cantidad de filas afectadas.
   */
  decrementarSiAlcanza: (id: string, monto: Prisma.Decimal, db: DbClient = prisma) =>
    db.cuenta.updateMany({
      where: { id, estado: 'ACTIVA', saldo: { gte: monto } },
      data: { saldo: { decrement: monto } },
    }),

  listarMovimientos: (cuentaId: string, filtros: FiltrosTransaccion, db: DbClient = prisma) => {
    const where: Prisma.TransaccionWhereInput = {
      OR: [{ cuentaOrigenId: cuentaId }, { cuentaDestinoId: cuentaId }],
    };

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.desde || filtros.hasta) {
      where.createdAt = {
        ...(filtros.desde ? { gte: filtros.desde } : {}),
        ...(filtros.hasta ? { lte: filtros.hasta } : {}),
      };
    }

    return db.transaccion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filtros.limite,
      include: cuentaResumenInclude,
    });
  },
};
