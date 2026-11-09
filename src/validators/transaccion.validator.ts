import { z } from 'zod';
import { montoSchema } from './common.validator';

const descripcionSchema = z
  .string()
  .trim()
  .max(200, 'La descripción no puede superar los 200 caracteres')
  .optional();

export const depositoSchema = z.object({
  cuentaId: z.string().trim().min(1, 'cuentaId es obligatorio'),
  monto: montoSchema,
  descripcion: descripcionSchema,
});

export const retiroSchema = z.object({
  cuentaId: z.string().trim().min(1, 'cuentaId es obligatorio'),
  monto: montoSchema,
  descripcion: descripcionSchema,
});

export const transferenciaSchema = z
  .object({
    cuentaOrigenId: z.string().trim().min(1, 'cuentaOrigenId es obligatorio'),
    cuentaDestinoId: z.string().trim().min(1, 'cuentaDestinoId es obligatorio'),
    monto: montoSchema,
    descripcion: descripcionSchema,
  })
  .refine((datos) => datos.cuentaOrigenId !== datos.cuentaDestinoId, {
    message: 'La cuenta de origen y la de destino deben ser distintas',
    path: ['cuentaDestinoId'],
  });

export type DepositoInput = z.infer<typeof depositoSchema>;
export type RetiroInput = z.infer<typeof retiroSchema>;
export type TransferenciaInput = z.infer<typeof transferenciaSchema>;
