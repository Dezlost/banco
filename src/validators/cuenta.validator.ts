import { z } from 'zod';

export const crearCuentaSchema = z.object({
  tipo: z.enum(['AHORRO', 'CORRIENTE'], {
    errorMap: () => ({ message: 'El tipo debe ser AHORRO o CORRIENTE' }),
  }),
});

export type CrearCuentaInput = z.infer<typeof crearCuentaSchema>;
