import { Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * Monto monetario: acepta número o string, exige valor positivo
 * y como máximo dos decimales.
 */
export const montoSchema = z
  .union([z.number(), z.string()])
  .transform((valor, ctx) => {
    try {
      return new Prisma.Decimal(valor);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El monto debe ser un número válido',
      });
      return new Prisma.Decimal(0);
    }
  })
  .refine((monto) => monto.isFinite() && monto.gt(0), 'El monto debe ser mayor a cero')
  .refine((monto) => monto.decimalPlaces() <= 2, 'El monto admite como máximo 2 decimales');

const fechaOpcional = z.preprocess(
  (valor) => (valor === '' || valor === undefined ? undefined : valor),
  z.coerce.date().optional(),
);

/** Filtros para listados de movimientos/transacciones. */
export const filtrosTransaccionSchema = z
  .object({
    tipo: z.enum(['DEPOSITO', 'RETIRO', 'TRANSFERENCIA']).optional(),
    desde: fechaOpcional,
    hasta: fechaOpcional,
    limite: z.coerce.number().int().min(1).max(100).default(50),
  })
  .refine((filtros) => !filtros.desde || !filtros.hasta || filtros.desde <= filtros.hasta, {
    message: 'La fecha "desde" no puede ser posterior a "hasta"',
    path: ['desde'],
  });

export type FiltrosTransaccionInput = z.infer<typeof filtrosTransaccionSchema>;
