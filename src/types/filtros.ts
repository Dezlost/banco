import { TipoTransaccion } from '@prisma/client';

/** Filtros comunes para consultar transacciones. */
export interface FiltrosTransaccion {
  tipo?: TipoTransaccion;
  desde?: Date;
  hasta?: Date;
  limite: number;
}
