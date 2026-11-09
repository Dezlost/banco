import { Cliente, Cuenta, Transaccion } from '@prisma/client';

/** Resumen de cuenta embebido en una transacción. */
export interface CuentaResumen {
  id: string;
  numeroCuenta: string;
}

export type TransaccionConCuentas = Transaccion & {
  cuentaOrigen?: CuentaResumen | null;
  cuentaDestino?: CuentaResumen | null;
};

/**
 * Serializa un cliente sin exponer el hash de la contraseña.
 */
export function serializarCliente(cliente: Cliente) {
  return {
    id: cliente.id,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    dni: cliente.dni,
    email: cliente.email,
    createdAt: cliente.createdAt,
    updatedAt: cliente.updatedAt,
  };
}

/**
 * Convierte los campos monetarios (Decimal) a número para la respuesta JSON.
 */
export function serializarCuenta(cuenta: Cuenta) {
  return {
    id: cuenta.id,
    numeroCuenta: cuenta.numeroCuenta,
    tipo: cuenta.tipo,
    saldo: Number(cuenta.saldo),
    estado: cuenta.estado,
    clienteId: cuenta.clienteId,
    createdAt: cuenta.createdAt,
    updatedAt: cuenta.updatedAt,
  };
}

export function serializarTransaccion(transaccion: TransaccionConCuentas) {
  return {
    id: transaccion.id,
    tipo: transaccion.tipo,
    monto: Number(transaccion.monto),
    saldoResultante: Number(transaccion.saldoResultante),
    descripcion: transaccion.descripcion,
    cuentaOrigen: transaccion.cuentaOrigen ?? null,
    cuentaDestino: transaccion.cuentaDestino ?? null,
    createdAt: transaccion.createdAt,
  };
}
