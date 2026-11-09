import { Prisma } from '@prisma/client';
import { DbClient, prisma } from '../lib/prisma';
import { FiltrosTransaccion } from '../types/filtros';

/** Include estándar para devolver una transacción con sus cuentas resumidas. */
export const transaccionInclude = {
  cuentaOrigen: { select: { id: true, numeroCuenta: true } },
  cuentaDestino: { select: { id: true, numeroCuenta: true } },
} satisfies Prisma.TransaccionInclude;

export type TransaccionConCuentas = Prisma.TransaccionGetPayload<{
  include: typeof transaccionInclude;
}>;

function construirWhere(
  clienteId: string,
  filtros: FiltrosTransaccion,
): Prisma.TransaccionWhereInput {
  const where: Prisma.TransaccionWhereInput = {
    OR: [{ cuentaOrigen: { clienteId } }, { cuentaDestino: { clienteId } }],
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

  return where;
}

/**
 * MODEL: acceso a datos de transacciones.
 */
export const transaccionModel = {
  crear: (data: Prisma.TransaccionUncheckedCreateInput, db: DbClient = prisma) =>
    db.transaccion.create({ data, include: transaccionInclude }),

  listarPorCliente: (clienteId: string, filtros: FiltrosTransaccion, db: DbClient = prisma) =>
    db.transaccion.findMany({
      where: construirWhere(clienteId, filtros),
      orderBy: { createdAt: 'desc' },
      take: filtros.limite,
      include: transaccionInclude,
    }),
};
